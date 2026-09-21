# Security Audit Report: Fathom Rebuild

## Executive Summary
This report outlines the findings of a rigorous static and configuration-level security audit across the Next.js and Supabase architecture. Several critical (P0) architectural vulnerabilities were discovered, stemming from the rapid scaffolding phase, particularly around Row Level Security (RLS) and Server Action validation.

## Findings & Remediation Plan

| Category | Finding / Risk Level | Affected File / Function | Recommended Remediation |
|---|---|---|---|
| **Database / RLS** | **Missing RLS (High)**: All tables completely lack Row Level Security. The `anon` key is currently used for mutations, meaning anyone can execute raw `INSERT`/`UPDATE`/`DELETE` queries directly against the Supabase REST endpoint without going through the Next.js app. | `src/lib/seed/schema.sql`, `src/lib/supabase/server.ts` | 1. Enable RLS on all tables.<br>2. Add `SELECT` policies for `anon`.<br>3. Block `INSERT`/`UPDATE`/`DELETE` for `anon`.<br>4. Transition all Next.js Server Actions to use an internal `service_role` client for mutations. |
| **Server Actions** | **Missing Validation (High)**: `toggleActionItem`, `createHighlight`, and `generateMeetingSummary` accept unvalidated payloads. Attackers can manipulate UUIDs or inject massive payloads. | `src/app/actions.ts`, `src/app/actions-client.ts` | Implement `zod` schema validation on all incoming Server Action parameters (e.g., `z.string().uuid()`) before executing DB queries. |
| **Prompt & LLM Security** | **Schema Fragility (Medium)**: `generateSummary` passes the transcript directly to the LLM and relies entirely on prompt instructions to format the JSON. Prompt injection inside the transcript could easily derail the JSON output, causing `JSON.parse` crashes. | `src/lib/ai.ts` | Utilize the `@google/genai` SDK's native `responseSchema` configuration to strictly enforce the JSON structure at the API level, preventing adversarial text from breaking the parser. |
| **Injection / XSS** | **Search ReDoS (Medium)**: The `/search` endpoint pipes the raw query directly into an `.ilike()` filter. While Supabase sanitizes SQL injection, massive query strings could trigger a Database Denial of Service (ReDoS / Timeout). | `src/app/search/page.tsx` | Truncate the search query to a maximum safe length (e.g., 100 characters) before executing the query. |
| **Secret Management** | **Clean (Low)**: No `.env` secrets have been committed to the repository. The `.gitignore` properly excludes local configurations. | `.gitignore` | Maintain current hygiene. |

---

*I will now proceed to implement these defensive mitigations across the codebase incrementally.*
