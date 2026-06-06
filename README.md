# talent2030

**Talent2030** — an exploratory demo of what **learning and performance management** could look like at work: structured employee context, **Gemini Live** voice coaching, a live canvas, and Meet-style rehearsal for difficult conversations.

The fictional company is **Acme AI Co.** You sign in as **Will Ray** (VP of Product) and use talent tools grounded in shared markdown context—not a one-off system prompt.

## What you can try

| Area | Route | What it does |
|------|--------|----------------|
| **Landing** | `/` | Concept, context hub diagram, links into the demo |
| **Team** | `/talent` | Roster, signals (self-review, manager review, workplace observations), session focus for a direct report |
| **Coach** | `/talent/coach` | Unified voice coach: copilot, skill paths, freeform explore, rehearsal |
| **Settings** | `/settings` | Inspect and copy the markdown the agents receive |

### Coach modes (`/talent/coach`)

- **Manager copilot** — Voice + live canvas for performance process, leadership, and team questions. Uses `talentmanagement.md` and `employee.md` plus optional session focus on a direct report.
- **Skill paths** — Pick a topic (e.g. Gemini AI, Cursor), short intake, then a generated path with voice-driven slides, web-grounded content, and a verbal knowledge check.
- **Explore freely** — Open-ended learning; the canvas updates from tool calls as you talk.
- **Rehearse** — Meet-style roleplay with **Mark Webb** (demo direct report): camera optional, live coaching HUD cues, post-session assessment. Rehearsal mints an ephemeral Live token with your context snapshot (same pattern as other coach voice modes).

Rehearsal scenarios: `default`, `defensive`, `accepting` (see `src/data/simulateScenarios.ts`).

## Agent context

Context is **markdown generated at runtime** (not static files on disk). In Settings you’ll see the same two logical documents the models use:

- **talentmanagement.md** — Performance cycle, rating scale, COIN delivery framework, timeline, and underperformance guidance.
- **employee.md** — The manager persona (Will Ray): role, team, tools, learning, collaboration, and an **Activity** log that updates as you use the demo (rehearsals, coach sessions, context reviews).

Coach voice modes (including rehearsal) mint **ephemeral tokens** on the server so the browser never holds your long-lived API key. Local `npm run dev` still supports an optional `/live` WebSocket proxy for debugging.

## Tech stack

- **Frontend:** React 19, React Router, Vite, Tailwind CSS 4
- **Backend:** Express + `ws` (dev and production serve the SPA from `dist/`)
- **AI:** Google Gemini (`@google/genai`) — Live API for voice, Flash for path generation and rehearsal analysis
- **Canvas:** json-render specs for skill paths; custom polished canvas for copilot/freeform updates

## Prerequisites

- **Node.js 18+**
- A [Gemini API key](https://aistudio.google.com/apikey) (your own key; never commit it)

## Run locally

```bash
git clone https://github.com/jongrinnellsf/talent2030.git
cd talent2030
npm install
cp .env.example .env
# Edit .env and set GEMINI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Open the demo** → **Team** or **Coach**. Allow **microphone** (and **camera** for rehearsal) when prompted.

Restart the dev server after changing `.env`. If voice fails, check the terminal for `Gemini API key loaded` and `Gemini Live session ready`.

### Production build

```bash
npm run build
GEMINI_API_KEY="your-key" npm start
```

Serves on port **3000** (`0.0.0.0`).

### Deploy to Vercel

The repo includes `vercel.json` and `api/index.ts` (Express as a serverless function). Import the GitHub repo in [Vercel](https://vercel.com/new) or use the CLI:

```bash
npx vercel link          # once, connect to jongrinnellsf/talent2030
npx vercel env add GEMINI_API_KEY production
npm run build            # optional local smoke test
npx vercel --prod
```

**Environment variable (required):** `GEMINI_API_KEY` — same key as local `.env`.

**What works on Vercel**

- Landing, Team, Settings UI
- Manager copilot, skill paths, freeform explore, and **rehearsal** (voice via ephemeral tokens + REST APIs)

### Other scripts

| Command | Purpose |
|---------|---------|
| `npm run lint` | Typecheck (`tsc --noEmit`) |
| `npm run sync:voice-dna` | Regenerate voice-dna agent skill markdown from `src/data/skills/voiceDnaSkill.ts` |

## Deep links

Legacy paths redirect to the routes above (`/coach`, `/performance/*`, `/learning/*`, `/dashboard`, `/skill`).

| URL | Effect |
|-----|--------|
| `/talent/coach?surface=rehearse` | Open rehearsal (Mark Webb) |
| `/talent/coach?surface=rehearse&scenario=defensive` | Rehearsal with a sharper tone |
| `/talent/coach?surface=rehearse&autostart=1` | Rehearsal and auto-start the session |
| `/talent/coach?mode=coach` or `?mode=brainstorm` | Manager copilot |
| `/talent/coach?mode=coach&employee=<id>` | Copilot with session focus on a direct report |
| `/talent/coach?surface=freeform` | Explore freely |
| `/talent?employee=<id>` | Team view with that report selected |

## API routes (server)

All require `GEMINI_API_KEY` on the server.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/learning/live-token` | Ephemeral token for client Live sessions |
| `POST` | `/api/learning/generate` | Stream a skill path spec |
| `POST` | `/api/learning/generate-personalized-path` | Personalized path after intake |
| `POST` | `/api/rehearse/live-token` | Ephemeral token for rehearsal Live sessions |
| `POST` | `/api/rehearse/hud-cue` | Live coaching HUD during rehearsal |
| `POST` | `/api/rehearse/assess` | Post-rehearsal assessment |
| WebSocket | `/live` | Optional server-proxied Live (local dev with WebSockets only) |

## Tips

- Use **headphones** so the mic does not pick up the coach’s voice and trigger interruptions.
- After rehearsal, open **Settings** → **employee.md** and confirm the activity log includes the session.
- **Team** → select a report before copilot if you want session focus grounded in that person’s signals.

## Security

- `.env` is gitignored. Use `.env.example` as a template only.
- Do not deploy with a shared API key on a public URL without rate limits, spend caps, and key restrictions. For open source, contributors should run locally with their own key.

## License

Apache-2.0 (see SPDX headers in source files).
