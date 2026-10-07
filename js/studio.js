/**
 * KALAKRITI - Interactive Canvas & Procedural Art Studio Engine
 * Provides two synchronized engines:
 * 1. Procedural Stroke-by-Stroke Animated Demo Player with Teacher Guidance
 * 2. Interactive Beginner Drawing Studio with Style-Specific Tools & Stencil Tracing
 */

class KalakritiStudio {
  constructor() {
    // Studio Canvas (Tab 4)
    this.canvas = null;
    this.ctx = null;
    this.traceCanvas = null;
    this.traceCtx = null;

    // Demo Canvas (Tab 3)
    this.demoCanvas = null;
    this.demoCtx = null;

    this.currentArt = null;

    // Interactive state (Studio)
    this.currentTool = 'nib'; // 'nib', 'brush', 'dot', 'hatch', 'goldLeaf', 'eraser'
    this.currentColor = '#1F1F1F';
    this.brushSize = 4;
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.showTraceGuide = true;

    // Undo / Redo history
    this.history = [];
    this.historyStep = -1;
    this.maxHistory = 25;

    // Animated Demo state (Demo Player)
    this.isDemoPlaying = false;
    this.demoCurrentStep = 0;
    this.demoSpeed = 4; // 1x, 2x, 4x (Superfast default)
    this.demoAnimId = null;
    this.demoStartTime = null;

    this.onStepChangeCallback = null;
  }

  init(studioCanvasId, traceCanvasId, demoCanvasId) {
    this.canvas = document.getElementById(studioCanvasId);
    if (this.canvas) this.ctx = this.canvas.getContext('2d');
    
    if (traceCanvasId) {
      this.traceCanvas = document.getElementById(traceCanvasId);
      if (this.traceCanvas) this.traceCtx = this.traceCanvas.getContext('2d');
    }

    if (demoCanvasId) {
      this.demoCanvas = document.getElementById(demoCanvasId);
      if (this.demoCanvas) this.demoCtx = this.demoCanvas.getContext('2d');
    }

    this.setupResolutions();
    this.bindEvents();
  }

  setupResolutions() {
    const dpr = window.devicePixelRatio || 1;

    // Studio Canvas
    if (this.canvas) {
      const rect = this.canvas.getBoundingClientRect();
      const width = rect.width > 0 ? rect.width : 800;
      const height = rect.height > 0 ? rect.height : 540;
      this.canvas.width = Math.round(width * dpr);
      this.canvas.height = Math.round(height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.logicalWidth = width;
      this.logicalHeight = height;
    }

    // Trace Canvas
    if (this.traceCanvas) {
      const rect = this.canvas ? this.canvas.getBoundingClientRect() : { width: 800, height: 540 };
      const width = rect.width > 0 ? rect.width : 800;
      const height = rect.height > 0 ? rect.height : 540;
      this.traceCanvas.width = Math.round(width * dpr);
      this.traceCanvas.height = Math.round(height * dpr);
      this.traceCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Demo Player Canvas
    if (this.demoCanvas) {
      const rect = this.demoCanvas.getBoundingClientRect();
      const width = rect.width > 0 ? rect.width : 800;
      const height = rect.height > 0 ? rect.height : 480;
      this.demoCanvas.width = Math.round(width * dpr);
      this.demoCanvas.height = Math.round(height * dpr);
      this.demoCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.demoLogicalWidth = width;
      this.demoLogicalHeight = height;
    }
  }

  loadArt(art) {
    this.currentArt = art;
    this.stopDemo();
    this.setupResolutions();

    // Cache authentic master artwork image for realistic painting demonstration
    if (!this.cachedArtImages) this.cachedArtImages = {};
    if (!this.cachedArtImages[art.id]) {
      const img = new Image();
      img.src = art.image;
      this.cachedArtImages[art.id] = img;
    }

    // Reset Studio Canvas
    this.clearCanvas(art.canvasDemo?.backgroundTone || '#FAF5EA');
    this.currentColor = art.canvasDemo?.defaultColor || art.beginnerTutorial?.colorPalette?.[0]?.hex || '#1F1F1F';
    this.renderTraceGuide();
    this.saveState();

    // Reset Demo Canvas
    this.clearDemoCanvas(art.canvasDemo?.backgroundTone || '#FAF5EA');

    // Build Stepper Pills for Demo Player
    this.renderStepperPills();
  }

  clearCanvas(bgColor) {
    if (!this.ctx) return;
    const color = bgColor || this.currentArt?.canvasDemo?.backgroundTone || '#FAF5EA';
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.logicalWidth || 800, this.logicalHeight || 540);
    this.renderCanvasTexture(this.ctx, this.logicalWidth || 800, this.logicalHeight || 540);
  }

  clearDemoCanvas(bgColor) {
    if (!this.demoCtx) return;
    const color = bgColor || this.currentArt?.canvasDemo?.backgroundTone || '#FAF5EA';
    this.demoCtx.fillStyle = color;
    this.demoCtx.fillRect(0, 0, this.demoLogicalWidth || 800, this.demoLogicalHeight || 480);
    this.renderCanvasTexture(this.demoCtx, this.demoLogicalWidth || 800, this.demoLogicalHeight || 480);
  }

  renderCanvasTexture(targetCtx, w, h) {
    targetCtx.save();
    targetCtx.fillStyle = 'rgba(0,0,0,0.015)';
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 1.5;
      targetCtx.beginPath();
      targetCtx.arc(x, y, r, 0, Math.PI * 2);
      targetCtx.fill();
    }
    targetCtx.restore();
  }

