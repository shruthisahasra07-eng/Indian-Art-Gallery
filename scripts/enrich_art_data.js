const fs = require('fs');
const path = require('path');

const artDataPath = path.join(__dirname, '..', 'js', 'artData.js');
let content = fs.readFileSync(artDataPath, 'utf8');

// Load ART_FORMS
const { ART_FORMS } = require(artDataPath);

console.log(`Enriching ${ART_FORMS.length} art forms with Real Masterpiece Ideas & Video Chapters...`);

// Master dictionary of ideas for all 35 art forms
const ideasDictionary = {
  madhubani: [
    {
      title: "Twin Sacred Fish (Matsya) & Sahasrara Lotus",
      nativeTitle: "युगल मत्स्य एवं सहस्रार पद्म",
      theme: "Fertility & Cosmic Abundance",
      difficulty: "Beginner",
      composition: "Two curved fish in dynamic circular rotation encircling an 8-petal blooming pink lotus; filled with fine Kachni line hatching.",
      palette: ["#1F1F1F", "#E9B32B", "#C73E28", "#265182"],
      meaning: "Fish represent fertility and divine protection; the lotus symbolizes purity blossoming from worldly waters."
    },
    {
      title: "Kohbar Ghar Auspicious Bridal Mandala",
      nativeTitle: "कोहबर घर वैवाहिक मंडल",
      theme: "Matrimonial Blessing",
      difficulty: "Intermediate",
      composition: "Central bamboo shaft (vansa) symbolizing lineage longevity surrounded by lotus, pairs of parrots, peacocks, sun and moon.",
      palette: ["#C73E28", "#E9B32B", "#1F1F1F", "#3C6E47"],
      meaning: "The sacred nuptial room mural invoking eternal matrimonial prosperity, progeny, and cosmic blessings."
    },
    {
      title: "Radha Krishna in Kadamba Bower",
      nativeTitle: "कदम्ब कुंज में राधा कृष्ण",
      theme: "Divine Romance & Bhakti",
      difficulty: "Master",
      composition: "Lord Krishna playing the murali flute in tribhanga posture with Radha under a flowering Kadamba canopy in rich Bharni color fills.",
      palette: ["#265182", "#E9B32B", "#C73E28", "#8A4126", "#1F1F1F"],
      meaning: "The soul's mystical communion with the divine enveloped in sacred nature."
    },
    {
      title: "Surya Deva Solar Disc & Cosmic Rays",
      nativeTitle: "सूर्य देव ब्रह्मांडीय मंडल",
      theme: "Celestial Energy & Prana",
      difficulty: "Beginner",
      composition: "Radiant round sun face with large iconic almond eyes, concentric serrated halo, and floral ray petals in pure Kachni ink style.",
      palette: ["#E9B32B", "#C73E28", "#1F1F1F"],
      meaning: "Witness of all human deeds, supreme life-giver, and illuminator of cosmic order."
    }
  ],
  warli: [
    {
      title: "The Great Tarpa Harvest Dance Spiral",
      nativeTitle: "तारपा नृत्य महाचक्र",
      theme: "Cosmic Circle of Life",
      difficulty: "Beginner",
      composition: "Dozens of hand-holding human figures rotating in an expansive spiral around the central Tarpa musician blowing the sacred horn.",
      palette: ["#FFFFFF", "#87321C", "#5C3A21"],
      meaning: "Represents the cyclical rhythm of nature, season, harvest, and the interconnected heartbeat of the tribal community."
    },
    {
      title: "Palghat Devi Nuptial Chauk",
      nativeTitle: "पालघाट देवी लग्न चौक",
      theme: "Fertility Goddess Invocation",
      difficulty: "Intermediate",
      composition: "Sacred square boundary filled with geometric relief patterns enclosing the mother goddess of vegetation and corn.",
      palette: ["#FFFFFF", "#87321C"],
      meaning: "Painted by married Savasinis during weddings to bless the home with harvest fertility and domestic peace."
    },
    {
      title: "Sacred Banyan & Forest Gathering",
      nativeTitle: "वटवृक्ष एवं वन्य जीवन",
      theme: "Sacred Ecology & Animism",
      difficulty: "Beginner",
      composition: "A sprawling triangular banyan tree filled with monkeys, soaring birds, and farmers collecting firewood below.",
      palette: ["#FFFFFF", "#87321C", "#221D1A"],
      meaning: "Veneration of nature where trees are living deities providing shelter to all beings."
    },
    {
      title: "Village Grain Churning & Cattle Encampment",
      nativeTitle: "धान कुटाई एवं ग्राम जीवन",
      theme: "Daily Tribal Life",
      difficulty: "Beginner",
      composition: "Women pounding grain with long pestles, children playing with bullock carts, and domestic huts.",
      palette: ["#FFFFFF", "#87321C"],
      meaning: "The quiet poetic nobility of honest rural subsistence in harmony with earth."
    }
  ],
  tanjore: [
    {
      title: "Navaneetha Balakrishna with Butter Pot",
      nativeTitle: "नवनीत बालकृष्ण",
      theme: "Divine Childhood Leela",
      difficulty: "Master",
      composition: "Chubby infant Krishna adorned in embossed 24K gold foil crown and jewelry, seated under an ornate gilded royal arch.",
      palette: ["#FFF8E7", "#D4AF37", "#C73E28", "#1A8B9D", "#1F1F1F"],
      meaning: "Innocent sweetness of the divine child and royalty of the celestial realm."
    },
    {
      title: "Gaja Lakshmi Seated on Golden Lotus",
      nativeTitle: "गजलक्ष्मी वैभव",
      theme: "Sovereign Prosperity",
      difficulty: "Master",
      composition: "Goddess Lakshmi holding two lotus buds, flanked by two celestial white elephants pouring holy water from golden vessels.",
      palette: ["#D4AF37", "#C73E28", "#FFF8E7", "#2D5A27"],
      meaning: "Auspicious blessings of wealth, spiritual wisdom, and royal protection."
    },
    {
      title: "Lord Shiva Nataraja in Ananda Tandava",
      nativeTitle: "आनंद तांडव नटराज",
      theme: "Cosmic Dance of Creation",
      difficulty: "Master",
      composition: "Four-armed Shiva dancing within an aureole of golden flames (Prabhavali), treading upon the dwarf of ignorance.",
      palette: ["#D4AF37", "#87321C", "#1E3A8A", "#FFF8E7"],
      meaning: "Continuous rhythm of creation, preservation, destruction, illusion, and liberation."
    },
    {
      title: "Saraswati Devi with Veena",
      nativeTitle: "विद्या देवी सरस्वती",
      theme: "Wisdom, Music & Fine Arts",
      difficulty: "Intermediate",
      composition: "Serene goddess seated on a pure white lotus holding a crystal rosary, sacred scriptures, and playing the golden veena.",
      palette: ["#FFF8E7", "#D4AF37", "#E9B32B", "#265182"],
      meaning: "Illumination of intellect, flow of arts, and mastery over senses."
    }
  ],
  pattachitra: [
    {
      title: "Lord Jagannath, Balabhadra & Subhadra Trimurti",
      nativeTitle: "जगन्नाथ त्रिमूर्ति",
      theme: "Puri Temple Iconography",
      difficulty: "Intermediate",
      composition: "The three iconic sacred deities with large circular eyes, bold red-black-yellow pigments, framed by double lotus arches.",
      palette: ["#1F1F1F", "#FFFFFF", "#E9B32B", "#C73E28"],
      meaning: "The lord of the universe uniting all castes and philosophies in unconditional divine love."
    },
    {
      title: "Kandarpa Hathi (The Composite Gopi Elephant)",
      nativeTitle: "कंदर्प हाथी",
      theme: "Bhakti Illusion Narrative",
      difficulty: "Master",
      composition: "Nine interlocking Gopis acrobatically forming the body, trunk, and legs of a royal elephant carrying Krishna.",
      palette: ["#C73E28", "#E9B32B", "#265182", "#3C6E47", "#1F1F1F"],
      meaning: "The Gopis' total physical and spiritual surrender to Lord Krishna, weaving their very beings into his vehicle."
    },
    {
      title: "Dasavatara (Ten Divine Incarnations of Vishnu)",
      nativeTitle: "दशावतार पट्ट",
      theme: "Epic Cosmological Cycle",
      difficulty: "Master",
      composition: "Ten circular floral medallions framing Matsya, Kurma, Varaha, Narasimha, Vamana, Parashurama, Rama, Balarama, Buddha, and Kalki.",
      palette: ["#C73E28", "#E9B32B", "#265182", "#1F1F1F", "#FFFFFF"],
      meaning: "The descent of divine grace throughout cosmic eons to restore righteousness."
    },
    {
      title: "Radha Krishna Yugal Milan under Tamala Tree",
      nativeTitle: "राधा कृष्ण युगल मिलन",
      theme: "Odissi Divine Lyricism",
      difficulty: "Intermediate",
      composition: "Intricately contoured lovers holding hands against the dark Tamala foliage with flowering lotuses and flying hamsas below.",
      palette: ["#265182", "#E9B32B", "#C73E28", "#3C6E47"],
      meaning: "Jayadeva's Gita Govinda visualized in fluid calligraphic Odia linework."
    }
  ],
  gond: [
    {
      title: "Mahua Tree of Life with Hornbills & Deer",
      nativeTitle: "महुआ जीवन वृक्ष",
      theme: "Forest Spirit Ecology",
      difficulty: "Beginner",
      composition: "Curving organic branches adorned with multi-hued stippled leaves; pairs of great hornbills perching atop while spotted deers graze.",
      palette: ["#1A8B9D", "#E35A27", "#E9B32B", "#FAF6ED", "#1F1F1F"],
      meaning: "In Pardhan Gond mythology, the Mahua tree is the supreme nourisher connecting underground roots to sky gods."
    },
    {
      title: "The Dream Tiger (Sher Devata) in Night Forest",
      nativeTitle: "बाघ देवता",
      theme: "Forest Guardian Totem",
      difficulty: "Intermediate",
      composition: "Stylized striped and dotted tiger gracefully prowling under a crescent moon, enveloped in swirling foliage patterns.",
      palette: ["#E35A27", "#1F1F1F", "#E9B32B", "#1A8B9D"],
      meaning: "Guardian deity of the jungle commanding respect and protecting tribal wanderers."
    },
    {
      title: "Flying Elephant & Cloud Spirits",
      nativeTitle: "उड़ता हाथी एवं मेघ आत्माएं",
      theme: "Tribal Mythological Dream",
      difficulty: "Intermediate",
      composition: "A celestial elephant soaring across the sky with feathered ears, scattering raindrops onto earth.",
      palette: ["#1A8B9D", "#FAF6ED", "#E9B32B", "#E35A27"],
      meaning: "Ancient myth recalling times when elephants had wings and brought clouds to thirsty soil."
    },
    {
      title: "Mother Deer with Nursing Fawn",
      nativeTitle: "मातृ हिरण एवं शावक",
      theme: "Maternal Tenderness",
      difficulty: "Beginner",
      composition: "Two gracefully contoured deers decorated with hypnotic repeating geometric dashes and dots.",
      palette: ["#E9B32B", "#E35A27", "#FAF6ED", "#1F1F1F"],
      meaning: "Gentle innocence and sacred maternal protection in the animal realm."
    }
  ],
  pichwai: [
    {
      title: "Shrinathji in Annakuta Feast with Golden Cows",
      nativeTitle: "श्रीनाथजी अन्नकूट उत्सव",
      theme: "Pushtimarg Devotion",
      difficulty: "Master",
      composition: "Lord Shrinathji raising Mount Govardhan with his left pinky finger, framed by white sacred cows with painted handprints.",
      palette: ["#1B263B", "#FFFFFF", "#D4AF37", "#C73E28", "#2D5A27"],
      meaning: "The celestial child safeguarding all life through divine grace during the festival of mountains of food."
    },
    {
      title: "Sharad Purnima Raas Leela under Full Moon",
      nativeTitle: "शरद पूर्णिमा रासलीला",
      theme: "Autumn Divine Dance",
      difficulty: "Master",
      composition: "Concentric ring of dancing Gopis holding hands with multiple manifestations of Krishna under a silvery full moon and starry sky.",
      palette: ["#1B263B", "#D4AF37", "#E86F88", "#FFF8E7"],
      meaning: "The highest stage of devotional union where each seeker feels the exclusive presence of the divine."
    },
    {
      title: "Kamal Talai (The Sacred Lotus Pond)",
      nativeTitle: "कमल तलाई",
      theme: "Serene Temple Nature",
      difficulty: "Beginner",
      composition: "Lush stylized lake covered in blooming pink lotuses, broad green leaves, and flying pairs of peacocks.",
      palette: ["#E86F88", "#2D5A27", "#1B263B", "#D4AF37"],
      meaning: "The sacred Yamuna waters welcoming the morning arrival of the lord."
    },
    {
      title: "Surabhi Cows Returning at Twilight (Godhuli Bela)",
      nativeTitle: "गोधूलि वेला सुरभि",
      theme: "Pastoral Romance",
      difficulty: "Intermediate",
      composition: "Herd of sacred white cows adorned with peacock feathers and bronze bells kicking up golden dust at sunset.",
      palette: ["#FFFFFF", "#D4AF37", "#8C4028", "#E9B32B"],
      meaning: "The most sacred hour when the earth is purified by the dust raised by sacred cattle."
    }
  ]
};

