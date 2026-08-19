# URL Analyzer

A full-stack web app that checks whether a URL is safe, by cross-referencing it against real threat-intelligence sources (Google Safe Browsing and VirusTotal) rather than a single local blocklist.

Built as a learning project to go from frontend-only knowledge (HTML/CSS/JS) to a complete full-stack, containerized, deployable application.

---

## Tech Stack

| Layer      | Tech                                      | Why |
|------------|--------------------------------------------|-----|
| Frontend   | React + TypeScript + Vite + Tailwind CSS  | React is the current industry-standard frontend framework; TypeScript catches errors before runtime; Vite gives a fast dev server and build pipeline |
| Backend    | FastAPI (Python)                           | Modern, fast, auto-generates interactive API docs, plays well with type hints |
| Database   | PostgreSQL (via SQLAlchemy ORM)            | Relational DB well suited for structured lookup history; SQLAlchemy maps Python objects to SQL tables |
| Containerization | Docker + Docker Compose              | Reproducible environment — runs identically on any machine; orchestrates backend + frontend + database together |
| Threat Intelligence | Google Safe Browsing API, VirusTotal API | Real-world APIs used by browsers and security tools, rather than building malware detection from scratch |

---

## Architecture

```
Frontend (React, browser)  --HTTP request-->   Backend (FastAPI)   --SQL-->   PostgreSQL
Frontend (React, browser)  <--JSON response--   Backend (FastAPI)   <--rows--  PostgreSQL
```

- **Frontend** is the client — runs in the browser, only ever speaks HTTP/JSON. It never talks to the database directly.
- **Backend** is the server *and* the API — the same thing, in this context. It's the only piece that knows the database exists, holds the DB credentials, and enforces what's allowed.
- **Database** is pure storage — reachable only by the backend.

This separation exists mainly for security: if the frontend could reach the database directly, DB credentials would have to live in browser-visible JavaScript, where anyone could steal them via dev tools.

---

## What each part of the backend does

- **`main.py`** — the FastAPI app itself: defines routes (`/`, `/check`, `/history`), wires up CORS, creates DB tables on startup.
- **`models.py`** — the `Lookup` SQLAlchemy model, mapping a Python class to a `lookups` table in Postgres (url, verdict, sources, timestamp).
- **`database.py`** — sets up the SQLAlchemy engine/session and the `get_db()` dependency, which hands a fresh DB session to each request and guarantees it's closed afterward.
- **`services/safe_browsing.py`** — wraps the Google Safe Browsing API: submits a URL, checks if it's flagged for malware/phishing/unwanted software.
- **`services/virustotal.py`** — wraps the VirusTotal API: looks up an existing scan by the URL's ID, or submits and polls for a new one if none exists. Returns how many of ~90 antivirus engines flagged it.
- **`services/aggregator.py`** — combines both sources into a single verdict (safe/malicious).

### Why an aggregator instead of building real malware detection

Building actual malware/phishing detection from scratch would require massive threat databases and ML models that take companies years to build. Instead, this project aggregates results from existing, free threat-intelligence APIs — the same real-world pattern most backend engineering work follows: gluing together external services rather than reinventing them.

---

## Security: CAPTCHA Protection

The `/check` endpoint is publicly accessible, so it's protected with [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) to prevent automated abuse.

**How it works:**
1. The frontend renders a Turnstile widget, which generates a one-time verification token once the user completes it.
2. That token is sent alongside the URL to the backend's `/check` endpoint.
3. The backend independently verifies the token with Cloudflare's API before processing any request — a request without a valid token is rejected with `403 Forbidden`, regardless of what the frontend sends.

This matters because frontend-only checks are never sufficient — anyone can call the API directly (e.g. via `curl`), bypassing the widget entirely. The real protection is the backend's independent verification step, not the widget itself.

**Why this was added:** without it, the `/check` endpoint had no safeguard against scripted abuse, which could exhaust the free-tier VirusTotal rate limit (4 requests/minute) or run up usage on a paid tier.

---

## Why caching matters here

