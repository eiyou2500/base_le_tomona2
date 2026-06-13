#!/usr/bin/env python3
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

def iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

try:
    json.load(sys.stdin)
except Exception:
    pass
root = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())
out = root / ".codex" / "verify-output"
out.mkdir(parents=True, exist_ok=True)
result = subprocess.run(["make", "verify"], cwd=root, text=True, capture_output=True)
combined = result.stdout + result.stderr
latest = out / "latest.log"
latest.write_text(combined, encoding="utf-8")
(out / f"stop-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}.log").write_text(combined, encoding="utf-8")
status_path = root / "VERIFY_STATUS.json"
status = {}
if status_path.exists():
    try:
        status = json.loads(status_path.read_text(encoding="utf-8"))
    except Exception:
        status = {}
state_path = root / ".codex" / "verify-state.json"
if result.returncode == 0 and status.get("status") == "PASS":
    state_path.write_text(json.dumps({"consecutive_failures": 0}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"systemMessage": "make verify passed and VERIFY_STATUS.json is PASS."}, ensure_ascii=False))
    sys.exit(0)
state = {"consecutive_failures": 0}
if state_path.exists():
    try:
        state = json.loads(state_path.read_text(encoding="utf-8"))
    except Exception:
        pass
state["consecutive_failures"] = int(state.get("consecutive_failures", 0)) + 1
state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
max_loops = int(os.environ.get("CODEX_VERIFY_MAX_LOOPS", "6"))
with (root / "LOOP_LOG.md").open("a", encoding="utf-8") as fh:
    fh.write(f"\n- {iso()} Stop hook FAIL {state['consecutive_failures']}/{max_loops}: make verify failed.\n")
if state["consecutive_failures"] >= max_loops:
    blocked = {
        "status": "BLOCKED",
        "reason": "Stop hook reached maximum consecutive verification failures; manual intervention required.",
        "verified_at": iso(),
        "commands": [{"command": "make verify", "exit_code": result.returncode, "log": ".codex/verify-output/latest.log"}],
    }
    status_path.write_text(json.dumps(blocked, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with (root / "LOOP_LOG.md").open("a", encoding="utf-8") as fh:
        fh.write(f"\n- {iso()} BLOCKED: maximum consecutive verification failures reached.\n")
    print(json.dumps({"continue": False, "reason": "BLOCKED: make verify failed repeatedly. Read .codex/verify-output/latest.log and intervene manually; this is not DONE."}, ensure_ascii=False))
    sys.exit(0)
print(json.dumps({"decision": "block", "reason": "make verify failed. Read .codex/verify-output/latest.log, fix the smallest failing cause, update LOOP_LOG.md, rerun make verify, and do not claim completion until VERIFY_STATUS.json says PASS."}, ensure_ascii=False))
sys.exit(0)