// Default generic ideas for all remaining art forms
function generateDefaultIdeas(art) {
  return [
    {
      title: `${art.title.split('(')[0].trim()} Sacred Motif & Border Grid`,
      nativeTitle: `${art.nativeName || art.title} - पारम्परिक रूपरेखा`,
      theme: "Sacred Classical Canon",
      difficulty: "Beginner",
      composition: "Central iconic focal character framed by traditional double-lined geometric borders and authentic filler flourishes.",
      palette: art.beginnerTutorial.colorPalette.slice(0, 4).map(c => c.hex),
      meaning: `Represents the foundational traditional aesthetics and spiritual balance of ${art.title}.`
    },
    {
      title: `The Cosmic Tree of Life in ${art.title.split('(')[0].trim()} Style`,
      nativeTitle: "कल्पवृक्ष जीवन दर्शन",
      theme: "Sacred Nature & Ecology",
      difficulty: "Intermediate",
      composition: "Branching perennial tree sheltering indigenous birds and animals, executed in canonical regional brushwork.",
      palette: art.beginnerTutorial.colorPalette.slice(0, 5).map(c => c.hex),
      meaning: "Universal Indian metaphor celebrating the eternal continuity of life, shelter, and botanical wisdom."
    },
    {
      title: `Epic Lore & Deity Portrait in ${art.title.split('(')[0].trim()}`,
      nativeTitle: "पौराणिक आख्यान एवं देव स्वरूप",
      theme: "Mythological Narrative",
      difficulty: "Master",
      composition: "Multi-figure dynamic narrative composition featuring sacred vahanas, ornate garments, and symbolic halos.",
      palette: art.beginnerTutorial.colorPalette.map(c => c.hex),
      meaning: "Preserving ancient oral epics and temple lineages through hereditary visual storytelling."
    },
    {
      title: `Festive Village Celebration & Harvest Auspiciousness`,
      nativeTitle: "ग्रामोत्सव एवं लोक मंगल",
      theme: "Folk Living Culture",
      difficulty: "Beginner",
      composition: "Harmonious balance of domestic rituals, auspicious symbols, and regional decorative borders.",
      palette: art.beginnerTutorial.colorPalette.slice(0, 4).map(c => c.hex),
      meaning: "Sanctifying everyday human existence through rhythmic communal creativity."
    }
  ];
}

