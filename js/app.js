/**
 * KALAKRITI - Core Application Architecture & UI State Controller
 * Orchestrates Gallery Filtering, Search, Exhibition Hall, Modal Masterclasses,
 * Web Audio Ambient Soundscapes, and Favorites Persistence.
 */

class KalakritiApp {
  constructor() {
    this.artData = ART_FORMS || [];
    this.currentFilterRegion = 'all';
    this.currentFilterCategory = 'all';
    this.currentFilterDifficulty = 'all';
    this.searchQuery = '';
    this.activeArt = null;
    this.activeModalTab = 'history';
    this.favorites = this.loadFavorites();
    this.isExhibitionOpen = false;
    this.exhibitionIndex = 0;

    // Web Audio Ambience Synth
    this.audioCtx = null;
    this.isAudioPlaying = false;
    this.audioNodes = [];
  }

  init() {
    this.renderGallery();
    this.setupFilters();
    this.setupSearch();
    this.setupModals();
    this.setupAudioAmbience();
    this.setupFavoritesDrawer();
    this.setupExhibitionHall();
    this.updateStats();

    // Studio Canvas & Live Demo Canvas Setup
    window.kalakritiStudio.init('studioCanvas', 'traceCanvas', 'demoPlayerCanvas');
  }

  // ==========================================
  // GALLERY RENDERING & FILTERING
  // ==========================================
  getFilteredArts() {
    return this.artData.filter(art => {
      const matchRegion = this.currentFilterRegion === 'all' || art.region.toLowerCase().includes(this.currentFilterRegion.toLowerCase());
      const matchCategory = this.currentFilterCategory === 'all' || art.category.toLowerCase().includes(this.currentFilterCategory.toLowerCase());
      const matchDifficulty = this.currentFilterDifficulty === 'all' || art.difficulty.toLowerCase() === this.currentFilterDifficulty.toLowerCase();
      
      let matchSearch = true;
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        const haystack = `${art.title} ${art.nativeName || ''} ${art.state} ${art.district || ''} ${art.category} ${art.summary} ${art.medium} ${art.era}`.toLowerCase();
        matchSearch = haystack.includes(q);
      }

      return matchRegion && matchCategory && matchDifficulty && matchSearch;
    });
  }

  renderGallery() {
    const grid = document.getElementById('galleryGrid');
    const filtered = this.getFilteredArts();
    const countBadge = document.getElementById('galleryCountBadge');
    if (countBadge) countBadge.textContent = `${filtered.length} Art Forms Found`;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🪷</div>
          <h3>No Art Traditions Found</h3>
          <p>No classical forms match your search criteria. Try resetting your filters or search terms.</p>
          <button class="btn btn-gold" onclick="app.resetFilters()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map((art, idx) => {
      const isFav = this.favorites.includes(art.id);
      return `
        <article class="art-card" data-id="${art.id}" style="--accent-color: ${art.accentColor}; animation-delay: ${idx * 40}ms">
          <div class="card-media">
            <img 
              src="${art.image}" 
              alt="${art.title}" 
              loading="lazy" 
              onerror="this.onerror=null; this.src='assets/images/hero_banner.jpg';"
            />
            <div class="card-badges">
              <span class="badge badge-state">📍 ${art.state}</span>
              <span class="badge badge-diff diff-${art.difficulty.toLowerCase()}">${art.difficulty}</span>
            </div>
            <button class="card-fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); app.toggleFavorite('${art.id}')" title="Save to Curation" aria-label="Bookmark art">
              ${isFav ? '★' : '☆'}
            </button>
          </div>
          <div class="card-body">
            <div class="card-meta">
              <span class="card-era">${art.era}</span>
              <span class="card-gi">${art.giStatus}</span>
            </div>
            <h3 class="card-title">${art.title}</h3>
            ${art.nativeName ? `<p class="card-native">${art.nativeName}</p>` : ''}
            <p class="card-summary">${art.summary}</p>
            <div class="card-palette">
              ${art.beginnerTutorial.colorPalette.slice(0, 5).map(c => `
                <span class="palette-dot" style="background-color: ${c.hex}" title="${c.name}"></span>
              `).join('')}
              <span class="palette-more">+${art.beginnerTutorial.colorPalette.length} shades</span>
            </div>
          </div>
          <div class="card-footer">
            <button class="btn btn-outline" onclick="event.stopPropagation(); app.openArtModal('${art.id}', 'ideas')" title="View 4 Authentic Masterpiece Ideas">
              🖼️ Ideas (4)
            </button>
            <button class="btn btn-outline" onclick="event.stopPropagation(); app.openArtModal('${art.id}', 'demo')" title="Watch Real Painting Demonstration">
              🎬 Real Demo
            </button>
            <button class="btn btn-gold" onclick="event.stopPropagation(); app.openArtModal('${art.id}', 'masterclass')" title="Start Beginner Masterclass">
              🎨 Masterclass
            </button>
          </div>
        </article>
      `;
    }).join('');

    // Attach card click handlers for quick view
    document.querySelectorAll('.art-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          const id = card.getAttribute('data-id');
          this.openArtModal(id, 'history');
        }
      });
    });
  }

  setupFilters() {
    // Region Pills
    document.querySelectorAll('[data-filter-region]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter-region]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilterRegion = btn.getAttribute('data-filter-region');
        this.renderGallery();
      });
    });

    // Category Select
    const categorySelect = document.getElementById('categoryFilter');
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.currentFilterCategory = e.target.value;
        this.renderGallery();
      });
    }

    // Difficulty Select
    const diffSelect = document.getElementById('difficultyFilter');
    if (diffSelect) {
      diffSelect.addEventListener('change', (e) => {
        this.currentFilterDifficulty = e.target.value;
        this.renderGallery();
      });
    }
  }

  setupSearch() {
    const searchInput = document.getElementById('artSearchInput');
    const searchClear = document.getElementById('searchClearBtn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        if (searchClear) searchClear.style.display = this.searchQuery ? 'block' : 'none';
        this.renderGallery();
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.searchQuery = '';
        searchClear.style.display = 'none';
        this.renderGallery();
      });
    }
  }

  resetFilters() {
    this.currentFilterRegion = 'all';
    this.currentFilterCategory = 'all';
    this.currentFilterDifficulty = 'all';
    this.searchQuery = '';

    document.querySelectorAll('[data-filter-region]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-filter-region') === 'all');
    });

    const categorySelect = document.getElementById('categoryFilter');
    if (categorySelect) categorySelect.value = 'all';

    const diffSelect = document.getElementById('difficultyFilter');
    if (diffSelect) diffSelect.value = 'all';

    const searchInput = document.getElementById('artSearchInput');
    if (searchInput) searchInput.value = '';

    const searchClear = document.getElementById('searchClearBtn');
    if (searchClear) searchClear.style.display = 'none';

    this.renderGallery();
  }

  updateStats() {
    const statArts = document.getElementById('statTotalArts');
    if (statArts) statArts.textContent = `${this.artData.length}+`;
  }

  // ==========================================
  // MASTERCLASS DETAIL MODAL CONTROLLER
  // ==========================================
  setupModals() {
    const modal = document.getElementById('artModal');
    const closeBtn = document.getElementById('modalCloseBtn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeArtModal());
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeArtModal();
      });
    }

    // Modal tabs
    document.querySelectorAll('[data-modal-tab]').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        const tabName = tabBtn.getAttribute('data-modal-tab');
        this.switchModalTab(tabName);
      });
    });

    // Escape key listener
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeArtModal();
        this.closeExhibitionHall();
        this.closeFavoritesDrawer();
      }
    });
  }

  openArtModal(artId, defaultTab = 'history') {
    const art = this.artData.find(a => a.id === artId);
    if (!art) return;
    this.activeArt = art;

    const modal = document.getElementById('artModal');
    if (!modal) return;

    // Populate Hero Header
    document.getElementById('modalTitle').textContent = art.title;
    document.getElementById('modalState').textContent = `📍 ${art.state} (${art.district || art.region})`;
    document.getElementById('modalEra').textContent = `⏳ ${art.era}`;
    document.getElementById('modalGI').textContent = `🛡️ ${art.giStatus}`;
    document.getElementById('modalHeroImg').src = art.image;
    document.getElementById('modalHeroImg').onerror = () => {
      document.getElementById('modalHeroImg').src = 'assets/images/hero_banner.jpg';
    };

    // Populate Tab 1: Historical Odyssey
    const hist = art.history;
    document.getElementById('historyOrigin').textContent = hist.origin;
    document.getElementById('historyPatrons').textContent = hist.patrons;
    document.getElementById('historySymbolism').textContent = hist.symbolism;
    document.getElementById('historyStyles').textContent = hist.styles || 'Traditional canonical techniques.';
    document.getElementById('historyMasters').textContent = hist.livingMasters;
    document.getElementById('historyGlobal').textContent = hist.globalRecognition;

    // Populate Tab 2: Beginner Masterclass
    const tut = art.beginnerTutorial;
    document.getElementById('tutTimeEstimate').textContent = `⏱️ Estimated Learning Time: ${tut.timeEstimate}`;

    // Supplies
    const beginnerSuppliesList = document.getElementById('beginnerSuppliesList');
    beginnerSuppliesList.innerHTML = tut.supplies.beginnerKit.map(item => `
      <li><input type="checkbox" id="chk_${Math.random()}"> <label>${item}</label></li>
    `).join('');

    const traditionalSuppliesList = document.getElementById('traditionalSuppliesList');
    traditionalSuppliesList.innerHTML = tut.supplies.traditional.map(item => `
      <li><input type="checkbox" id="chk_${Math.random()}"> <label>${item}</label></li>
    `).join('');

    // Palette
    const paletteRow = document.getElementById('modalPaletteRow');
    paletteRow.innerHTML = tut.colorPalette.map(c => `
      <div class="swatch-card" onclick="navigator.clipboard.writeText('${c.hex}'); alert('Copied ${c.name} (${c.hex}) to clipboard!');">
        <div class="swatch-square" style="background-color: ${c.hex}"></div>
        <div class="swatch-info">
          <strong>${c.name}</strong>
          <code>${c.hex}</code>
          <small>${c.origin}</small>
        </div>
      </div>
    `).join('');

    // Steps
    const stepsContainer = document.getElementById('tutorialStepsContainer');
    stepsContainer.innerHTML = tut.steps.map((s, idx) => `
      <div class="step-card">
        <div class="step-badge">${idx + 1}</div>
        <div class="step-details">
          <h4>${s.phase}</h4>
          <p>${s.instructions}</p>
        </div>
      </div>
    `).join('');

    // Pro-Tips
    const proTipsList = document.getElementById('proTipsList');
    proTipsList.innerHTML = tut.proTips.map(tip => `<li>${tip}</li>`).join('');

    // Populate Tab 3: Live Video & Canvas Demo
    const videoIframe = document.getElementById('demoVideoIframe');
    if (videoIframe && tut?.videoTutorialUrl) {
      videoIframe.src = this.getEmbedUrl(tut.videoTutorialUrl);
    }
    const videoTitle = document.getElementById('videoArtTitle');
    if (videoTitle) {
      videoTitle.textContent = `${art.title} — Master Artisan Video Masterclass`;
    }
    const videoDesc = document.getElementById('videoArtDescription');
    if (videoDesc) {
      videoDesc.textContent = `Watch master artisans demonstrate classical ${art.title} methods (${art.state}, ${art.era}). Learn traditional brush grips, natural pigment mixing, and sacred motif detailing.`;
    }

    // Populate Video Chapters Navigation
    const chaptersBar = document.getElementById('videoChaptersBar');
    if (chaptersBar && tut?.videoChapters) {
      chaptersBar.innerHTML = tut.videoChapters.map((ch, idx) => `
        <button class="video-chapter-btn ${idx === 0 ? 'active' : ''}" onclick="app.seekVideoChapter(${ch.seconds}, this)" title="${ch.title}">
          <span>⏱️ ${ch.time}</span>
          <span>${ch.title}</span>
        </button>
      `).join('');
    }

    // Populate Tab 4: Real Masterpiece Ideas & Inspiration Gallery
    this.renderMasterpieceIdeas(art);

    // Default to animated canvas masterclass view
    this.setDemoMode('canvas');

    // Load into studio engine
    window.kalakritiStudio.loadArt(art);

    // Populate Studio Palette in Tab 5
    this.renderStudioPalette(art);

    // Open modal & select tab
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.switchModalTab(defaultTab);
  }

  getEmbedUrl(url) {
    if (!url) return '';
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0];
    } else if (url.includes('embed/')) {
      return url;
    }
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0` : url;
  }

  setDemoMode(mode) {
    const isCanvas = mode === 'canvas';
    const btnCanvas = document.getElementById('btnModeCanvas');
    const btnVideo = document.getElementById('btnModeVideo');
    const canvasSec = document.getElementById('demoCanvasSection');
    const videoSec = document.getElementById('demoVideoSection');

    if (btnCanvas) btnCanvas.classList.toggle('active', isCanvas);
    if (btnVideo) btnVideo.classList.toggle('active', !isCanvas);
    if (canvasSec) canvasSec.classList.toggle('active', isCanvas);
    if (videoSec) videoSec.classList.toggle('active', !isCanvas);

    if (isCanvas) {
      if (window.kalakritiStudio && this.activeArt) {
        window.kalakritiStudio.startDemo(window.kalakritiStudio.demoSpeed || 4);
      }
    } else {
      if (window.kalakritiStudio) {
        window.kalakritiStudio.pauseDemo();
      }
    }
  }

  transferDemoToStudio() {
    if (window.kalakritiStudio && window.kalakritiStudio.demoCanvas && window.kalakritiStudio.ctx) {
      const demoCanvas = window.kalakritiStudio.demoCanvas;
      const studioCtx = window.kalakritiStudio.ctx;
      const lw = window.kalakritiStudio.logicalWidth || 800;
      const lh = window.kalakritiStudio.logicalHeight || 540;
      studioCtx.drawImage(demoCanvas, 0, 0, demoCanvas.width, demoCanvas.height, 0, 0, lw, lh);
      window.kalakritiStudio.saveState();
    }
    this.switchModalTab('studio');
  }

  closeArtModal() {
    const modal = document.getElementById('artModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
    window.kalakritiStudio.stopDemo();

    // Mute / stop video iframe playback immediately upon closing modal
    const videoIframe = document.getElementById('demoVideoIframe');
    if (videoIframe) videoIframe.src = '';
  }

  switchModalTab(tabName) {
    this.activeModalTab = tabName;
    document.querySelectorAll('[data-modal-tab]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-modal-tab') === tabName);
    });

    document.querySelectorAll('.modal-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tabName}`);
    });

    if (tabName === 'demo' && this.activeArt) {
      // Auto-start demo preview superfast at 4x speed
      setTimeout(() => {
        if (window.kalakritiStudio) {
          window.kalakritiStudio.startDemo(4);
        }
      }, 50);
    } else {
      if (window.kalakritiStudio) {
        window.kalakritiStudio.pauseDemo();
      }
    }
  }

  // ==========================================
  // REAL MASTERPIECE IDEAS & VIDEO CHAPTERS
  // ==========================================
  seekVideoChapter(seconds, btn) {
    document.querySelectorAll('.video-chapter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const iframe = document.getElementById('demoVideoIframe');
    if (iframe && this.activeArt?.beginnerTutorial?.videoTutorialUrl) {
      const baseEmbed = this.getEmbedUrl(this.activeArt.beginnerTutorial.videoTutorialUrl);
      iframe.src = `${baseEmbed}&start=${seconds}&autoplay=1`;
    }
  }

  renderMasterpieceIdeas(art) {
    const grid = document.getElementById('masterpieceIdeasGrid');
    if (!grid) return;
    const ideas = art.ideas || [];
    grid.innerHTML = ideas.map((idea, idx) => `
      <div class="idea-card">
        <div class="idea-card-header">
          <span class="idea-theme-pill">${idea.theme}</span>
          <span class="idea-diff-badge">${idea.difficulty}</span>
        </div>
        <div class="idea-card-body">
          <h4 class="idea-title">${idea.title}</h4>
          ${idea.nativeTitle ? `<p class="idea-native-title">${idea.nativeTitle}</p>` : ''}
          <div class="idea-composition-box">
            <strong>Composition Blueprint:</strong>
            <p>${idea.composition}</p>
          </div>
          <p class="idea-meaning-text">🪷 <em>Symbolism:</em> ${idea.meaning}</p>
        </div>
        <div class="idea-palette-row">
          <span>Palette:</span>
          <div class="idea-swatch-list">
            ${idea.palette.map(hex => `
              <span class="idea-swatch-dot" style="background-color: ${hex};" title="${hex}"></span>
            `).join('')}
          </div>
        </div>
        <div class="idea-card-footer">
          <button class="btn btn-gold" onclick="app.loadIdeaIntoStudio(${idx})" style="width: 100%;">
            🖌️ Practice This Idea in Studio
          </button>
        </div>
      </div>
    `).join('');
  }

  loadIdeaIntoStudio(ideaIdx) {
    if (!this.activeArt) return;
    const idea = this.activeArt.ideas?.[ideaIdx];
    if (idea && idea.palette?.[0]) {
      window.kalakritiStudio.currentColor = idea.palette[0];
    }
    this.switchModalTab('studio');
  }

  // ==========================================
  // AI ARTISAN MUSE (GENERATIVE IDEA STUDIO)
  // ==========================================
  openAIMuseModal(preselectedArtId = null) {
    const modal = document.getElementById('aiMuseModal');
    if (!modal) return;
    
    // Populate art form select if empty
    const select = document.getElementById('aiArtSelect');
    if (select && select.options.length === 0) {
      select.innerHTML = this.artData.map(a => `
        <option value="${a.id}">${a.title} (${a.state})</option>
      `).join('');
    }

    if (preselectedArtId && select) {
      select.value = preselectedArtId;
    } else if (this.activeArt && select) {
      select.value = this.activeArt.id;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeAIMuseModal() {
    const modal = document.getElementById('aiMuseModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  openAIMuseForCurrentArt() {
    if (this.activeArt) {
      this.openAIMuseModal(this.activeArt.id);
    } else {
      this.openAIMuseModal();
    }
  }

  async generateAIIdea() {
    const artId = document.getElementById('aiArtSelect')?.value || 'madhubani';
    const theme = document.getElementById('aiThemeSelect')?.value || 'nature';
    const skillLevel = document.getElementById('aiSkillSelect')?.value || 'intermediate';
    const customSeed = document.getElementById('aiCustomSeedInput')?.value || '';

    const btn = document.getElementById('btnGenerateAIIdea');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '✨ Consulting Master Artisan Scribes...';
    }

    try {
      const idea = await window.aiArtisanMuse.generateIdea({
        artId, theme, skillLevel, customSeed
      });
      this.displayAIIdeaResult(idea);
    } catch (e) {
      alert("AI Idea Generation error: " + e.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '✨ Generate Masterpiece Idea';
      }
    }
  }

  displayAIIdeaResult(idea) {
    this.currentAIIdea = idea;
    const card = document.getElementById('aiResultCard');
    if (!card) return;

    document.getElementById('aiResultBadge').textContent = `${idea.artTradition} • ${idea.skillLevel} • ${idea.estimatedTime}`;
    document.getElementById('aiResultTitle').textContent = idea.title;
    document.getElementById('aiResultNative').textContent = idea.nativeTitle || '';
    document.getElementById('aiResultNarrative').textContent = idea.philosophicalNarrative;

    // Blueprint
    const bpList = document.getElementById('aiResultBlueprint');
    bpList.innerHTML = idea.compositionBlueprint.map(b => `<li>${b}</li>`).join('');

    // Palette
    const palRow = document.getElementById('aiResultPalette');
    palRow.innerHTML = idea.mineralPalette.map(p => `
      <div class="ai-swatch-item">
        <span class="ai-swatch-color" style="background-color: ${p.hex}"></span>
        <div class="ai-swatch-info">
          <span class="ai-swatch-name">${p.name}</span>
          <span class="ai-swatch-hex">${p.hex}</span>
        </div>
      </div>
    `).join('');

    // Steps
    const stepsRow = document.getElementById('aiResultSteps');
    stepsRow.innerHTML = idea.artisanSteps.map(s => `
      <div class="ai-step-row">
        <div class="ai-step-num">${s.step}</div>
        <div class="ai-step-content">
          <strong>${s.phase}</strong>
          <p>${s.action}</p>
        </div>
      </div>
    `).join('');

    // Tips
    const tipsList = document.getElementById('aiResultTips');
    tipsList.innerHTML = idea.masterTips.map(t => `<li>${t}</li>`).join('');

    card.style.display = 'flex';
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  applyAIIdeaToStudio() {
    if (!this.currentAIIdea) return;
    this.closeAIMuseModal();
    const art = this.artData.find(a => a.id === this.currentAIIdea.artId) || this.activeArt;
    if (art) {
      this.openArtModal(art.id, 'studio');
      if (this.currentAIIdea.mineralPalette?.[0]?.hex) {
        window.kalakritiStudio.currentColor = this.currentAIIdea.mineralPalette[0].hex;
      }
    }
  }

  // ==========================================
  // VIRTUAL HERITAGE WALL AR PREVIEWER
  // ==========================================
  openWallPreview(art = null) {
    const targetArt = art || this.activeArt || this.artData[0];
    window.wallPreviewer.open(targetArt);
  }

  openStudioWallPreview() {
    if (window.kalakritiStudio?.canvas) {
      const dataUrl = window.kalakritiStudio.canvas.toDataURL('image/png');
      window.wallPreviewer.open(this.activeArt, dataUrl);
    }
  }

  renderStudioPalette(art) {
    const container = document.getElementById('studioPaletteBar');
    if (!container) return;

    container.innerHTML = art.beginnerTutorial.colorPalette.map(c => `
      <button 
        class="studio-swatch ${c.hex === window.kalakritiStudio.currentColor ? 'active' : ''}" 
        style="background-color: ${c.hex}" 
        title="${c.name} (${c.hex})"
        onclick="app.selectStudioColor('${c.hex}', this)">
      </button>
    `).join('') + `
      <input type="color" id="customColorPicker" value="${window.kalakritiStudio.currentColor}" title="Custom Color" onchange="app.selectStudioColor(this.value)">
    `;
  }

  selectStudioColor(hex, btnElem) {
    window.kalakritiStudio.currentColor = hex;
    document.querySelectorAll('.studio-swatch').forEach(s => s.classList.remove('active'));
    if (btnElem) btnElem.classList.add('active');
    const picker = document.getElementById('customColorPicker');
    if (picker) picker.value = hex;
  }

  // ==========================================
  // WEB AUDIO AMBIENT DRONE SYNTHESIZER
  // ==========================================
  setupAudioAmbience() {
    const audioBtn = document.getElementById('audioAmbienceBtn');
    if (!audioBtn) return;

    audioBtn.addEventListener('click', () => {
      if (this.isAudioPlaying) {
        this.stopAudioAmbience();
        audioBtn.classList.remove('active');
        audioBtn.innerHTML = '🎵 Play Ambient Tanpura';
      } else {
        this.startAudioAmbience();
        audioBtn.classList.add('active');
        audioBtn.innerHTML = '🔊 Ambient Soundscape On';
      }
    });
  }

  startAudioAmbience() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.audioNodes = [];

      // Indian Classical Tanpura fundamental: Sa (C3 = 130.81 Hz), Pa (G3 = 196.00 Hz)
      const saFreq = 130.81;
      const paFreq = 196.00;
      const saHighFreq = 261.63;

      const masterGain = this.audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      masterGain.connect(this.audioCtx.destination);

      // Lowpass filter for warm resonant wood resonance
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(480, this.audioCtx.currentTime);
      filter.connect(masterGain);

      // Create warm drone harmonics
      [paFreq, saHighFreq, saHighFreq, saFreq].forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const oscGain = this.audioCtx.createGain();

        osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        // Slow meditative vibrato / drone flutter
        const lfo = this.audioCtx.createOscillator();
        const lfoGain = this.audioCtx.createGain();
        lfo.frequency.setValueAtTime(0.2 + idx * 0.05, this.audioCtx.currentTime);
        lfoGain.gain.setValueAtTime(1.5, this.audioCtx.currentTime);
        lfo.connect(osc.frequency);
        lfo.start();

        oscGain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();

        this.audioNodes.push(osc, lfo, oscGain);
      });

      this.isAudioPlaying = true;
    } catch (e) {
      console.warn('Web Audio ambience failed to initialize:', e);
    }
  }

  stopAudioAmbience() {
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    this.audioNodes = [];
    this.isAudioPlaying = false;
  }

  // ==========================================
  // FAVORITES (MY CURATION) SYSTEM
  // ==========================================
  loadFavorites() {
    try {
      const saved = localStorage.getItem('kalakriti_favorites');
      return saved ? JSON.parse(saved) : ['madhubani', 'warli', 'tanjore'];
    } catch (e) {
      return ['madhubani', 'warli', 'tanjore'];
    }
  }

  toggleFavorite(artId) {
    if (this.favorites.includes(artId)) {
      this.favorites = this.favorites.filter(id => id !== artId);
    } else {
      this.favorites.push(artId);
    }
    try {
      localStorage.setItem('kalakriti_favorites', JSON.stringify(this.favorites));
    } catch (e) {}

    this.renderGallery();
    this.renderFavoritesDrawer();
  }

  setupFavoritesDrawer() {
    const openBtn = document.getElementById('favDrawerOpenBtn');
    const closeBtn = document.getElementById('favDrawerCloseBtn');
    const drawer = document.getElementById('favoritesDrawer');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        this.renderFavoritesDrawer();
        if (drawer) drawer.classList.add('active');
      });
    }

    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', () => {
        drawer.classList.remove('active');
      });
    }
  }

  renderFavoritesDrawer() {
    const list = document.getElementById('favoritesList');
    if (!list) return;

    const favArts = this.artData.filter(a => this.favorites.includes(a.id));
    if (favArts.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <p>No curated art forms yet. Click the star icon on any card to save it here!</p>
        </div>
      `;
      return;
    }

    list.innerHTML = favArts.map(art => `
      <div class="fav-item" onclick="app.openArtModal('${art.id}'); app.closeFavoritesDrawer();">
        <img src="${art.image}" alt="${art.title}">
        <div class="fav-info">
          <h4>${art.title}</h4>
          <small>${art.state} • ${art.category}</small>
        </div>
        <button class="fav-remove-btn" onclick="event.stopPropagation(); app.toggleFavorite('${art.id}');">✕</button>
      </div>
    `).join('');
  }

  closeFavoritesDrawer() {
    const drawer = document.getElementById('favoritesDrawer');
    if (drawer) drawer.classList.remove('active');
  }

  // ==========================================
  // VIRTUAL 3D EXHIBITION HALL SLIDER
  // ==========================================
  setupExhibitionHall() {
    const openBtn = document.getElementById('openExhibitionBtn');
    const closeBtn = document.getElementById('closeExhibitionBtn');
    const prevBtn = document.getElementById('exhibitionPrevBtn');
    const nextBtn = document.getElementById('exhibitionNextBtn');

    if (openBtn) openBtn.addEventListener('click', () => this.openExhibitionHall());
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeExhibitionHall());
    if (prevBtn) prevBtn.addEventListener('click', () => this.slideExhibition(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => this.slideExhibition(1));
  }

  openExhibitionHall() {
    this.isExhibitionOpen = true;
    this.exhibitionIndex = 0;
    const hall = document.getElementById('exhibitionHall');
    if (hall) hall.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.renderExhibitionSlide();
  }

  closeExhibitionHall() {
    this.isExhibitionOpen = false;
    const hall = document.getElementById('exhibitionHall');
    if (hall) hall.classList.remove('active');
    document.body.style.overflow = '';
  }

  slideExhibition(dir) {
    this.exhibitionIndex = (this.exhibitionIndex + dir + this.artData.length) % this.artData.length;
    this.renderExhibitionSlide();
  }

  renderExhibitionSlide() {
    const art = this.artData[this.exhibitionIndex];
    if (!art) return;

    document.getElementById('exhibitionArtworkImg').src = art.image;
    document.getElementById('exhibitionArtworkImg').onerror = () => {
      document.getElementById('exhibitionArtworkImg').src = 'assets/images/hero_banner.jpg';
    };
    document.getElementById('exhibitionTitle').textContent = art.title;
    document.getElementById('exhibitionState').textContent = `${art.state} • ${art.era}`;
    document.getElementById('exhibitionDescription').textContent = art.summary;
    document.getElementById('exhibitionCounter').textContent = `${this.exhibitionIndex + 1} / ${this.artData.length}`;
  }
}

// Global App Instance
window.app = new KalakritiApp();

document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
