import React from 'react';

function formatDate(value) {
  if (!value) return 'Just now';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function NewsList({ articles, category, zone }){
  if (!articles || articles.length === 0) {
    return (
      <div className="empty-state-card">
        <h2>No coverage for {category} in {zone}</h2>
        <p>Try another region or refresh the live feed.</p>
      </div>
    );
  }

  return (
    <section className="news-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Updated feed</p>
          <h2>{category} • {zone}</h2>
        </div>
        <span className="live-indicator">Live</span>
      </div>

      <div className="article-list">
        {articles.map((a, idx) => (
          <article key={`${a.url}-${idx}`} className="article-card">
            <div className="article-topline">
              <span className="source-badge">{a.source && a.source.name ? a.source.name : 'RSS'}</span>
              <time>{formatDate(a.publishedAt)}</time>
            </div>

            <a href={a.url} target="_blank" rel="noreferrer" className="article-title">
              {a.title}
            </a>

            {a.description && <p className="article-summary">{a.description}</p>}

            <div className="article-footer">
              <span>{category}</span>
              <a href={a.url} target="_blank" rel="noreferrer">Read story →</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
