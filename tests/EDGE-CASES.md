# Fathom Rebuild: Edge Cases Matrix

## 1. Deep Link Boundaries
**Scenario**: Users share URLs with specific timestamps like `/meetings/[id]?start=99999` where the `start` time exceeds the meeting's duration.
**Analysis of Implementation**:
In `src/app/meetings/[id]/page.tsx`, `initialSeekTime` is parsed from the URL and passed to `WorkspaceClient`. It is then forwarded to `Player.tsx`, which executes `video.currentTime = seekTime`. If `seekTime` exceeds the video's actual duration, the HTML5 Video API natively clamps it to the duration. Since no server-side bounds checking occurs, we must ensure the application does not throw an error and that the transcript sync gracefully highlights the final segment.

## 2. Player Sync Race Conditions
**Scenario**: User rapidly clicks transcript segments while the video is buffering, or triggers overlapping seek requests.
**Analysis of Implementation**:
In `WorkspaceClient`, clicking a transcript invokes `handleSeek(time)`. `Player` then updates `video.currentTime` and calls `video.play()`. If a new seek interrupts a pending play promise, the browser throws an `AbortError`. The code handles this via `.catch(e => console.log('Autoplay prevented', e))`, averting uncaught exceptions. We must verify that rapidly clicking 5 different segments resolves to the final clicked segment's time without freezing the UI.

## 3. Fallback Enforcement & LLM Failures
**Scenario**: The LLM API fails, returns malformed JSON, or is rate-limited during Summary Generation.
**Analysis of Implementation**:
In `src/lib/ai.ts`, the `generateSummary` function catches API failures (which is guaranteed locally due to the mocked `GEMINI_API_KEY`). The `catch` block deterministically returns a hardcoded "Fallback Summary" object. `src/app/actions.ts` successfully upserts this object into the database. The user experiences zero UI flash or error toast; the fallback is presented seamlessly. We will verify this smooth transition.

## 4. Search Edge Cases
**Scenario**: SQL injections (`'; DROP TABLE`), extreme character lengths, or special regex characters sent to the `/search` page.
**Analysis of Implementation**:
In `src/app/search/page.tsx`, the search query uses Supabase's `.ilike('title', \`%\${query}%\`)`. Because PostgREST natively parameterizes these inputs, SQL injection is impossible. Empty strings safely render the default UI. However, we must ensure that passing a massively long string or malformed URL encoding does not result in a 500 error from the Next.js server.

## 5. Mutation Collisions (Action Items)
**Scenario**: Rapid-fire toggling of an Action Item checkbox 10 times in 500ms.
**Analysis of Implementation**:
In `src/components/action-items-panel.tsx`, `handleToggle` optimistically updates UI state: `setItems(items.map(...))`. Because it relies on the closure scope of `items` rather than a functional updater (`prev => prev.map(...)`), rapid clicks inside a single render batch will reference stale state. This causes the UI to thrash or drop toggles. We will expose this race condition via Playwright.
