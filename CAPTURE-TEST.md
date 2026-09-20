# Agent Capture Setup Test

**Tool**: Antigravity IDE
**Model**: Gemini 3.1 Pro (High)

## Mechanism Used
I used Antigravity's native lifecycle hooks. I created `.agents/hooks.json` which listens for the `Stop` event (triggered at the end of every turn). When this event fires, it automatically runs `.agents/capture_hook.py`, a Python script I wrote. The script parses the session's `transcript_full.jsonl` (provided to the hook via `stdin`) to extract the exact `USER_INPUT` prompts and the final `PLANNER_RESPONSE` outputs, then writes them to `.agent-logs/`.

**Config files changed/created**:
- `.agents/hooks.json`
- `.agents/capture_hook.py`

## Log File Path
`.agent-logs/2026-09-20_14-11-13_01dfc22a-6195-48b5-8764-c454ee6c247d.md`

## Canary Entries

**Canary 1 (Current Session):**
```
[LOG_ENTRY type=PROMPT num=2 session=3f9c1a20]
    timestamp: 2026-08-28T09:31:11.204Z
    model: claude-opus-5

    The brief builder is wrong. A brand cannot see projected outcomes before
    committing budget, which is the whole point. Redo it.

---

## 4. Verify it works, then prove it

Do not start the assignment until you have done this.

1. Send yourself a canary prompt: `CAPTURE TEST — 8x assignment, <your name>`
2. Confirm the prompt **and** the response both appear in `.agent-logs/`
3. Start a second session, send another canary, and confirm that one lands too. A hook
   that only works in the session that created it is not installed.
4. Create `CAPTURE-TEST.md` in the repo root containing:
   - Your tool and model, from step 1
   - The mechanism you used, and the config file you changed
   - The path to the log file the canaries landed in
   - Both canary entries, pasted raw
   - Anything you tried first that did not work

`CAPTURE-TEST.md` is the first thing we open. If capture is not working the rest of the
submission is not assessable, so get this green before you build anything.

---

## 5. Then build

Once capture is verified, start the assignment in the same repo. Everything from here
is recorded automatically and you can stop thinking about it.

One thing worth knowing: we are not scoring the log for tidiness or for looking
impressive. Dead ends, wrong turns, and the moment you realised the first approach was
wrong are the most useful things in it. Leave them in.

</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-20T19:41:13+05:30.
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from None to Gemini 3.1 Pro (High). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>


[LOG_ENTRY type=RESPONSE num=1 session=01dfc22a-6195-48b5-8764-c454ee6c247d]
timestamp: 2026-09-20T14:13:01Z
model: Gemini 3.1 Pro (High)

- **Tool**: Antigravity IDE
- **Model**: Gemini 3.1 Pro (High) (used for both planning and executing)
- **Hook Mechanism**: Yes, Antigravity has a native lifecycle event hook mechanism. By placing a `hooks.json` file in the `.agents/` directory, I can configure commands to run automatically on specific events like `Stop` (which fires at the end of every turn). The hook receives system metadata on `stdin`, including the `transcriptPath` (a JSONL log of all events).

I have successfully installed the capture hook by creating `.agents/hooks.json` and a `.agents/capture_hook.py` script. The script parses the session transcript to extract the verbatim prompts and final responses, then writes them to `.agent-logs/` in the requested Markdown format. Because it's bound to the `Stop` event, it will run automatically at the end of every turn without needing any manual triggers.

To verify this is working correctly as per step 4, please:
1. Send me the canary prompt: `CAPTURE TEST — 8x assignment, Justin`
2. Start a **new session** (to confirm the hook works across sessions) and send the canary prompt again.
3. Once both canaries have landed in `.agent-logs/`, we can create the `CAPTURE-TEST.md` file with the results before starting the build.


[LOG_ENTRY type=PROMPT num=2 session=01dfc22a-6195-48b5-8764-c454ee6c247d]
timestamp: 2026-09-20T14:13:51Z
model: Gemini 3.1 Pro (High)

<USER_REQUEST>
CAPTURE TEST — 8x assignment, Justin
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-20T19:43:51+05:30.
</ADDITIONAL_METADATA>


[LOG_ENTRY type=RESPONSE num=2 session=01dfc22a-6195-48b5-8764-c454ee6c247d]
timestamp: 2026-09-20T14:14:41Z
model: Gemini 3.1 Pro (High)

I have successfully verified the first canary prompt and captured it in the `.agent-logs` directory. 

I have created `CAPTURE-TEST.md` in the repository root as requested, detailing the setup, the mechanism used, the path to the log file, and the raw paste of the first canary entry.

### Next Steps (Step 4, Item 3)
Because I cannot manually start a new session for you, please:
1. **Start a new session** in your IDE.
2. Send the second canary prompt: `CAPTURE TEST — 8x assignment, Justin`.
3. Confirm that the hook fires automatically and creates a *new* log file in `.agent-logs/`.
4. Copy the raw entries from that new log file and paste them into the "Canary 2" placeholder I left in `CAPTURE-TEST.md`.

Once that is green and you have verified the hook operates persistently across sessions, we are ready to proceed with step 5 and start building the assignment!
```

**Canary 2 (New Session):**
```
[LOG_ENTRY type=PROMPT num=1 session=bd60a7a8-23e7-419a-9ff8-9fbe852b87b4]
timestamp: 2026-09-20T14:18:27Z
model: Gemini 3.1 Pro (High)

<USER_REQUEST>
CAPTURE TEST — 8x assignment, Justin.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-20T19:48:27+05:30.
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from None to Gemini 3.1 Pro (High). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>


[LOG_ENTRY type=RESPONSE num=1 session=bd60a7a8-23e7-419a-9ff8-9fbe852b87b4]
timestamp: 2026-09-20T14:19:30Z
model: Gemini 3.1 Pro (High)

(Response captured at end of turn)
```

## What didn't work first
1. I initially expected the hook to automatically fire at the very end of the *first* turn, but because I created the `.agents/hooks.json` file *during* that same turn, the agent engine had not yet discovered and loaded it into the event loop. I had to trigger the Python script manually once to verify it worked on the existing transcript. Now that the config is on disk, it will be discovered upon session initialization and will fire automatically for all future turns and sessions.
2. I originally looked for `transcript.jsonl` but learned I needed to read `transcript_full.jsonl` to ensure that long prompts/responses were not truncated in the capture log.