`/check` looks up the URL in Postgres first before calling the external APIs. This matters for two reasons:
1. **Speed** — a cached lookup returns instantly instead of waiting on two external API calls.
2. **Rate limits** — VirusTotal's free tier allows only 4 requests/minute. Without caching, repeated checks of the same URL would quickly exhaust that quota.

---

## Environment variables (`.env`, never committed)

```
DATABASE_URL=postgresql://postgres:postgres@db:5432/urlchecker
GOOGLE_SAFE_BROWSING_KEY=your_key_here
VIRUSTOTAL_KEY=your_key_here
```

Inside Docker, the database host is `db` (the service name in `docker-compose.yml`), not `localhost` — containers reach each other by service name over Docker's internal network.

---

## Running locally

### With Docker (recommended — matches production environment)
```bash
docker compose up --build
```
- Frontend → http://localhost:5173
- Backend → http://localhost:8000 (interactive docs at /docs)
- Postgres → running internally, reachable from the backend at host `db`

### Without Docker (faster iteration during active development)
Two separate terminals:
```bash
# Terminal 1 — backend
cd backend
source venv/bin/activate
uvicorn main:app --reload

# Terminal 2 — frontend
cd frontend
npm run dev
```

---

## Git workflow used throughout this project

```bash
git checkout main
git pull
git checkout -b feature/xyz

# ...write code...

git add .
git commit -m "feat: description"
git push -u origin feature/xyz

# → open PR on GitHub → review diff → Merge

git checkout main
git pull
```

- `main` is always kept deployable — no direct commits once real functionality exists.
- Small, frequent commits with descriptive messages, rather than large infrequent ones.
- Every feature goes through a PR, even solo — builds the review habit and keeps a readable history.

---

## Good practices followed in this project

- **Secrets never committed** — all API keys and DB credentials live in `.env`, which is gitignored.
- **Virtual environment per project** (Python) — dependencies isolated, reproducible via `requirements.txt`.
- **CORS explicitly scoped** — the backend only allows requests from the known frontend origin, not `*`.
- **Multi-stage Docker build for the frontend** — the final image contains only the compiled static files served by nginx, not the Node toolchain or source code, keeping the image small.
- **`.dockerignore` / `.gitignore`** — prevents `node_modules/`, `venv/`, and secrets from ever being copied into images or commits.

---

## Known limitations / honest caveats

- VirusTotal's free tier is rate-limited to 4 requests/minute — the caching layer mitigates this but doesn't eliminate it under heavy use.
- The two external API calls (Safe Browsing, VirusTotal) currently run sequentially rather than in parallel — a future optimization would use `asyncio` to run them concurrently and cut response time roughly in half.
- The verdict logic is binary (safe/malicious) — a more nuanced "suspicious" middle tier could be added based on partial VirusTotal flags.
- No authentication yet — the API is fully public. Fine for a portfolio demo, not appropriate as-is for a production tool handling any sensitive data.

---

## Deployment

- **Frontend** → Vercel or Netlify (free, permanent, git-based auto-deploy)
- **Backend** → Render (free tier: 750 hrs/month of web service usage, no credit card required)
- **Database** → Neon or Supabase (free tier is permanent and doesn't expire, unlike Render's own free Postgres, which is deleted after 30 days)

---

## What this project demonstrates

- Full request lifecycle: browser → HTTP → backend → SQL → database → JSON → browser
- Integrating multiple real third-party APIs and aggregating their results
- A caching layer that respects external rate limits
- Containerization with Docker and Docker Compose for environment parity between local dev and (eventual) production
- A disciplined git workflow (branches, PRs, meaningful commit history)

## Author

Built by **Kimberly Paredes**

- GitHub: [github.com/BlueSocks-code](https://github.com/BlueSocks-code)
- LinkedIn: www.linkedin.com/in/kimberly-paredes-gribova

Built as a hands-on project to go from frontend-only knowledge to a complete, deployed full-stack application — covering backend API design, database integration, containerization, deployment, and production security practices along the way.
