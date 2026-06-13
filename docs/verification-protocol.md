# Verification protocol

## Codex worker role

Codex worker は最小の安全な変更を行い、`make verify` を実行し、結果を `LOOP_LOG.md` に記録します。worker の自己申告は信頼しません。

## Codex verifier role

Codex verifier は repository files、git diff、make verify output、test logs、build outputs、screenshots or artifacts、release checklist のみを検証材料にします。

## Trusted artifacts

- repository files
- command logs
- build outputs
- `VERIFY_REPORT.md`
- `VERIFY_STATUS.json`

## Not trusted

- Codex worker narrative
- 実行ログを伴わない完了報告
- BASE 上で未確認の推測

## Stop hook behavior

Stop hook は `make verify` を実行し、`VERIFY_STATUS.json` が PASS であることを確認します。失敗時は `decision: "block"` を返し、最大ループ到達時は BLOCKED として停止します。

## `make verify`

`make verify` は npm install、lint、format、build、test、content verification、release verification を順番に実行します。

## GitHub Actions

GitHub Actions は pull request と main への push で `make verify` を実行する外側の検証です。

## Manual checks

BASE HTML編集 App、BASE テイクアウト App、BASE live checkout、Instagram アプリ内ブラウザ、実機スマートフォン、食品表示の最終確認は手動確認が必要です。

## Maximum loop guard

Stop hook は `CODEX_VERIFY_MAX_LOOPS` を読み、未設定時は 6 回を最大連続失敗数にします。

## PASS / FAIL / BLOCKED

PASS は検証通過、FAIL は修正可能な検証失敗、BLOCKED は環境制約または最大ループ到達による手動介入待ちです。

## Why Codex self-reporting is not trusted

完了判断は narrative ではなく、リポジトリ成果物、コマンドログ、verifier の PASS / FAIL に限定します。
