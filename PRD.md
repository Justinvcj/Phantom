# Fathom Rebuild — PRD
**8x Software Engineer take-home — 24-hour window**

---

## 0. Ground rules (from the brief, restated so nothing gets lost)

- Judged on **speed**, **product judgment** (what you built vs. deliberately skipped), **UX/UI**. Not feature count.
- Recording/capture bot can be stubbed — say so on camera.
- Deliverables: live URL (not localhost, works logged-out), public repo with `.agent-logs/` committed incrementally, ≤5-min walkthrough, camera on.
- `.agent-logs/` capture must be verified (`CAPTURE-TEST.md` green) **before** any app code is written.

---

## 1. Tech stack — chosen for agent throughput, not familiarity

The constraint that matters most here isn't "what's fastest to write" — it's **what an AI coding agent can generate correctly on the first or second pass, with the least debugging loop**. That means picking the most heavily-represented, most conventionally-structured stack available, so Antigravity spends its time producing features instead of fighting unfamiliar patterns.

| Layer | Choice | Why this over alternatives |
|---|---|---|
| Framework | **Next.js 14/15, App Router, TypeScript** | Best-represented full-stack framework in any model's training data; agent rarely invents wrong APIs. App Router lets one codebase serve both UI and API routes — no separate backend to keep in sync. |
| Styling | **Tailwind CSS + shadcn/ui** | shadcn components are copy-in, not a black-box dependency — agent can read and modify the actual component code when something needs to deviate from default. Fastest path to a polished, non-templated look. |
| Database | **Supabase (Postgres)** | You already know it, it's in your skill set, and it gives Postgres + instant REST/JS client + storage (for sample audio/video assets) in one provisioned service — no separate file storage to wire up. |
| ORM/queries | **Supabase JS client directly**, no separate ORM | One less abstraction layer for the agent to get wrong under time pressure. Add Drizzle/Prisma only if the schema grows past ~8 tables and raw queries get unwieldy. |
| AI | **One primary LLM (Gemini or OpenAI) + deterministic seeded fallback** | Never let the demo depend on a live API call succeeding on camera. |
| Deployment | **Vercel** | Zero-config Next.js deploys, generous free tier, a `git push` away from a public URL — the single fastest path from code to "live link." |
| Recon tooling | **Playwright MCP (in Antigravity)** | See §2. |

**Do not introduce:** a separate backend service, GraphQL, microservices, Redis, a monorepo tool, or any infra whose only job is to look sophisticated. Every one of those is time spent on something the rubric doesn't reward.

---

## 2. Using Playwright MCP for recon

**What it's good for:**
- Navigating fathom.video's marketing pages, help center, and any public demo/product-tour pages and screenshotting every state.
- If you complete signup, driving the actual dashboard: opening each nav item, template dropdown, search bar, share dialog — and screenshotting each state systematically instead of relying on memory afterward.
- Producing a clean, ordered set of images you can drop straight into a `/recon/screens/` folder with consistent naming (`01-dashboard.png`, `02-meeting-summary.png`...) — which is also great b-roll structure for planning the walkthrough later.

**Where it won't help, and don't force it:**
- The actual "get the notetaker into a real Zoom/Meet call" step needs a real meeting with a real join — that's you, not the agent, clicking through an actual video call. Don't try to automate this away; it's a small time cost and it's explicitly required.
- If signup gates behind Google OAuth + email verification + calendar permission grants, Playwright may hit friction (consent screens, 2FA). Don't burn more than ~15 minutes fighting it — if it stalls, fall back to manual click-through for just that step and let Playwright handle everything else.

**Recon workflow:**
1. Playwright MCP: crawl marketing/help pages → screenshot every distinct screen/state mentioned in the brief (calendar connect, notetaker joining, playback, transcript, summary, templates, action items, highlight, search, share, an existing large multi-person meeting if any example/demo one is public).
2. You manually: do the actual 2-minute Zoom/Meet call with yourself + the notetaker, watch it process, screenshot the result.
3. Fill in the feature matrix below from what you actually saw — not from assumption.

---

## 3. Product understanding — the core loop

```
Meeting created → transcript generated → playback ↔ transcript sync
    → AI summary (per template) → action items extracted
    → highlights markable during playback → clip shareable
    → all of it searchable across the whole meeting library
```

Every feature in this PRD earns its place by strengthening one edge of that loop. If a feature you're tempted to add doesn't sit on this loop, it's out of scope for a 24-hour build.

---

## 4. Feature matrix (fill the middle column in after recon; priorities below are the starting assumption)

| Feature | Fathom behavior (confirm via recon) | Our version | Priority |
|---|---|---|---|
| Dashboard / meeting library | — | Populated on load, no empty state | P0 |
| Recording/capture | — | Stubbed: fake "Recording → Processing → Ready" sequence over pre-loaded sample media | P0 |
| Transcript | — | Seeded, speaker-labeled, timestamped segments | P0 |
| Playback ↔ transcript sync | — | Click segment → seek; playback time → active segment highlight | P0 |
| AI summary | — | Real LLM call with structured seeded fallback | P0 |
| Summary templates | — | ≥3 templates that visibly restructure the summary | P0 |
| Action items | — | Interactive: assignee, due date, complete toggle | P0 |
| Highlights | — | Create during playback, list view, click-to-seek | P0 |
| Global search | — | Full-text across transcripts, not just titles; result → meeting + timestamp | P0 |
| Clip sharing | — | Shareable URL encoding meeting + start/end, opens to that clip context | P0 |
| Large meeting (8p/1h) | — | One seeded meeting stress-tested against all of the above | P0 |
| Calendar connect | Real | Visual mock only (a connect button + fake "connected" state) | P2 |
| Real notetaker bot | Real | **Explicitly not built** | Out of scope |
