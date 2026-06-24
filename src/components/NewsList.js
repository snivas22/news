import React from 'react';

export default function NewsList({ articles, category, zone }){
  if(!articles || articles.length === 0) return (
    <div>No articles for {category} / {zone}.</div>
  );

  return (
    <div>
      <h2>{category} — {zone}</h2>
      <ul style={{paddingLeft:0}}>
        {articles.map((a, idx) => (
          <li key={idx} style={{listStyle:'none',marginBottom:16,padding:12,border:'1px solid #ddd',borderRadius:6}}>
            <a href={a.url} target="_blank" rel="noreferrer" style={{fontSize:16,fontWeight:600}}>{a.title}</a>
            <div style={{fontSize:12,color:'#666'}}>{a.source && a.source.name} • {a.publishedAt && new Date(a.publishedAt).toLocaleString()}</div>
            {a.description && <p style={{marginTop:8}}>{a.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
