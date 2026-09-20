# Fathom Rebuild — Architecture
**8x Software Engineer take-home**

---

## 1. Information architecture

```
/                       → Dashboard (meeting list, search bar, "new demo meeting" CTA)
/meetings/[id]          → Meeting workspace
  ?tab=overview          - AI summary + action items panel
  ?tab=transcript         - Full transcript, synced to player
  ?tab=highlights         - Highlight list
/search?q=...           → Cross-meeting search results
/meetings/[id]?start=&end= → Clip-share deep link (opens workspace scrolled/seeked to range)
```

Single workspace route with tab state in the URL (not separate pages) keeps the summary/transcript/highlights/actions genuinely interconnected — clicking a summary bullet can jump straight to a transcript timestamp without a page transition.

---

## 2. Data model

```sql
users (
  id uuid pk,
  name text,
  email text
)

meetings (
  id uuid pk,
  title text,
  description text,
  date timestamptz,
  duration_seconds int,
  recording_url text,       -- points at seeded sample media
  status text,               -- 'ready' | 'processing' (for the fake capture flow)
  created_at timestamptz
)

participants (
  id uuid pk,
  meeting_id uuid fk,
  name text,
  email text
)

transcript_segments (
  id uuid pk,
  meeting_id uuid fk,
  speaker_id uuid fk -> participants,
  start_time int,     -- seconds
  end_time int,
  text text
)

summaries (
  id uuid pk,
  meeting_id uuid fk,
  template text,       -- 'general' | 'sales' | 'product' | '1:1' | 'interview'
  overview text,
  key_points jsonb,     -- structure varies by template
  generated_at timestamptz
)

action_items (
  id uuid pk,
  meeting_id uuid fk,
  assignee text,
  text text,
  due_date date,
  completed boolean default false
)

highlights (
  id uuid pk,
  meeting_id uuid fk,
  start_time int,
  end_time int,
  note text,
  created_at timestamptz
)
```

Nothing beyond this unless recon surfaces a Fathom behavior that genuinely needs it. Resist adding tables "for completeness."

---

## 3. Backend architecture (Next.js API routes / server actions)

```
POST /api/meetings/demo          → creates a new "meeting" from a template, kicks off fake processing state
GET  /api/meetings               → list for dashboard
GET  /api/meetings/[id]          → full meeting payload (transcript + summary + actions + highlights)
POST /api/meetings/[id]/summary  → regenerate summary for a given template (LLM call + fallback)
POST /api/actions/[id]/toggle    → complete/uncomplete
POST /api/highlights             → create highlight
GET  /api/search?q=              → full-text search across transcript_segments (Postgres `tsvector` or ILIKE for v1)
```

Use Next.js Server Actions for anything mutation-only and tied to a single form/button (action-item toggle, highlight create) — fewer files, less boilerplate, faster for the agent to generate correctly. Reserve route handlers for things a client component needs to `fetch` (search-as-you-type, summary regeneration).

---

## 4. AI architecture

- **Summary generation:** one prompt per template, each with an explicit output schema (JSON: `overview`, `key_points: []`, section labels specific to the template). Validate/parse; on failure or timeout, fall back to a pre-written seeded summary for that meeting+template pair — **never show an error state or blank summary on camera.**
- **Templates as prompt variants**, not separate systems: same call, different system prompt describing the target structure (sales → pain points/objections/next steps; product → decisions/risks/actions; etc). This satisfies "switching templates visibly changes the summary" without building 5 pipelines.
- **Search:** start with Postgres `ILIKE`/`tsvector` on transcript text — no need for a vector DB or embeddings for a 24-hour build. Only reach for embeddings if literal keyword search demonstrably fails on your seed data (it won't).

---

## 5. Frontend architecture

```
app/
  page.tsx                       → Dashboard
  meetings/[id]/page.tsx         → Workspace (tabs via searchParams)
  search/page.tsx
components/
  meeting-card.tsx
  player.tsx                     → wraps <video>/<audio>, exposes currentTime via context
  transcript-panel.tsx           → subscribes to player time, highlights active segment
  summary-panel.tsx
  action-items-panel.tsx
  highlights-panel.tsx
  template-switcher.tsx
  search-bar.tsx
lib/
  supabase.ts
  ai.ts                          → summary generation + fallback logic
  seed/                          → seed data + seeding script
```

State: a single `PlayerContext` (currentTime, seek()) shared by the player, transcript, and highlights components is the one piece of real client state complexity in the app — get this right first, everything else is CRUD around it.
