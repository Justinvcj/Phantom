# Fathom Rebuild — Execution Plan
**8x Software Engineer take-home**

---

## 1. Seed data plan

Minimum six meetings, one of which is the mandatory stress case:

1. **Q3 Product Strategy** — 8 participants, 1h03m, 1000+ transcript segments, 10+ highlights, 8+ action items (the stress-test meeting)
2. Engineering Sync — 5 participants, 34m
3. Client Discovery — 4 participants, 42m
4. Weekly 1:1 — 2 participants, 28m
5. Sprint Planning — 7 participants, 51m
6. Design Review — 4 participants, 37m

Write a seed script (`lib/seed/run.ts`) rather than hand-inserting rows — makes it trivial to regenerate or extend the large meeting if it's not stressing the UI enough on first test. Use a short royalty-free sample video/audio clip (looped or trimmed to match each meeting's stated duration) for playback.

---

## 2. Testing / QA strategy

- Functional pass through every item in the brief's own final QA checklist.
- **Dedicated stress pass on the 8-person/1-hour meeting specifically:** transcript scroll performance, search latency against 1000+ segments, timestamp-jump accuracy, summary readability at that length, highlight list usability once there are 10+.
- Logged-out check: open the live URL in a private/incognito window before submitting — confirm it renders without your session.

---

## 3. Deployment

- Vercel project linked to the GitHub repo from hour one — every push after that auto-deploys, so "live link" is never a separate last-minute step.
- Environment variables (Supabase keys, LLM API key) set in Vercel dashboard, never committed.
- Final pre-submission check: the QA checklist run against the **deployed** URL, not localhost.

---

## 4. GitHub repo — create it now, first thing

Before anything else, including recon:

1. **The capture hook needs somewhere to commit into.** `.agent-logs/` is a directory *in the repo*; no repo, nowhere for the hook to write to.
2. **Commit order is itself evidence.** The brief says commit logs "as we work... not in one dump at the end" — the reviewer needs to see recon → capture verification → scaffolding → features in the actual git history. That only works if the repo exists before step one.
3. Connecting Vercel to a repo that already exists means every subsequent push deploys automatically — no scrambling to wire up deployment in the last hour.

**Order of operations:**
```
1. Create public repo on GitHub (empty is fine)
2. Clone locally, open in Antigravity
3. Install + verify the capture hook → commit CAPTURE-TEST.md (first real commit)
4. Recon pass (Playwright screenshots → /recon folder) → commit
5. Next.js scaffold → commit → connect to Vercel
6. Everything else per the phase plan below, committing continuously
```

---

## 5. 24-hour execution timeline

| Phase | Time | Deliverable at end of phase |
|---|---|---|
| 0 | 0:00–0:45 | Repo created, capture hook verified, `CAPTURE-TEST.md` committed |
| 1 | 0:45–2:00 | Recon complete (Playwright + manual notetaker test), feature matrix filled in |
| 2 | 2:00–4:00 | Next.js + Supabase scaffold, deployed empty shell live on Vercel, dashboard shell |
| 3 | 4:00–7:00 | Seed data loaded, meeting workspace shell, transcript + player + **sync working** |
| 4 | 7:00–10:00 | AI summary (+ fallback) + templates + action items |
| 5 | 10:00–12:30 | Highlights + clip sharing |
| 6 | 12:30–14:30 | Global search |
| 7 | 14:30–16:30 | Large-meeting stress test + fixes |
| 8 | 16:30–19:00 | UI/UX polish pass |
| 9 | 19:00–20:00 | Full QA checklist against deployed URL, logged-out check |
| 10 | 20:00–21:00 | Walkthrough recording |
| — | 21:00–24:00 | Buffer — do not plan to need it, but don't submit right at the wire either |

This targets a ~20-hour build with real buffer, matching the brief's own hint that they don't expect the full 24.

---

## 6. Risks and explicit non-goals

**Risks:**
- LLM call flaking during the live walkthrough → mitigated by seeded fallback, non-negotiable.
- Transcript/player sync being fiddly to get pixel/second-perfect → budget real time for it in Phase 3, it's the single highest-leverage feature.
- Playwright recon stalling on OAuth-gated signup → cap it at 15 minutes, fall back to manual.
- Scope creep on templates ("just one more industry vertical") → hard cap at 3–5, structure-only differentiation.

**Explicit non-goals (state these on camera, don't apologize for them):**
Real Zoom/Meet/Teams bot integration, real-time transcription/diarization, real calendar OAuth, CRM/Slack integrations, billing, enterprise permissions, mobile app, browser extension, desktop app.

---

## 7. Walkthrough script (≤5 min)

| Time | Content |
|---|---|
| 0:00–0:30 | What this is, and the one deliberate scope call (stubbed capture layer) stated up front, confidently |
| 0:30–2:30 | Live demo: dashboard → meeting → playback ↔ transcript → summary → switch template → action items → create a highlight |
| 2:30–3:30 | Search across meetings → clip share link |
| 3:30–4:15 | The 8-person/1-hour meeting specifically — show it holds up |
| 4:15–5:00 | What was cut and why, what you spent the saved time on instead |

Central line to land: *"I optimized the meeting-intelligence experience rather than meeting-capture infrastructure, because that's where the actual product value is."*
