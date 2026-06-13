# AGENTS.md

## Project
Le Tomona BASE custom theme.

This repository builds and validates a BASE custom theme for Le Tomona, a small pie and flan shop in Maibara, Shiga.

Official store address:
滋賀県米原市顔戸439

## Core rule
Do not report completion unless `make verify` passes and `VERIFY_STATUS.json` says PASS.

If verification fails, continue the worker loop:
1. Read the verification output.
2. Identify the smallest failing cause.
3. Apply the smallest safe fix.
4. Update `LOOP_LOG.md`.
5. Run `make verify` again.
6. Repeat until PASS or BLOCKED.

## Language rules
- All public-facing site text must be Japanese.
- Do not display English UI labels unless BASE itself forces them.
- Internal variable names, class names, filenames, and comments may be English.
- Preserve the brand name “Le Tomona”.
- Preserve Japanese product names.
- Use `lang="ja"`.
- Use Japanese page titles, meta descriptions, button labels, alt text, and Open Graph Protocol text.
- Do not show TODO, lorem ipsum, placeholder copy, or unfinished 要確認 text on the public-facing production page.

## Product rules
Shipping products:
- パルミエ プレーン
- パルミエ ショコラ
- パルミエ ショコラホワイト

Pickup reservation products:
- フラン バニラ
- フラン ショコラ
- フラン セゾン
- アップルパイ
- パルミエ プレーン
- パルミエ ショコラ
- パルミエ ショコラホワイト

## Non-negotiable rules
- Do not use the customer-facing word “裏予約”.
- Always distinguish 配送商品 from 店頭受け取り予約商品.
- Do not imply フラン or アップルパイ can be shipped.
- Keep the address as 滋賀県米原市顔戸439.
- Do not invent ingredients, allergens, storage methods, deadlines, prices, shipping rules, or pickup rules.
- Do not remove food labeling fields.
- Do not use claims such as 無添加, 保存料不使用, 最高級, 完全再現, 健康に良い unless explicitly provided and legally confirmed.
- Do not weaken verification scripts, tests, hooks, Makefile targets, or GitHub Actions just to pass.

## Worker protocol
For every implementation loop:
1. State the next small fix in `LOOP_LOG.md`.
2. Make the smallest code change.
3. Run `make verify`.
4. Append command results to `LOOP_LOG.md`.
5. If PASS, update `NEXT_HYPOTHESES.md`.
6. If FAIL, do not report completion. Continue.

## Verifier protocol
The verifier must not trust the worker's narrative.

The verifier may inspect only:
- repository files
- git diff
- make verify output
- test logs
- build outputs
- screenshots or artifacts
- release checklist

The verifier must output:
- `VERIFY_REPORT.md`
- `VERIFY_STATUS.json`

`VERIFY_STATUS.json` must contain:
{
  "status": "PASS" | "FAIL" | "BLOCKED",
  "reason": "...",
  "verified_at": "...",
  "commands": []
}

## P1 failures
Treat the following as P1:
- Confusion between shipping and pickup.
- Missing allergen, storage, deadline, or food labeling fields.
- Broken mobile purchase flow.
- Public-facing English UI text.
- Customer-facing “裏予約”.
- Excessive animation that blocks purchase or reservation.
- Any vague legal, health, or food safety claim.
- Address other than 滋賀県米原市顔戸439.
- `make verify` failure.

## Required checks
- Run lint, format, build, and tests when available.
- Run content verification.
- Run release verification.
- Document any check that cannot be completed locally.
- Update `docs/release-checklist.md` with remaining BASE manual checks.

## Completion rule
Completion is allowed only when:
- `make verify` passes.
- `VERIFY_STATUS.json` says PASS.
- `LOOP_LOG.md` records the final passing run.
- `NEXT_HYPOTHESES.md` is updated.
- `docs/release-checklist.md` is updated.
- No P1 issues remain.
