#!/bin/zsh
# BISHIN LP を GitHub に公開する（ターミナルで実行してください）
#   zsh /Users/kameda/Projects/BISHIN_LP/push-to-github.sh
set -e
cd /Users/kameda/Projects/BISHIN_LP

REPO="bishin-lp"
OWNER="kska0412-ux"

# 1) GitHub CLI の認証（現在キーチェーンのトークンが無効です）
if ! gh auth status >/dev/null 2>&1; then
  echo "▶ GitHub にログインします（ブラウザが開きます）"
  gh auth login -h github.com -p https -w
fi

# 2) リポジトリを初期化（作りかけの .git があれば作り直す）
rm -rf .git
git init -q
git add -A
git commit -q -m "美顔神経エステスクールBISHIN LP 初版

- 全8セクションの1枚もの集客LP（自己完結HTML・外部リソースなし）
- 象牙×墨×シャンパンゴールドの配色、ロゴは提供画像から背景透過で抽出
- FVは左テキスト／右写真の2分割、文字→CTA→画像の順に立ち上げ
- 実績は提供カード画像を1枚ずつ点灯表示
- 日本語の禁則処理（kinsoku.js）で単語途中の改行・行頭の助詞を抑止"
git branch -M main

# 3) リポジトリ作成＋push（公開したくない場合は --public を --private に）
gh repo create "$REPO" --public --source=. --remote=origin --push

# 4) GitHub Pages を有効化（main / ルート）
gh api -X POST "repos/$OWNER/$REPO/pages" \
  -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1 || \
  echo "（Pagesは既に有効か、リポジトリ設定画面から Pages → main / root を選んでください）"

echo ""
echo "✅ 公開URL（反映まで1〜2分かかります）"
echo "   https://$OWNER.github.io/$REPO/"
echo "   リポジトリ: https://github.com/$OWNER/$REPO"