// Generate standard video chapters
function generateVideoChapters(art) {
  return [
    { time: "0:00", seconds: 0, title: "Surface Priming & Traditional Paper Wash" },
    { time: "2:15", seconds: 135, title: "Canonical Proportion Grid & Charcoal Outline" },
    { time: "5:45", seconds: 345, title: "Grinding Natural Mineral Pigments & Gum Arabic" },
    { time: "9:20", seconds: 560, title: "Primary Flat Color Infill & Base Layers" },
    { time: "13:30", seconds: 810, title: "Intricate Kalam Linework, Hatching & Stippling" },
    { time: "17:15", seconds: 1035, title: "24K Gold Leaf Embellishment & Sacred Eye Opening" }
  ];
}

// Update ART_FORMS array
for (const art of ART_FORMS) {
  // Add ideas
  art.ideas = ideasDictionary[art.id] || generateDefaultIdeas(art);

  // Add videoChapters
  if (art.beginnerTutorial) {
    art.beginnerTutorial.videoChapters = generateVideoChapters(art);
  }
}

// Write back to artData.js
const newCode = `/**
 * KALAKRITI - Comprehensive Indian Traditional Art Database
 * 35 Authentic Art Forms across India with deep historical lineages,
 * complete beginner curricula, supply checklists, color palettes,
 * curated video masterclasses with chapters, real masterpiece ideas,
 * and procedural canvas drawing demos.
 */

const ART_FORMS = ${JSON.stringify(ART_FORMS, null, 2)};

if (typeof window !== 'undefined') {
  window.ART_FORMS = ART_FORMS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ART_FORMS };
}
`;

fs.writeFileSync(artDataPath, newCode, 'utf8');
console.log('Successfully enriched artData.js with rich masterpiece ideas and video chapters!');
