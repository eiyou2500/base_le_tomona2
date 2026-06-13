#!/usr/bin/env bash
set -u -o pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
mkdir -p .codex/verify-output
LOG=.codex/verify-output/latest.log
: > "$LOG"
iso() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
json_escape() { python3 -c 'import json,sys; print(json.dumps(sys.stdin.read())[1:-1])'; }
write_status() {
  local status="$1" reason="$2" exit_code="$3"
  cat > VERIFY_STATUS.json <<JSON
{
  "status": "$status",
  "reason": "$reason",
  "verified_at": "$(iso)",
  "commands": [
    {
      "command": "make verify",
      "exit_code": $exit_code,
      "log": ".codex/verify-output/latest.log"
    }
  ],
  "p1_findings": [],
  "manual_checks_remaining": [
    "BASE live checkout",
    "BASE pickup reservation flow",
    "BASE HTML編集 App preview",
    "BASE テイクアウト App での受け取り日時選択",
    "Instagram アプリ内ブラウザ",
    "実機スマートフォン",
    "食品表示の最終確認"
  ]
}
JSON
}
write_report() {
  local status="$1" reason="$2" failed_step="$3"
  cat > VERIFY_REPORT.md <<MD
# Verify report

## Status

$status

## Evidence reviewed

- Repository files
- Build output in dist/index.html
- Command log at .codex/verify-output/latest.log
- Release checklist at docs/release-checklist.md

## Commands run

- make verify
- npm install
- npm run lint
- npm run format
- npm run build
- npm run test
- node scripts/verify-content.mjs
- node scripts/verify-release.mjs

## P1 findings

$([ "$status" = "PASS" ] && echo "None." || echo "make verify failed at: $failed_step")

## P2 findings

- Manual BASE checks remain outside local automation.

## Manual checks still required

- BASE live checkout
- BASE pickup reservation flow
- BASE HTML編集 App preview
- BASE テイクアウト App での受け取り日時選択
- Instagram アプリ内ブラウザ
- 実機スマートフォン
- 食品表示の最終確認

## Verdict

$reason
MD
}
run_step() {
  local name="$1"; shift
  echo "==> $name" | tee -a "$LOG"
  "$@" >> "$LOG" 2>&1
  local code=$?
  echo "<== $name exit $code" | tee -a "$LOG"
  return $code
}
write_status "FAIL" "Verification is running; stale PASS invalidated." 1
failed=""
steps=("npm install" "npm run lint" "npm run format" "npm run build" "npm run test" "node scripts/verify-content.mjs" "node scripts/verify-release.mjs")
for step in "${steps[@]}"; do
  if ! run_step "$step" bash -lc "$step"; then failed="$step"; break; fi
done
if [ -n "$failed" ]; then
  reason="make verify failed at $failed. Read .codex/verify-output/latest.log."
  write_status "FAIL" "$reason" 1
  write_report "FAIL" "$reason" "$failed"
  printf '\n- %s FAIL: `%s` failed. See `.codex/verify-output/latest.log`.\n' "$(iso)" "$failed" >> LOOP_LOG.md
  exit 1
fi
reason="make verify passed and no P1 issues remain in the bootstrap scaffold."
write_status "PASS" "$reason" 0
write_report "PASS" "$reason" ""
printf '\n- %s PASS: `make verify` passed and `VERIFY_STATUS.json` says PASS.\n' "$(iso)" >> LOOP_LOG.md
exit 0
