# BISHIN LP（美顔神経エステスクール）

代表：松田 葉子。集客LP（`index.html`）と、LINE友だち追加者向けショートLP（`soudan.html` / `soudan/index.html`）。

## 配信

**Cloudflare Pages**（リポジトリのルートをそのまま配信）。`main` に push すると自動デプロイされる。

| パス | 内容 |
|---|---|
| `/` | 本LP（`index.html`） |
| `/soudan.html` | ショートLP |
| `/soudan/` | ショートLP（旧Netlifyと同じパス。中身は `soudan.html` と同一） |
| `/special-talk.mp4` | 対談動画（9.4MB）。本LPから参照 |

`soudan.html` と `soudan/index.html` は**同一内容**。旧URLをどちらの形でも生かすために両方置いている。
**片方を直したらもう片方も必ず同期すること。**

---

## ⚠️ `index.html` はビルド成果物ではない（2026-09-30 追記）

`build.js` / `kinsoku.js` / `index.pre-kinsoku.html` は、**受講料50万円・卒業後サポート9ヶ月時代の
古いパイプライン**。現在の `index.html` はこれらの出力ではなく、
**Netlify本番で稼働していた版**（`~/Projects/BISHIN_LP/netlify-deploy/index.html`）を持ち込んだもの。

現行 `index.html` にあって旧パイプラインの出力に無いもの：

- 受講料 **11万円**（旧：50万円）
- 卒業後サポート **3ヶ月／役務提供期間 合計6ヶ月**（旧：9ヶ月／12ヶ月）
- **Metaピクセル**（ID `2170507383557687`。旧版には `fbq` が1つも無い）
- 差し替え済みの写真
- 対談動画 `special-talk.mp4` の埋め込み

**`node build.js` を実行してはいけない。** 実行すると `index.html` が50万円・ピクセル無しの
古い内容に戻り、本番が壊れる。

本文を編集する場合は、当面 `index.html` を直接編集する。
パイプラインを復活させるなら、先に `index.pre-kinsoku.html` を現行 `index.html` の内容に
合わせて作り直すこと。

旧リポジトリ版のバックアップ：`~/Projects/BISHIN_LP/index.html.repo-bak-20260930`
（git履歴では コミット `e217baa` 時点の `index.html`）

---

## 更新手順

1. `index.html` を編集（または `soudan.html` と `soudan/index.html` を両方編集）
2. `git add` → `git commit` → `git push origin main`
3. Cloudflare Pages が自動でデプロイ

## 差し替えが必要な箇所

HTML内に `【差し替え】` コメントあり。受講生の声、実績数値など。
