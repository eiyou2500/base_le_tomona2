# Le Tomona BASE custom theme

Le Tomona BASE custom theme のブートストラップ用リポジトリです。目的は、空のリポジトリに検証ループを作り、`make verify` と `VERIFY_STATUS.json` の結果なしに完了を主張できない状態を作ることです。

この段階は最終本番コピーではなく、配送商品と店頭受け取り予約商品を区別する最小構成です。

## 検証

```bash
make verify
```

`make verify` は lint、format、build、test、Japanese UI audit、product-mode audit、food-label audit、Playwright visual and functional checks、content verification、release verification を実行します。Playwright は主要幅のスクリーンショットと簡易 performance notes を `.codex/verify-output/` に出力します。

## ビルド

```bash
npm run build
```

`src/templates/base-theme.html` から `dist/index.html` を生成し、CSS と JavaScript を `dist/assets/` にコピーします。

## PASS / FAIL / BLOCKED

- PASS: `make verify` が成功し、`VERIFY_STATUS.json` が PASS です。
- FAIL: 自動検証で修正可能な問題があります。
- BLOCKED: 環境制約または最大ループ到達により手動介入が必要です。

## フックと外側のガードレール

Codex の Stop hook は `.codex/hooks.json` にあります。初回はリポジトリ内フックを信頼する前に、必ず手動で `make verify` を実行します。フックは今後 `/hooks` でレビューおよび信頼される必要があります。

GitHub Actions は外側のガードレールとして pull request と main への push で `make verify` を実行します。
