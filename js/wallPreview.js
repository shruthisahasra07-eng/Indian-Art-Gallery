/**
 * KALAKRITI - Virtual Heritage Living Room & Wall Previewer (AR Canvas Simulator)
 * Allows students, collectors, and clients to visualize any classical Indian masterpiece
 * or their own studio creations hung on luxury heritage and contemporary interior walls.
 */

class WallPreviewer {
  constructor() {
    this.modal = null;
    this.currentArt = null;
    this.currentRoom = 'haveli'; // 'haveli', 'modern', 'salon', 'verandah'
    this.currentWallColor = '#F5F0E6';
    this.currentFrame = 'gold'; // 'gold', 'teak', 'minimal'
    this.currentLighting = 'spotlight'; // 'spotlight', 'warm', 'daylight'
    this.currentSize = 'collector'; // 'compact', 'collector', 'grand'
    this.customArtworkDataUrl = null;
  }

  init() {
    this.modal = document.getElementById('wallPreviewModal');
  }

  open(art, customDataUrl = null) {
    this.currentArt = art || (window.app ? window.app.activeArt : null);
    this.customArtworkDataUrl = customDataUrl;

    if (!this.modal) this.init();
    if (!this.modal) return;

    // Set title and info
    const titleElem = document.getElementById('wallArtTitle');
    if (titleElem) {
      titleElem.textContent = this.customArtworkDataUrl 
        ? "Your Studio Masterpiece • Framed on Wall" 
        : `${this.currentArt?.title || 'Indian Masterpiece'} • Living Room Preview`;
    }

    const stateElem = document.getElementById('wallArtSubtitle');
    if (stateElem) {
      stateElem.textContent = this.customArtworkDataUrl 
        ? "Custom creation from Kalakriti Interactive Painting Studio"
        : `${this.currentArt?.state} • ${this.currentArt?.era} • Traditional ${this.currentArt?.category}`;
    }

    this.renderWallStage();
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (this.modal) this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  setRoom(roomKey) {
    this.currentRoom = roomKey;
    document.querySelectorAll('[data-room-preset]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-room-preset') === roomKey);
    });

    // Preset defaults
    const presets = {
      haveli: { color: '#8C4028', frame: 'gold', lighting: 'warm' },
      modern: { color: '#F5F0E6', frame: 'minimal', lighting: 'spotlight' },
      salon: { color: '#1E293B', frame: 'gold', lighting: 'spotlight' },
      verandah: { color: '#D4C5A9', frame: 'teak', lighting: 'daylight' }
    };
    if (presets[roomKey]) {
      this.currentWallColor = presets[roomKey].color;
      this.currentFrame = presets[roomKey].frame;
      this.currentLighting = presets[roomKey].lighting;
    }
    this.renderWallStage();
  }

  setWallColor(colorHex) {
    this.currentWallColor = colorHex;
    this.renderWallStage();
  }

  setFrameStyle(frameKey) {
    this.currentFrame = frameKey;
    document.querySelectorAll('[data-frame-style]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-frame-style') === frameKey);
    });
    this.renderWallStage();
  }

  setLighting(lightKey) {
    this.currentLighting = lightKey;
    document.querySelectorAll('[data-wall-light]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-wall-light') === lightKey);
    });
    this.renderWallStage();
  }

  setSize(sizeKey) {
    this.currentSize = sizeKey;
    document.querySelectorAll('[data-art-size]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-art-size') === sizeKey);
    });
    this.renderWallStage();
  }

  renderWallStage() {
    const stage = document.getElementById('wallStageContainer');
    const frameWrap = document.getElementById('wallFrameWrapper');
    const artImg = document.getElementById('wallArtworkImage');
    const lampGlow = document.getElementById('wallLampGlow');

    if (!stage || !frameWrap || !artImg) return;

    // Apply Wall Background Color and Room Texture
    stage.style.backgroundColor = this.currentWallColor;
    stage.className = `wall-stage-container room-${this.currentRoom} light-${this.currentLighting}`;

    // Apply Art Image
    if (this.customArtworkDataUrl) {
      artImg.src = this.customArtworkDataUrl;
    } else if (this.currentArt) {
      artImg.src = this.currentArt.image;
    }

    // Apply Frame Style Class
    frameWrap.className = `wall-frame-wrapper frame-${this.currentFrame} size-${this.currentSize}`;

    // Lighting effect
    if (lampGlow) {
      lampGlow.className = `wall-lamp-glow light-${this.currentLighting}`;
    }
  }

  exportWallMockup() {
    const stage = document.getElementById('wallStageContainer');
    if (!stage) return;

    // Simple alert or instructions
    alert("Tip: You can use your device's screenshot tool or right-click to save this luxury wall mockup for client presentations!");
  }
}

// Global instance
const wallPreviewer = new WallPreviewer();
if (typeof window !== 'undefined') {
  window.WallPreviewer = WallPreviewer;
  window.wallPreviewer = wallPreviewer;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WallPreviewer, wallPreviewer };
}