  saveState() {
    if (!this.ctx) return;
    this.historyStep++;
    if (this.historyStep < this.history.length) {
      this.history.length = this.historyStep;
    }
    this.history.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.historyStep--;
    }
  }

  undo() {
    if (this.historyStep > 0) {
      this.historyStep--;
      this.ctx.putImageData(this.history[this.historyStep], 0, 0);
    }
  }

  redo() {
    if (this.historyStep < this.history.length - 1) {
      this.historyStep++;
      this.ctx.putImageData(this.history[this.historyStep], 0, 0);
    }
  }

  // ==========================================
  // INTERACTIVE STUDIO DRAWING LISTENERS & TOOLS
  // ==========================================
  bindEvents() {
    if (!this.canvas) return;

    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const startDraw = (e) => {
      e.preventDefault();
      this.isDrawing = true;
      const { x, y } = getPos(e);
      this.lastX = x;
      this.lastY = y;
      this.drawStroke(x, y, x, y);
    };

    const moveDraw = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const { x, y } = getPos(e);
      this.drawStroke(this.lastX, this.lastY, x, y);
      this.lastX = x;
      this.lastY = y;
    };

    const endDraw = (e) => {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      this.saveState();
    };

    // Mouse
    this.canvas.addEventListener('mousedown', startDraw);
    window.addEventListener('mousemove', moveDraw);
    window.addEventListener('mouseup', endDraw);

    // Touch
    this.canvas.addEventListener('touchstart', startDraw, { passive: false });
    window.addEventListener('touchmove', moveDraw, { passive: false });
    window.addEventListener('touchend', endDraw);

    // Window resize
    window.addEventListener('resize', () => {
      this.setupResolutions();
    });
  }

  drawStroke(x1, y1, x2, y2) {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.save();

    if (this.currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = this.brushSize * 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    } else if (this.currentTool === 'nib') {
      ctx.strokeStyle = this.currentColor;
      ctx.lineWidth = Math.max(1, this.brushSize * 0.7);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    } else if (this.currentTool === 'brush') {
      ctx.strokeStyle = this.currentColor;
      ctx.fillStyle = this.currentColor;
      ctx.lineWidth = this.brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    } else if (this.currentTool === 'dot') {
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const spacing = Math.max(8, this.brushSize * 2.2);
      const count = Math.max(1, Math.floor(dist / spacing));
      ctx.fillStyle = this.currentColor;
      for (let i = 0; i <= count; i++) {
        const t = count === 0 ? 0 : i / count;
        const curX = x1 + (x2 - x1) * t;
        const curY = y1 + (y2 - y1) * t;
        ctx.beginPath();
        ctx.arc(curX, curY, this.brushSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.arc(curX, curY, Math.max(1, this.brushSize * 0.35), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = this.currentColor;
      }
    } else if (this.currentTool === 'hatch') {
      ctx.strokeStyle = this.currentColor;
      ctx.lineWidth = 1;
      const angle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
      const len = this.brushSize * 2;
      ctx.beginPath();
      ctx.moveTo(x2 - Math.cos(angle) * len, y2 - Math.sin(angle) * len);
      ctx.lineTo(x2 + Math.cos(angle) * len, y2 + Math.sin(angle) * len);
      ctx.stroke();
    } else if (this.currentTool === 'goldLeaf') {
      ctx.fillStyle = '#D4AF37';
      const count = Math.max(3, Math.floor(this.brushSize * 1.5));
      for (let i = 0; i < count; i++) {
        const offsetX = (Math.random() - 0.5) * this.brushSize * 3;
        const offsetY = (Math.random() - 0.5) * this.brushSize * 3;
        const r = Math.random() * (this.brushSize * 0.6) + 1;
        ctx.fillStyle = Math.random() > 0.4 ? '#FFD700' : '#E5B832';
        ctx.beginPath();
        ctx.arc(x2 + offsetX, y2 + offsetY, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // ==========================================
  // TRACING GUIDE OVERLAY
  // ==========================================
  renderTraceGuide() {
    if (!this.traceCtx) return;
    this.traceCtx.clearRect(0, 0, this.logicalWidth || 800, this.logicalHeight || 540);
    if (!this.showTraceGuide || !this.currentArt) return;

    const ctx = this.traceCtx;
    ctx.save();
    ctx.strokeStyle = 'rgba(160, 140, 110, 0.35)';
    ctx.fillStyle = 'rgba(160, 140, 110, 0.05)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    const id = this.currentArt.id;
    const w = this.logicalWidth || 800;
    const h = this.logicalHeight || 540;
    const cx = w / 2;
    const cy = h / 2;

    if (id === 'madhubani' || id === 'manjusha') {
      ctx.strokeRect(40, 40, w - 80, h - 80);
      ctx.strokeRect(55, 55, w - 110, h - 110);
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx - 140, cy, 100, 50, -Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 140, cy, 100, 50, Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();
    } else if (id === 'warli' || id === 'saura') {
      for (let r = 50; r <= 220; r += 50) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeRect(30, 30, w - 60, h - 60);
    } else if (id === 'tanjore' || id === 'mysore') {
      ctx.beginPath();
      ctx.arc(cx, cy - 40, 130, Math.PI, 0);
      ctx.lineTo(cx + 130, cy + 180);
      ctx.lineTo(cx - 130, cy + 180);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeRect(cx - 160, cy - 40, 30, 220);
      ctx.strokeRect(cx + 130, cy - 40, 30, 220);
      ctx.beginPath();
      ctx.arc(cx, cy + 30, 65, 0, Math.PI * 2);
      ctx.stroke();
    } else if (id === 'gond' || id === 'bhil') {
      ctx.beginPath();
      ctx.ellipse(cx, cy + 40, 140, 80, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 100, cy - 60, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - 90, cy - 100, 80, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeRect(40, 40, w - 80, h - 80);
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  toggleTraceGuide(visible) {
    this.showTraceGuide = visible !== undefined ? visible : !this.showTraceGuide;
    this.renderTraceGuide();
  }

  // ==========================================
  // PROCEDURAL ANIMATED DEMO & TEACHER ENGINE
  // ==========================================
  renderStepperPills() {
    const container = document.getElementById('demoStepperPills');
    if (!container || !this.currentArt) return;

    const steps = this.currentArt.beginnerTutorial?.steps || [];
    container.innerHTML = steps.map((s, idx) => `
      <button 
        class="stepper-pill ${idx === 0 ? 'active' : ''}" 
        id="stepperPill_${idx}" 
        onclick="kalakritiStudio.goToStep(${idx})"
        title="${s.phase}">
        <span>Phase ${idx + 1}</span>
      </button>
    `).join('');
  }

  updateTeacherCard(stepIdx) {
    if (!this.currentArt) return;
    const steps = this.currentArt.beginnerTutorial?.steps || [];
    const step = steps[stepIdx] || steps[0];
    const totalSteps = steps.length;

    // Header counter
    const counterBadge = document.getElementById('demoStepCounter');
    if (counterBadge) counterBadge.textContent = `Phase ${stepIdx + 1} of ${totalSteps}`;

    const descSpan = document.getElementById('demoStepDescription');
    if (descSpan) descSpan.textContent = step.phase.replace(/^Phase \d+:\s*/, '');

    // Teacher card
    const titleElem = document.getElementById('teacherPhaseTitle');
    if (titleElem) titleElem.textContent = step.phase;

    const textElem = document.getElementById('teacherInstructionsText');
    if (textElem) textElem.textContent = step.instructions;

    // Swatch & Tool
    const palette = this.currentArt.beginnerTutorial?.colorPalette || [];
    const activeColor = palette[stepIdx % palette.length] || { name: 'Lampblack', hex: '#1F1F1F' };

    const swatchElem = document.getElementById('teacherSwatch');
    if (swatchElem) swatchElem.style.backgroundColor = activeColor.hex;

    const colorNameElem = document.getElementById('teacherColorName');
    if (colorNameElem) colorNameElem.textContent = `${activeColor.name} (${activeColor.hex})`;

    // Pro-Tip
    const proTips = this.currentArt.beginnerTutorial?.proTips || [];
    const tipText = proTips[stepIdx % proTips.length] || 'Keep lines fluid and confident.';
    const tipElem = document.getElementById('teacherProTipText');
    if (tipElem) tipElem.textContent = tipText;

    // Floating Badge on Canvas
    const floatDot = document.getElementById('demoToolColorDot');
    if (floatDot) floatDot.style.backgroundColor = activeColor.hex;

    const floatTool = document.getElementById('demoToolName');
    if (floatTool) {
      const toolNames = ['Bamboo Kalam Nib', 'Fine Liner 00', 'Flat Wash Brush', 'Stippling Stylus', 'Gold Foil Leaf', 'Chitrakar Quill'];
      floatTool.textContent = toolNames[stepIdx % toolNames.length];
    }

    // Highlight Stepper Pills
    document.querySelectorAll('.stepper-pill').forEach((pill, idx) => {
      pill.classList.toggle('active', idx === stepIdx);
      pill.classList.toggle('completed', idx < stepIdx);
    });
  }

  startDemo(speed = 4) {
    if (!this.currentArt || !this.currentArt.canvasDemo) return;
    this.setupResolutions();
    this.demoSpeed = speed || 4;
    this.isDemoPlaying = true;
    this.demoCurrentStep = 0;
    this.clearDemoCanvas(this.currentArt.canvasDemo.backgroundTone);

    const playBtn = document.getElementById('demoPlayBtn');
    if (playBtn) playBtn.innerHTML = '⏸ Pause';

    this.demoStartTime = performance.now();
    this.updateTeacherCard(0);
    this.runDemoLoop();
  }

  toggleDemoPlayback() {
    if (this.isDemoPlaying) {
      this.pauseDemo();
    } else {
      this.resumeDemo();
    }
  }

  pauseDemo() {
    this.isDemoPlaying = false;
    if (this.demoAnimId) cancelAnimationFrame(this.demoAnimId);
    const playBtn = document.getElementById('demoPlayBtn');
    if (playBtn) playBtn.innerHTML = '▶ Play';
  }

  resumeDemo() {
    if (!this.currentArt) return;
    this.isDemoPlaying = true;
    this.demoStartTime = performance.now();
    const playBtn = document.getElementById('demoPlayBtn');
    if (playBtn) playBtn.innerHTML = '⏸ Pause';
    this.runDemoLoop();
  }

  stopDemo() {
    this.isDemoPlaying = false;
    if (this.demoAnimId) cancelAnimationFrame(this.demoAnimId);
    this.demoCurrentStep = 0;
    const playBtn = document.getElementById('demoPlayBtn');
    if (playBtn) playBtn.innerHTML = '▶ Play';
  }

  restartDemo() {
    this.stopDemo();
    this.startDemo(this.demoSpeed);
  }

  setSpeed(speed) {
    this.demoSpeed = speed;
  }

  goToStep(stepIdx) {
    this.pauseDemo();
    if (!this.currentArt) return;
    this.setupResolutions();
    this.demoCurrentStep = stepIdx;
    this.clearDemoCanvas(this.currentArt.canvasDemo?.backgroundTone);
    this.renderRealisticMasterpiecePainting(this.demoCtx, stepIdx, 1.0);
    this.updateTeacherCard(stepIdx);
  }

  nextStep() {
    const total = this.currentArt?.beginnerTutorial?.steps?.length || 6;
    if (this.demoCurrentStep < total - 1) {
      this.goToStep(this.demoCurrentStep + 1);
    }
  }

  prevStep() {
    if (this.demoCurrentStep > 0) {
      this.goToStep(this.demoCurrentStep - 1);
    }
  }

  runDemoLoop() {
    if (!this.isDemoPlaying || !this.currentArt) return;

    const totalPhases = this.currentArt.beginnerTutorial?.steps?.length || 6;
    if (this.demoCurrentStep >= totalPhases) {
      this.isDemoPlaying = false;
      const playBtn = document.getElementById('demoPlayBtn');
      if (playBtn) playBtn.innerHTML = '🔄 Replay';
      return;
    }

    const stepDuration = 1800 / this.demoSpeed; // Superfast execution (450ms at 4x)
    const elapsed = performance.now() - this.demoStartTime;
    const progress = Math.min(1, elapsed / stepDuration);

    this.renderRealisticMasterpiecePainting(this.demoCtx, this.demoCurrentStep, progress);
    this.updateTeacherCard(this.demoCurrentStep);

    if (progress >= 1) {
      this.demoCurrentStep++;
      this.demoStartTime = performance.now();
    }

    this.demoAnimId = requestAnimationFrame(() => this.runDemoLoop());
  }

  // ==========================================
  // AUTHENTIC MASTERPIECE PAINTING DEMONSTRATION
  // ==========================================
  renderRealisticMasterpiecePainting(ctx, phaseIdx, progress) {
    if (!ctx || !this.currentArt) return;
    const w = this.demoLogicalWidth || 800;
    const h = this.demoLogicalHeight || 480;
    const cx = w / 2;
    const cy = h / 2;
    const art = this.currentArt;
    const bgTone = art.canvasDemo?.backgroundTone || '#FAF5EA';
    const img = this.cachedArtImages?.[art.id];

    ctx.save();

    // 1. BASE LAYER: Surface Priming & Traditional Wash
    ctx.fillStyle = bgTone;
    ctx.fillRect(0, 0, w, h);
    this.renderCanvasTexture(ctx, w, h);

    // Inset margins for canonical border frame
    const inset = 24;
    const innerW = w - inset * 2;
    const innerH = h - inset * 2;

    // Phase 0: Surface Priming & Tonal Wash
    if (phaseIdx === 0) {
      const washWidth = w * progress;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.035)';
      ctx.fillRect(0, 0, washWidth, h);

      // Sweeping diagonal wet brush strokes
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.lineWidth = 32;
      for (let i = 0; i < 6; i++) {
        const yPos = (h / 6) * i + 25;
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(washWidth, yPos + Math.sin(progress * 6 + i) * 12);
        ctx.stroke();
      }

      this.drawArtisanBrushCursor(ctx, washWidth, h * 0.4 + Math.sin(progress * 8) * 50, 'wash', bgTone);
      ctx.restore();
      return;
    }

    // 2. CANONICAL DOUBLE BORDER
    const borderProgress = phaseIdx === 1 ? progress : 1.0;
    ctx.strokeStyle = art.canvasDemo?.defaultColor || '#1F1F1F';
    ctx.lineWidth = 3;
    ctx.strokeRect(inset, inset, innerW, innerH);
    ctx.strokeRect(inset + 8, inset + 8, innerW - 16, innerH - 16);

    // Corner decorative rosettes
    const drawRosette = (rx, ry) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 6, 0, Math.PI * 2);
      ctx.stroke();
    };
    drawRosette(inset + 4, inset + 4);
    drawRosette(w - inset - 4, inset + 4);
    drawRosette(inset + 4, h - inset - 4);
    drawRosette(w - inset - 4, h - inset - 4);

    // Image destination dimensions
    const pad = 18;
    const destX = inset + pad;
    const destY = inset + pad;
    const destW = innerW - pad * 2;
    const destH = innerH - pad * 2;

    let brushX = cx;
    let brushY = cy;

    // 3. MASTER ARTWORK LAYER PROGRESSION
    if (img && img.complete && img.naturalWidth > 0) {
      if (phaseIdx === 1) {
        // Phase 2: Charcoal Underdrawing & Proportions
        ctx.save();
        ctx.globalAlpha = Math.min(0.65, 0.2 + progress * 0.45);
        ctx.filter = 'grayscale(100%) contrast(180%) sepia(90%)';
        ctx.drawImage(img, destX, destY, destW, destH);
        ctx.restore();

        // Charcoal proportion guideline circle
        ctx.strokeStyle = 'rgba(60, 45, 35, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, 75 * progress, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        brushX = cx + Math.cos(progress * Math.PI * 4) * 65;
        brushY = cy + Math.sin(progress * Math.PI * 4) * 65;
        this.drawArtisanBrushCursor(ctx, brushX, brushY, 'charcoal', '#3D342D');

      } else if (phaseIdx === 2) {
        // Phase 3: Bold Organic Mineral Ink Contouring
        // Underdrawing faintly visible
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.filter = 'grayscale(100%) contrast(150%) sepia(80%)';
        ctx.drawImage(img, destX, destY, destW, destH);
        ctx.restore();

        // Deep mineral ink outlines emerging progressively
        ctx.save();
        ctx.globalAlpha = Math.min(1.0, 0.4 + progress * 0.6);
        ctx.filter = 'grayscale(100%) contrast(350%) brightness(90%)';
        ctx.beginPath();
        ctx.rect(destX, destY, destW * progress, destH);
        ctx.clip();
        ctx.drawImage(img, destX, destY, destW, destH);
        ctx.restore();

        brushX = destX + destW * progress;
        brushY = cy + Math.sin(progress * 12) * (destH * 0.35);
        this.drawArtisanBrushCursor(ctx, brushX, brushY, 'kalam', '#1F1F1F');

      } else if (phaseIdx === 3) {
        // Phase 4: Flat Mineral Pigment Infill & Washes
        // Base ink outlines visible
        ctx.save();
        ctx.globalAlpha = 0.75;
        ctx.filter = 'grayscale(100%) contrast(250%)';
        ctx.drawImage(img, destX, destY, destW, destH);
        ctx.restore();

        // Rich colors flowing in
        ctx.save();
        ctx.globalAlpha = Math.min(0.9, 0.3 + progress * 0.6);
        ctx.filter = 'saturate(130%) contrast(110%)';
        ctx.beginPath();
        const maxRadius = Math.hypot(destW, destH) * 0.6;
        ctx.arc(cx, cy, maxRadius * progress, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, destX, destY, destW, destH);
        ctx.restore();

        const activePigment = art.beginnerTutorial?.colorPalette?.[1]?.hex || '#C73E28';
        brushX = cx + Math.cos(progress * 10) * (destW * 0.4 * progress);
        brushY = cy + Math.sin(progress * 10) * (destH * 0.4 * progress);
        this.drawArtisanBrushCursor(ctx, brushX, brushY, 'brush', activePigment);

      } else if (phaseIdx === 4) {
        // Phase 5: Intricate Linework, Hatching (Kachni) & Stippling
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.filter = 'saturate(115%) contrast(115%)';
        ctx.drawImage(img, destX, destY, destW, destH);
        ctx.restore();

        brushX = cx + Math.sin(progress * 15) * 85;
        brushY = cy + Math.cos(progress * 15) * 65;
        const activeDetailColor = art.beginnerTutorial?.colorPalette?.[0]?.hex || '#1F1F1F';
        this.drawArtisanBrushCursor(ctx, brushX, brushY, 'liner', activeDetailColor);

      } else if (phaseIdx >= 5) {
        // Phase 6: Final 24K Gold Foil Embellishment & Sacred Netra Daan
        ctx.save();
        ctx.globalAlpha = 1.0;
        ctx.drawImage(img, destX, destY, destW, destH);
        ctx.restore();

        // 24K Gold Leaf shimmer accent
        ctx.save();
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(destX - 2, destY - 2, destW + 4, destH + 4);

        // Golden spark particles
        const numSparks = Math.floor(12 * progress);
        for (let s = 0; s < numSparks; s++) {
          const sx = destX + Math.sin(s * 1.7) * (destW * 0.4) + destW * 0.5;
          const sy = destY + Math.cos(s * 2.3) * (destH * 0.4) + destH * 0.5;
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(sx, sy, 2.5 + Math.sin(progress * 8 + s) * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        brushX = destX + destW * 0.5;
        brushY = destY + destH * 0.35;
        this.drawArtisanBrushCursor(ctx, brushX, brushY, 'gold', '#D4AF37');
      }

    } else {
      // Fallback: Organic hand-drawn motifs
      this.renderOrganicTraditionalFallback(ctx, art, phaseIdx, progress, cx, cy, w, h);
    }

    ctx.restore();
  }

  // Draw moving authentic wooden artisan brush cursor
  drawArtisanBrushCursor(ctx, x, y, toolType, pigmentHex) {
    ctx.save();
    ctx.translate(x, y);

    // Wet paint ripple at contact point
    ctx.fillStyle = pigmentHex || '#1F1F1F';
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    // Brush tilt
    ctx.rotate(-Math.PI / 4);

    // Natural hair bristles
    ctx.fillStyle = '#2B1D15';
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(3, 0);
    ctx.lineTo(2, -18);
    ctx.lineTo(-2, -18);
    ctx.closePath();
    ctx.fill();

    // Active pigment tip
    ctx.fillStyle = pigmentHex || '#1F1F1F';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    // Golden brass ferrule
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(-3.5, -28, 7, 10);

    // Wooden bamboo handle
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(-3, -75, 6, 47);

    ctx.restore();
  }

  // Organic traditional fallback if image is still loading
  renderOrganicTraditionalFallback(ctx, art, phaseIdx, progress, cx, cy, w, h) {
    const color = art.beginnerTutorial?.colorPalette?.[phaseIdx % (art.beginnerTutorial?.colorPalette?.length || 1)]?.hex || '#1F1F1F';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;

    // Concentric sacred lotus mandala
    const petals = Math.floor(12 * progress);
    for (let p = 0; p < petals; p++) {
      const angle = (p * Math.PI * 2) / 12;
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(angle) * 60, cy + Math.sin(angle) * 60, 40, 20, angle, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();
    this.drawArtisanBrushCursor(ctx, cx, cy, 'kalam', color);
  }

  // ==========================================
  // EXPORT MASTERPIECE (PNG WITH FRAME)
  // ==========================================
  exportArtworkPNG() {
    const srcCanvas = this.canvas || this.demoCanvas;
    if (!srcCanvas) return;

    const offscreen = document.createElement('canvas');
    const width = 1200;
    const height = 900;
    offscreen.width = width;
    offscreen.height = height;
    const octx = offscreen.getContext('2d');

    // Royal Wood Frame
    octx.fillStyle = '#1A1412';
    octx.fillRect(0, 0, width, height);

    // Gilded Inner Border
    octx.strokeStyle = '#D4AF37';
    octx.lineWidth = 6;
    octx.strokeRect(30, 30, width - 60, height - 60);
    octx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    octx.lineWidth = 2;
    octx.strokeRect(40, 40, width - 80, height - 80);

    // Draw user canvas content centered
    octx.drawImage(srcCanvas, 60, 60, width - 120, height - 170);

    // Bottom Plaque & Artist Stamp
    octx.fillStyle = '#0F0E0D';
    octx.fillRect(width / 2 - 260, height - 90, 520, 65);
    octx.strokeStyle = '#D4AF37';
    octx.lineWidth = 1.5;
    octx.strokeRect(width / 2 - 256, height - 86, 512, 57);

    // Text Inscription
    octx.fillStyle = '#D4AF37';
    octx.font = 'bold 20px "Cinzel", Georgia, serif';
    octx.textAlign = 'center';
    const artName = this.currentArt ? this.currentArt.title : 'Indian Heritage Art';
    octx.fillText(artName.toUpperCase(), width / 2, height - 58);

    octx.fillStyle = '#E5E0D5';
    octx.font = 'italic 13px "Plus Jakarta Sans", sans-serif';
    octx.fillText('Masterclass Creation • Kalakriti National Digital Art Gallery', width / 2, height - 38);

    const link = document.createElement('a');
    link.download = `Kalakriti_${(this.currentArt?.id || 'artwork')}_masterpiece.png`;
    link.href = offscreen.toDataURL('image/png');
    link.click();
  }
}

// Global studio instance
window.kalakritiStudio = new KalakritiStudio();
