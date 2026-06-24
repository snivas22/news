import React, { useEffect, useState } from "react";
import './App.css';
import NewsList from './components/NewsList';

const CATEGORIES = ["general","business","entertainment","health","science","sports","technology"];
const ZONES = [
  { code: "us", name: "United States" },
  { code: "gb", name: "United Kingdom" },
  { code: "in", name: "India" },
  { code: "au", name: "Australia" },
  { code: "ca", name: "Canada" }
];

function App(){
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [zone, setZone] = useState(ZONES[0].code);
  const [news, setNews] = useState({});
  const [loading, setLoading] = useState(true);

  async function loadNews(){
    setLoading(true);
    try{
      const res = await fetch('/news.json', {cache: 'no-store'});
      const json = await res.json();
      setNews(json || {});
    }catch(e){
      console.error('Failed to load news.json', e);
      setNews({});
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{
    loadNews();
    // refresh every hour
    const id = setInterval(loadNews, 1000 * 60 * 60);
    return ()=> clearInterval(id);
  },[]);

  const key = `${category}_${zone}`;
  const articles = (news[key] && news[key].articles) || [];

  return (
    <div className="App" style={{padding:20}}>
      <h1>News App</h1>
      <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}>
        <label>
          Category:&nbsp;
          <select value={category} onChange={e=>setCategory(e.target.value)}>
            {CATEGORIES.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label>
          Zone:&nbsp;
          <select value={zone} onChange={e=>setZone(e.target.value)}>
            {ZONES.map(z=> <option key={z.code} value={z.code}>{z.name}</option>)}
          </select>
        </label>

        <button onClick={loadNews}>Refresh</button>
      </div>

      {loading ? <div>Loading news…</div> : (
        <NewsList articles={articles} category={category} zone={zone} />
      )}
    </div>
  );
}

export default App;