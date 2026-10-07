const fs = require('fs');
const path = require('path');

const artForms = [
  { id: 'madhubani', page: 'Madhubani_art', query: 'Madhubani painting' },
  { id: 'warli', page: 'Warli_painting', query: 'Warli painting' },
  { id: 'tanjore', page: 'Thanjavur_painting', query: 'Thanjavur painting' },
  { id: 'pattachitra', page: 'Pattachitra', query: 'Pattachitra Odisha' },
  { id: 'kalamkari', page: 'Kalamkari', query: 'Kalamkari painting' },
  { id: 'gond', page: null, query: 'Gond painting MP' },
  { id: 'pichwai', page: 'Pichhwai', query: 'Pichhwai painting' },
  { id: 'phad', page: null, query: 'Pabuji ka phad' },
  { id: 'kalighat', page: 'Kalighat_painting', query: 'Kalighat painting' },
  { id: 'cheriyal', page: 'Cheriyal_scroll_painting', query: 'Cheriyal scroll' },
  { id: 'kerala_mural', page: 'Kerala_mural_painting', query: 'Kerala mural painting' },
  { id: 'rogan', page: 'Rogan_art', query: 'Rogan painting Kutch' },
  { id: 'mughal', page: 'Mughal_painting', query: 'Mughal miniature painting' },
  { id: 'kangra', page: 'Kangra_painting', query: 'Kangra painting' },
  { id: 'bhil', page: null, query: 'Bhil painting dot' },
  { id: 'saura', page: 'Saura_painting', query: 'Saura painting' },
  { id: 'chittara', page: null, query: 'Chittara mural Karnataka' },
  { id: 'pithora', page: null, query: 'Pithora Painting at Crafts Museum' },
  { id: 'thangka', page: 'Thangka', query: 'Thangka painting' },
  { id: 'aipan', page: 'Aipan_art', query: 'Aipan art Uttarakhand' },
  { id: 'sanjhi', page: 'Sanjhi', query: 'Sanjhi art Mathura' },
  { id: 'mysore', page: 'Mysore_painting', query: 'Mysore painting' },
  { id: 'mandana', page: 'Mandana_paintings', query: 'Mandana painting' },
  { id: 'manjusha', page: null, query: 'Manjusha painting Angika Bihar' },
  { id: 'sohrai', page: 'Sohrai', query: 'Sohrai painting Hazaribagh' },
  { id: 'khovar', page: null, query: 'Khovar painting Jharkhand' },
  { id: 'basohli', page: 'Basohli_painting', query: 'Basohli painting' },
  { id: 'lepakshi', page: 'Lepakshi', query: 'Lepakshi mural painting' },
  { id: 'chamba_rumal', page: 'Chamba_Rumal', query: 'Chamba Rumal embroidery' },
  { id: 'deccani', page: 'Deccan_painting', query: 'Deccan painting Golconda' },
  { id: 'company_style', page: 'Company_style', query: 'Company style painting' },
  { id: 'rajput', page: 'Bani_Thani', query: 'Bani Thani Kishangarh painting' },
  { id: 'kalamezhuthu', page: null, query: 'Kalamezhuthu ritual Kerala' },
  { id: 'khavda', page: null, query: 'Kutch pottery painting Khavda' },
  { id: 'alpana', page: 'Alpana', query: 'Alpana floor painting Bengal' }
];

const imgDir = path.join(__dirname, '..', 'assets', 'images');
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
};

async function getImageUrl(art) {
  // 1. Try Wikipedia page summary if available
  if (art.page) {
    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${art.page}`, { headers: HEADERS });
      if (res.ok) {
        const data = await res.json();
        if (data.originalimage?.source) return data.originalimage.source;
        if (data.thumbnail?.source) return data.thumbnail.source;
      }
    } catch (e) {
      console.warn(`Wiki page lookup failed for ${art.id}:`, e.message);
    }
  }

  // 2. Fallback to Wikimedia Commons search
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|size|mime&gsrsearch=${encodeURIComponent(art.query)}`;
    const res = await fetch(searchUrl, { headers: HEADERS });
    if (res.ok) {
      const data = await res.json();
      const pages = data.query?.pages || {};
      for (const id in pages) {
        const info = pages[id]?.imageinfo?.[0];
        if (info?.url && (info.url.endsWith('.jpg') || info.url.endsWith('.JPG') || info.url.endsWith('.png') || info.url.endsWith('.jpeg'))) {
          return info.url;
        }
      }
    }
  } catch (e) {
    console.warn(`Commons search failed for ${art.id}:`, e.message);
  }

  return null;
}

async function downloadFile(url, dest) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buffer));
}

async function main() {
  console.log(`Starting image collection for ${artForms.length} Indian art forms...`);
  const results = {};

  for (const art of artForms) {
    const dest = path.join(imgDir, `${art.id}.jpg`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
      console.log(`✓ [Existing] ${art.id}`);
      results[art.id] = `assets/images/${art.id}.jpg`;
      continue;
    }

    try {
      const url = await getImageUrl(art);
      if (url) {
        console.log(`Downloading ${art.id} from ${url}...`);
        await downloadFile(url, dest);
        const size = fs.statSync(dest).size;
        console.log(`✓ [Downloaded] ${art.id} (${(size / 1024).toFixed(1)} KB)`);
        results[art.id] = `assets/images/${art.id}.jpg`;
      } else {
        console.warn(`✗ [No URL found] ${art.id}`);
      }
    } catch (e) {
      console.error(`✗ [Error] ${art.id}: ${e.message}`);
    }

    // brief polite delay between requests
    await new Promise(r => setTimeout(r, 400));
  }

  fs.writeFileSync(path.join(__dirname, 'image_manifest.json'), JSON.stringify(results, null, 2));
  console.log('Finished image processing! Manifest written to scripts/image_manifest.json');
}

main();
