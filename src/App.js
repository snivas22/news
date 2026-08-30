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
      const res = await fetch(`/news.json?ts=${Date.now()}`, { cache: 'no-store' });
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
    const id = setInterval(loadNews, 1000 * 60 * 60);
    return ()=> clearInterval(id);
  },[]);

  const key = `${category}_${zone}`;
  const articles = (news[key] && news[key].articles) || [];

  return (
    <div className="App">
      <div className="app-shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">Live desk</p>
            <h1>Global Briefing</h1>
          </div>
          <button className="refresh-button" onClick={loadNews}>
            {loading ? 'Refreshing...' : 'Refresh feed'}
          </button>
        </header>

        <div className="toolbar">
          <label className="field">
            <span>Category</span>
            <select value={category} onChange={e=>setCategory(e.target.value)}>
              {CATEGORIES.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="field">
            <span>Region</span>
            <select value={zone} onChange={e=>setZone(e.target.value)}>
              {ZONES.map(z=> <option key={z.code} value={z.code}>{z.name}</option>)}
            </select>
          </label>
        </div>

        <div className="stats-row">
          <div className="stat-pill">
            <span>Stories</span>
            <strong>{articles.length}</strong>
          </div>
          <div className="stat-pill">
            <span>Category</span>
            <strong>{category}</strong>
          </div>
          <div className="stat-pill">
            <span>Region</span>
            <strong>{zone}</strong>
          </div>
        </div>

        {loading ? <div className="loading-state">Loading latest updates…</div> : (
          <NewsList articles={articles} category={category} zone={zone} />
        )}
      </div>
    </div>
  );
}

export default App;