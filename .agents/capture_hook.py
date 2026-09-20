import sys
import json
import os
import datetime
import traceback

def main():
    try:
        # Read payload from stdin
        input_data = sys.stdin.read()
        payload = json.loads(input_data)
        
        transcript_path = payload.get("transcriptPath")
        model_name = payload.get("modelName", "unknown")
        session_id = payload.get("conversationId", "unknown_session")
        author = "Justinvcj"  # from repo url
        
        if not transcript_path:
            print("{}")
            return
            
        # Use transcript_full.jsonl to avoid truncated fields
        transcript_full_path = transcript_path.replace("transcript.jsonl", "transcript_full.jsonl")
        if os.path.exists(transcript_full_path):
            transcript_path = transcript_full_path
            
        if not os.path.exists(transcript_path):
            print("{}")
            return
            
        with open(transcript_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # Parse transcript
        turns = []
        current_turn = None
        
        for line in lines:
            if not line.strip(): continue
            try:
                step = json.loads(line)
                if step.get("type") == "USER_INPUT":
                    if current_turn:
                        turns.append(current_turn)
                    current_turn = {
                        "prompt": step.get("content", ""),
                        "prompt_time": step.get("created_at"),
                        "responses": [],
                        "response_time": None
                    }
                elif step.get("type") == "PLANNER_RESPONSE" and current_turn is not None:
                    content = step.get("content")
                    if content:  # non-empty
                        current_turn["responses"].append(content)
                        current_turn["response_time"] = step.get("created_at")
            except Exception:
                pass
                
        if current_turn:
            turns.append(current_turn)
            
        if not turns:
            print("{}")
            return
            
        # Determine filename and metadata
        first_prompt_time_str = turns[0]["prompt_time"]
        try:
            # Parse 2026-09-20T14:11:13Z
            dt = datetime.datetime.strptime(first_prompt_time_str, "%Y-%m-%dT%H:%M:%SZ")
            date_str = dt.strftime("%Y-%m-%d")
            filename_prefix = dt.strftime("%Y-%m-%d_%H-%M-%S")
        except:
            dt = datetime.datetime.now(datetime.timezone.utc)
            date_str = dt.strftime("%Y-%m-%d")
            filename_prefix = dt.strftime("%Y-%m-%d_%H-%M-%S")
            
        # Determine repo_root dynamically from the script location
        repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        log_dir = os.path.join(repo_root, ".agent-logs")
        os.makedirs(log_dir, exist_ok=True)
        
        log_file = os.path.join(log_dir, f"{filename_prefix}_{session_id}.md")
        
        # Calculate stats
        total_exchanges = len(turns)
        first_prompt_time = turns[0]["prompt_time"]
        last_prompt_time = turns[-1]["prompt_time"]
        
        # Format the log file
        log_content = f"""---
session_id: {session_id}
date: {date_str}
author: {author}
model: {model_name}
tool: antigravity
project: Phantom
total_exchanges: {total_exchanges}
first_prompt_time: {first_prompt_time}
last_prompt_time: {last_prompt_time}
---

# Session Log - {date_str}

Session: `{session_id}` | Project: `Phantom` | Author: `{author}`

---

"""
        
        for i, turn in enumerate(turns):
            num = i + 1
            log_content += f"[LOG_ENTRY type=PROMPT num={num} session={session_id}]\n"
            log_content += f"timestamp: {turn['prompt_time']}\n"
            log_content += f"model: {model_name}\n\n"
            log_content += turn['prompt'].strip() + "\n\n\n"
            
            resp_content = "\n\n".join(turn["responses"]).strip()
            resp_time = turn["response_time"] or turn["prompt_time"]
            
            log_content += f"[LOG_ENTRY type=RESPONSE num={num} session={session_id}]\n"
            log_content += f"timestamp: {resp_time}\n"
            log_content += f"model: {model_name}\n\n"
            log_content += resp_content + "\n\n\n"
            
        with open(log_file, 'w', encoding='utf-8') as f:
            f.write(log_content)
            
        # Return empty json for Stop hook
        print("{}")
    except Exception as e:
        # Silently fail but output empty json to satisfy hook contract
        print("{}")

if __name__ == "__main__":
    main()
