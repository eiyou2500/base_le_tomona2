# Release checklist

## Automated checks

- make verify
- content verification
- build
- no forbidden public-facing copy
- Japanese UI check
- product-mode audit for 配送商品 and 店頭受け取り予約商品
- food labeling field check on every product card
- reduced-motion audit
- no horizontal overflow audit
- Playwright visual and functional checks at 320px, 375px, 390px, 414px, 430px, 768px, 1024px, 1280px, and 1440px
- screenshot artifact generation for major breakpoints
- local performance notes in `.codex/verify-output/performance-notes.json`
- address check
- product distinction check

## Manual BASE checks

- BASE HTML編集 App に貼り込めるか
- BASE プレビューでトップ、カテゴリ、商品詳細が崩れないか
- BASE テイクアウト App で受け取り日時選択が機能するか
- BASE live checkout
- BASE pickup reservation flow
- BASE category page behavior
- BASE-controlled labels that cannot be translated in theme
- Lighthouse measurement in the deployed BASE preview if available
- 食品表示の最終確認
- 特定商取引法に基づく表記の確認
- Instagram アプリ内ブラウザ
- iPhone Safari
- Android Chrome
- 実機スマートフォン
- 320px, 375px, 390px, 414px, 430px, 768px, 1024px, 1280px, 1440px responsive checks
