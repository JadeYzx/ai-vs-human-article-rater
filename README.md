# Article Rater

A simple web app to **blind-rate AI vs Human articles** across multiple topics.

## Quick start (local)

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
node server.js
```

3. Open the app:

- `http://localhost:3000/`

## Adding / editing topics (recommended)

Topics are loaded from the `articles/` folder. Each topic is a **pair** of text files:

- `1A.txt` = **AI** article for topic 1  
- `1H.txt` = **Human** article for topic 1

Repeat for `2A.txt` + `2H.txt`, etc.

### Naming topics

Create/edit `articles/manifest.json` to name your topics. Two formats are supported.

**Option A (object map):**

```json
{
  "1": "AI Bias / Criminal Justice",
  "2": "Election Security / Foreign Interference"
}
```

**Option B (array):**

```json
[
  { "id": "1", "name": "AI Bias / Criminal Justice" },
  { "id": "2", "name": "Election Security / Foreign Interference" }
]
```

If a topic id is not in the manifest, it will show as `Topic <id>`.

## Notes

- The server listens on port **3000** by default.
- To run on a different port:

```powershell
$env:PORT=3001; node server.js
```

## Deploying later (high level)

This project can run in two ways:

- **Local / server mode**: Node/Express serves `article-rater.html` and exposes `/api/topics`.
- **Static mode (GitHub Pages)**: `article-rater.html` loads `articles/manifest.json` and `articles/*A.txt`/`*H.txt` directly in the browser (no backend).

Common deployment options:

- **Render / Railway / Fly.io**: deploy as a Node service (recommended).
- **Any VPS**: run `node server.js` behind a reverse proxy (nginx/Caddy).

Wherever you deploy, make sure the `articles/` folder is included with your app so the backend can load your topic files.

## Deploy on GitHub Pages

GitHub Pages is **static hosting**, so it will use **Static mode** automatically.

1. Put these files in your repo:
   - `article-rater.html`
   - `articles/manifest.json`
   - `articles/<id>A.txt` and `articles/<id>H.txt` for each topic
2. In GitHub: **Settings → Pages**
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or your default branch), folder `/ (root)`
3. After it deploys, open the Pages URL.

Optional: rename `article-rater.html` to `index.html` so the site loads at the root without needing `/article-rater.html`.

