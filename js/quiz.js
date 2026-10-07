/**
 * KALAKRITI - Interactive "Discover Your Art Soul" Quiz Engine
 * Matches beginner artists to their soul Indian art form based on aesthetic intuition,
 * patience rhythm, preferred surface, and artistic philosophy.
 */

const ART_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What color harmony calls most deeply to your spirit?",
    subtitle: "Select the chromatic palette that reflects your natural aesthetic",
    options: [
      { text: "Raw Terracotta Ochre & Rice White", arts: ["warli", "saura", "aipan", "mandana", "khavda"], icon: "🏺" },
      { text: "Radiant 24K Temple Gold & Precious Jewel Tones", arts: ["tanjore", "mysore", "basohli", "deccani"], icon: "✨" },
      { text: "Vibrant Turmeric, Indigo, Sindoor & Plant Sap", arts: ["madhubani", "kalamkari", "pattachitra", "manjusha"], icon: "🌿" },
      { text: "Midnight Forest Green, Lotus Rose & Moonlit Blues", arts: ["pichwai", "kangra", "thangka", "rogan"], icon: "🪷" }
    ]
  },
  {
    id: 2,
    question: "Which sacred surface do you feel inspired to create on?",
    subtitle: "Traditional Indian art begins with deep reverence for the base ground",
    options: [
      { text: "Sun-dried mud walls, rustic paper & earthy courtyards", arts: ["warli", "mandana", "sohrai", "khovar", "aipan"], icon: "🧱" },
      { text: "Starched handloom cotton cloth & epic narrative scrolls", arts: ["kalamkari", "phad", "cheriyal", "pattachitra", "pichwai"], icon: "📜" },
      { text: "Seasoned teakwood boards with 3D gesso relief embossing", arts: ["tanjore", "mysore"], icon: "🪵" },
      { text: "Smooth handmade Wasli paper for microscopic fine linework", arts: ["mughal", "kangra", "rajput", "basohli", "company_style"], icon: "📄" }
    ]
  },
  {
    id: 3,
    question: "What creative rhythm suits your patience and energy?",
    subtitle: "Every art form has a unique meditative heartbeat",
    options: [
      { text: "Spontaneous, lively strokes celebrating daily village joys", arts: ["kalighat", "warli", "saura", "khavda"], icon: "⚡" },
      { text: "Hypnotic, rhythmic stippling dots and repeating texture rows", arts: ["gond", "bhil", "pithora"], icon: "🫧" },
      { text: "Symmetrical sacred geometry, mathematical grids & stencils", arts: ["alpana", "chittara", "sanjhi", "aipan", "mandana"], icon: "📐" },
      { text: "Devotional, meticulous micro-detailing with single-hair brushes", arts: ["thangka", "tanjore", "mughal", "kerala_mural", "rogan"], icon: "🔍" }
    ]
  },
  {
    id: 4,
    question: "Which subject stirs your deepest creative imagination?",
    subtitle: "Indian art is storytelling woven into line and color",
    options: [
      { text: "Forest animals, sacred Mahua trees & dancing village spirits", arts: ["gond", "bhil", "warli", "pithora", "sohrai"], icon: "🦌" },
      { text: "Divine Krishna Leela, holy cows, and temple legends", arts: ["pichwai", "pattachitra", "phad", "chamba_rumal", "sanjhi"], icon: "🦚" },
      { text: "Majestic royal durbars, poetic romance & exquisite portraits", arts: ["rajput", "mughal", "kangra", "deccani", "company_style"], icon: "👑" },
      { text: "Protective serpents, fierce goddesses & cosmic tantric energy", arts: ["manjusha", "kalamezhuthu", "madhubani", "lepakshi"], icon: "🔱" }
    ]
  },
  {
    id: 5,
    question: "What is your primary goal as a beginner learner?",
    subtitle: "Choose the creative milestone you wish to achieve first",
    options: [
      { text: "Creating a quick, stunning folk artwork with simple supplies", arts: ["warli", "aipan", "bhil", "madhubani", "mandana"], icon: "🎯" },
      { text: "Crafting a lavish golden heirloom to frame on my living room wall", arts: ["tanjore", "pichwai", "mysore", "rogan"], icon: "🖼️" },
      { text: "Entering a deep state of peaceful spiritual mindfulness", arts: ["thangka", "alpana", "sanjhi", "chittara"], icon: "🧘" },
      { text: "Mastering classical fine brushwork and anatomy principles", arts: ["kerala_mural", "pattachitra", "mughal", "kalamkari"], icon: "🖌️" }
    ]
  }
];

class ArtSoulQuiz {
  constructor() {
    this.currentQuestionIdx = 0;
    this.scores = {};
    this.isCompleted = false;
  }

  reset() {
    this.currentQuestionIdx = 0;
    this.scores = {};
    this.isCompleted = false;
  }

  recordAnswer(optionIdx) {
    const q = ART_QUIZ_QUESTIONS[this.currentQuestionIdx];
    const option = q.options[optionIdx];
    
    option.arts.forEach(artId => {
      this.scores[artId] = (this.scores[artId] || 0) + 1;
    });

    this.currentQuestionIdx++;
    if (this.currentQuestionIdx >= ART_QUIZ_QUESTIONS.length) {
      this.isCompleted = true;
      return this.calculateResult();
    }
    return null;
  }

  calculateResult() {
    let topArtId = 'madhubani';
    let maxScore = -1;

    for (const [artId, score] of Object.entries(this.scores)) {
      if (score > maxScore) {
        maxScore = score;
        topArtId = artId;
      }
    }

    const art = ART_FORMS.find(a => a.id === topArtId) || ART_FORMS[0];
    const matchPercentage = Math.min(99, Math.max(82, Math.floor((maxScore / ART_QUIZ_QUESTIONS.length) * 100) + Math.floor(Math.random() * 8)));

    return {
      art,
      matchPercentage,
      reason: `Your creative energy thrives on ${art.category.toLowerCase()} rhythm, celebrating ${art.summary.toLowerCase()}`
    };
  }
}

window.artSoulQuiz = new ArtSoulQuiz();
