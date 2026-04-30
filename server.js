const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 3000;
const ARTICLES_DIR = path.join(__dirname, 'articles');
const WEB_FILE = path.join(__dirname, 'article-rater.html');

function tryReadManifest() {
  const manifestPath = path.join(ARTICLES_DIR, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return null;
  const raw = fs.readFileSync(manifestPath, 'utf8');
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) {
    const m = new Map();
    parsed.forEach(item => {
      if (!item) return;
      const id = String(item.id ?? '').trim();
      const name = String(item.name ?? '').trim();
      if (id && name) m.set(id, name);
    });
    return m;
  }
  if (parsed && typeof parsed === 'object') {
    const m = new Map();
    Object.entries(parsed).forEach(([id, name]) => {
      const k = String(id ?? '').trim();
      const v = String(name ?? '').trim();
      if (k && v) m.set(k, v);
    });
    return m;
  }
  return null;
}

function readTopicsFromArticlesFolder() {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  const entries = fs.readdirSync(ARTICLES_DIR, { withFileTypes: true });
  const files = entries.filter(e => e.isFile()).map(e => e.name);

  const byId = new Map(); // id -> { ai?: string, human?: string }
  const re = /^(\d+)([AH])\.txt$/i; // e.g. 1A.txt = AI, 1H.txt = Human

  for (const name of files) {
    const m = name.match(re);
    if (!m) continue;
    const id = m[1];
    const kind = m[2].toUpperCase();
    const fullPath = path.join(ARTICLES_DIR, name);
    const text = fs.readFileSync(fullPath, 'utf8').trim();
    if (!text) continue;

    const rec = byId.get(id) || {};
    if (kind === 'A') rec.ai = text;
    if (kind === 'H') rec.human = text;
    byId.set(id, rec);
  }

  const manifest = tryReadManifest();
  const ids = Array.from(byId.keys()).sort((a, b) => Number(a) - Number(b));

  return ids
    .map(id => {
      const rec = byId.get(id) || {};
      if (!rec.ai || !rec.human) return null;
      const name = manifest?.get(id) || `Topic ${id}`;
      return { name, human: rec.human, ai: rec.ai };
    })
    .filter(Boolean);
}

function readTopics() {
  const fromFolder = readTopicsFromArticlesFolder();
  return fromFolder;
}

app.get('/api/topics', (_req, res) => {
  try {
    res.json(readTopics());
  } catch (e) {
    res.status(500).json({ error: 'Failed to read topics', detail: String(e?.message || e) });
  }
});

app.get('/', (_req, res) => {
  res.sendFile(WEB_FILE);
});

const server = app.listen(PORT, () => {
  console.log(`Article rater running: http://localhost:${PORT}/`);
  console.log(`Topics source: ${ARTICLES_DIR}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    console.error(`Close the other server or run with a different port, e.g. "set PORT=3001 && node server.js" (PowerShell: "$env:PORT=3001; node server.js").`);
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});

