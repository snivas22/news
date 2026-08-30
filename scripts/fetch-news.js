const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 NewsAggregator/1.0'
  }
});

const CATEGORIES = ["general","business","entertainment","health","science","sports","technology"];
const ZONES = ["us","gb","in","au","ca"];

const FEEDS = {
  general: [
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://www.theguardian.com/world/rss',
    'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en'
  ],
  business: [
    'https://feeds.bbci.co.uk/news/business/rss.xml',
    'https://www.theguardian.com/uk/business/rss',
    'https://news.google.com/rss/search?q=business+news&hl=en-US&gl=US&ceid=US:en'
  ],
  entertainment: [
    'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
    'https://news.google.com/rss/search?q=entertainment+news&hl=en-US&gl=US&ceid=US:en',
    'https://www.theguardian.com/uk/culture/rss'
  ],
  health: [
    'https://feeds.bbci.co.uk/news/health/rss.xml',
    'https://news.google.com/rss/search?q=health+news&hl=en-US&gl=US&ceid=US:en',
    'https://www.theguardian.com/society/health/rss'
  ],
  science: [
    'https://www.theguardian.com/science/rss',
    'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
    'https://news.google.com/rss/search?q=science+news&hl=en-US&gl=US&ceid=US:en'
  ],
  sports: [
    'https://feeds.bbci.co.uk/sport/rss.xml',
    'https://news.google.com/rss/search?q=sports+news&hl=en-US&gl=US&ceid=US:en',
    'https://www.theguardian.com/uk/sport/rss'
  ],
  technology: [
    'https://feeds.bbci.co.uk/news/technology/rss.xml',
    'https://news.google.com/rss/search?q=technology+news&hl=en-US&gl=US&ceid=US:en',
    'https://www.theguardian.com/uk/technology/rss'
  ]
};

function normalizeSource(item) {
  const sourceName = item.creator || item['dc:creator'] || item.author || item.meta && item.meta.publisher || 'RSS Feed';
  return { name: String(sourceName).replace(/^\s+|\s+$/g, '') || 'RSS Feed' };
}

function normalizeArticle(item, category, zone) {
  const publishedAt = item.isoDate || item.pubDate || new Date().toISOString();
  const source = normalizeSource(item);
  const title = (item.title || 'Untitled story').trim();
  const url = item.link || item.guid || '#';
  const description = item.contentSnippet || item.summary || item.content || '';

  return {
    title,
    url,
    source,
    description: description.replace(/\s+/g, ' ').trim(),
    publishedAt,
    category,
    zone
  };
}

async function fetchFeed(feedUrl) {
  const feed = await parser.parseURL(feedUrl);
  return feed.items || [];
}

async function fetchCategory(category) {
  const seen = new Set();
  const articles = [];

  for (const feedUrl of FEEDS[category] || []) {
    try {
      const items = await fetchFeed(feedUrl);
      for (const item of items) {
        const normalized = normalizeArticle(item, category, 'global');
        if (!normalized.url || !normalized.title || seen.has(normalized.url)) {
          continue;
        }
        seen.add(normalized.url);
        articles.push(normalized);
        if (articles.length >= 12) {
          return articles;
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch ${feedUrl}: ${error.message}`);
    }
  }

  return articles;
}

async function main() {
  const out = { generatedAt: new Date().toISOString() };

  for (const category of CATEGORIES) {
    const categoryArticles = await fetchCategory(category);

    for (const zone of ZONES) {
      const zoneArticles = categoryArticles
        .slice(0, 8)
        .map((article) => ({ ...article, zone }));
      out[`${category}_${zone}`] = { articles: zoneArticles };
    }
  }

  const file = path.resolve(__dirname, '..', 'public', 'news.json');
  fs.writeFileSync(file, JSON.stringify(out, null, 2), 'utf8');
  console.log(`Wrote ${file} with ${Object.keys(out).length - 1} category-zone entries`);
}

main().catch((error) => {
  console.error('Failed to generate news data:', error);
  process.exit(1);
});
