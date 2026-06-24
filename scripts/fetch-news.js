const fs = require('fs');
const path = require('path');

const CATEGORIES = ["general","business","entertainment","health","science","sports","technology"];
const ZONES = ["us","gb","in","au","ca"];

async function fetchUrl(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

async function main(){
  const apiKey = process.env.NEWS_API_KEY;
  if(!apiKey){
    console.error('Missing NEWS_API_KEY env var. Set it in GitHub Actions secrets.');
    process.exit(1);
  }

  const out = { generatedAt: new Date().toISOString() };

  for(const c of CATEGORIES){
    for(const z of ZONES){
      try{
        const url = `https://newsapi.org/v2/top-headlines?country=${z}&category=${c}&pageSize=20&apiKey=${apiKey}`;
        const json = await fetchUrl(url);
        out[`${c}_${z}`] = json;
      }catch(err){
        console.error('Fetch error', c, z, err.message);
        out[`${c}_${z}`] = { articles: [] };
      }
    }
  }

  const file = path.resolve(__dirname, '..', 'public', 'news.json');
  fs.writeFileSync(file, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote', file);
}

main().catch(err=>{ console.error(err); process.exit(1); });
