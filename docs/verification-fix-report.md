# OAuth 審査指摘 修正報告

## 結果: 完了

作業ブランチ `fix/oauth-verification`（ベース `b3cfa4a`）。作業日 2026-11-09。

## 指摘ごとの対応

- **ホームページの要件**: `index.html`（JavaScript なしで読める静的ページ）を書き直し、日本語の下に英語版を置いた。構成は「アプリ名とひとこと」「できること」「Google ユーザーデータの利用について」（`drive.file` だけを要求すること、使う目的 2 点、アクセスしないもの、運営者のサーバーに送らないこと、`/privacy` へのリンク）「使い方 3 ステップと `/help`」「運営者と連絡先」「フッター」。React 起動後の最初の画面にも、できること・Google ユーザーデータの要点・プライバシーポリシーと使い方へのリンクを出すようにした。文言は `src/shared/homeContent.ts` にまとめ、静的ページと画面の両方がここから表示する。
- **プライバシーポリシーの要件**: `/privacy` に次を追加・明確化した（日本語・英語）。Google ユーザーデータの種類の表（5 行）と取得しないもの、保存場所と保存期間、データの保護、第三者への販売・提供・移転をしないこと（広告・信用力の判定・AI の学習に使わないことを含む）、Limited Use の一文を「取得・利用する情報」の直後に枠で表示（既存の第 9 節もそのまま残した）、削除の依頼。改定日は 2026年11月9日に更新した。アプリ内では「Google でログイン」ボタンのすぐ上に、閉じられないプライバシー通知（14px、少し明るい背景の枠、ポリシーへのリンク付き）を常に表示する。再生中の「…」メニューは、先頭が「プライバシーポリシー」になるよう並べ替えた。
- **ブランドの取り扱いガイドライン**: ログインボタンを公式どおりの「Google でログイン」ボタンに置き換えた。Google 配布の 4 色 G ロゴ SVG を使い、Dark テーマ（#131314 / #8E918F / #E3E3E3）、Roboto Medium 14px、高さ 40px、余白は左 12px・ロゴと文字の間 10px・右 12px、角丸 20px とした。未ログインのときはこのボタンだけを出し、ログイン後に「Google ドライブから開く」ボタン（汎用のフォルダ線画アイコン）を出す。画面・静的ページ・README・エラー文言では「Drive」の単独表記をやめて「Google ドライブ」/「Google Drive」に統一した。全静的ページのフッター、React の最初の画面のフッター、README の末尾に商標の表記（日本語・英語）を入れた。公開 URL は、canonical・README・本文のすべてで `https://frame-step-player.win` に移した。

## 変更したファイル

- 生成元: `src/shared/siteInfo.ts`、`src/shared/homeContent.ts`（新規）、`src/shared/SiteFooter.tsx`、`scripts/generate-pages.mjs`、`scripts/site-content.mjs`、`scripts/generate-licenses.mjs`、`scripts/licenses/Roboto-OFL.txt`（新規）、`public/site.css`
- 生成物: `index.html`、`help.html`、`privacy.html`、`terms.html`、`licenses.html`、`README.md`、`THIRD_PARTY_NOTICES.md`、`public/licenses.txt`
- 画面: `src/app/App.tsx`、`src/app/GoogleSignInButton.tsx`（新規）、`src/app/style.css`、`src/features/drive/api.ts`（エラー文言のみ）
- テスト: `tests/e2e/verification.spec.ts`（新規）、`tests/e2e/player.spec.ts`（期待する文言を「Google ドライブに保存済み」に変更し、E10 に表記チェックを追加）
- スクリーンショット: `docs/screenshots/verification/`（新規）、`docs/screenshots/*.png`（既存テストが撮り直したもの）

再生、フレーム移動、メモ、Google ドライブ連携のロジックは変えていない。ログインは既存の `accessToken()` を呼ぶだけで、ログイン状態は既存の `onToken()` から受け取っている。

## テスト結果: 既存 単体 26/26・E2E 52/52、追加 V1〜V7 7/7

| コマンド | 対象 commit | exit | 結果 |
|---|---|---|---|
| `npm test`（vitest） | d476ade | 0 | PASS 26/26 |
| `npx playwright test`（chromium + webkit） | d476ade | 0 | PASS 64/64（既存 26 件 × 2 ブラウザ = 52、追加 12 件） |
| `npm run build`（tsc -b + pages + licenses + vite build） | d476ade | 0 | PASS |

追加テスト（chromium・webkit とも PASS）

| # | 結果 | 確認した内容 |
|---|---|---|
| V1 | PASS | JS なしの `/` に見出し「Google ユーザーデータの利用について」、`drive.file` の説明、その節の中に `/privacy` へのリンクがある |
| V2 | PASS | JS なしの `/privacy` にデータの種類の表（5 行）、保存期間、保護、Limited Use の一文（表より前）、改定日、削除の依頼がある |
| V3 | PASS | ボタンは SVG 1 つ（4 色の path）と文言「Google でログイン」だけで、色・高さ・角丸・字の大きさ・太さもガイドラインどおり。直前の要素はプライバシー通知で、ポリシーへのリンクがある。ログイン後は「Google ドライブから開く」に切り替わる |
| V4 | PASS | 全静的ページ、最初の画面（ログイン前・ログイン後）、README、画面のソースの文字列に単独の「Drive」が無い（E10 で再生中の画面も確認） |
| V5 | PASS | 全静的ページ、React の最初の画面のフッター、README の末尾に商標の表記がある |
| V6 | PASS | `docs/screenshots/verification/{chromium,webkit}-{390x844,1280x800}.png` を保存した。どちらの幅でも横スクロールは出ない |
| V7 | PASS | 全静的ページの HTML と README に `frame-step-player.vercel.app` が無く、canonical は `https://frame-step-player.win` |

## スクリーンショット

- `docs/screenshots/verification/chromium-390x844.png`
- `docs/screenshots/verification/chromium-1280x800.png`
- `docs/screenshots/verification/webkit-390x844.png`
- `docs/screenshots/verification/webkit-1280x800.png`

E2E 環境では Google の設定（`.env`）が無いため、画像のログインボタンは無効化された薄い表示になっている。本番（設定済み）では通常の濃さで表示される。

## この指示書から外れた判断と理由

1. **トップのプライバシーポリシーへのリンク**: §3 は `https://frame-step-player.vercel.app/privacy` を求めているが、§1.5 と V7 はその URL を残さないことを求めている。§3 が相対リンクを認めているので、相対リンク `/privacy` にした。新しいドメインでは `https://frame-step-player.win/privacy` に遷移する。OAuth 同意画面の登録 URL も同じものに変える必要がある（下の「ユーザーが行うこと」）。
2. **メタデータの行**: 指示書の項目に「作成日時、動画の長さ」を足した。コードが実際に取得しているフィールド（`createdTime`、`videoMediaMetadata.durationMillis`）を正確に開示するため。
3. **アクセストークンの保存場所**: 「ブラウザのメモリのみ」に、実装どおり「ページと Service Worker」と添えた。Service Worker 側はタブを閉じたあと Worker が終わるまで残ることも書いた。
4. **Roboto の読み込み**: ガイドラインが求める Roboto Medium を出すため、既存の Google Fonts の読み込みに Roboto 500 を加えた。あわせてプライバシーポリシーの外部サービス欄とライセンス一覧（OFL-1.1）にも Roboto を加えた。`Roboto-OFL.txt` の著作権の行（`Copyright 2011 The Roboto Project Authors`）は手で書いたもので、Google Fonts が配布する原文とはまだ照合していない。
5. **再生中のヘッダー**: 端末の動画を開いていて、まだログインしていないときは、ヘッダーに公式ボタンを出す（スマホ幅ではガイドラインが認めるロゴだけの丸いボタン）。ログイン後は「Google ドライブから開く」になる。
6. **エラー文言**: V4 で `Drive API: 404` というエラー文言が見つかったので、`Google ドライブ API: 404` に変えた（`api.ts` の文字列だけで、処理は同じ）。
7. **英語版の使い方**: 「My Drive」という表記をやめ、「at the top level of your Google Drive」にした。
8. **アプリ内の通知**: アプリの画面は日本語だけなので、通知も日本語だけにした（指示書が認める既定値）。
9. **`docs/publish-report.md`**: 以前の作業記録で、公開されるページではないため、`vercel.app` の URL を書き換えずに残した。

## ユーザーが行うこと

1. Vercel にデプロイし、/ と /privacy の内容を確認
   - 事前に Vercel の Domains に `frame-step-player.win` を追加し、`frame-step-player.vercel.app` から 308 でリダイレクトする設定をしてください（指示書どおり、`vercel.json` には入れていません）。
   - Google Cloud Console の OAuth 同意画面で、ホームページ・プライバシーポリシー・利用規約の URL を `https://frame-step-player.win`（`/privacy`、`/terms`）に、承認済みドメインを `frame-step-player.win` に変えてください。OAuth クライアントの「承認済みの JavaScript 生成元」にも `https://frame-step-player.win` を足してください。
   - 新しいドメインの所有確認を Search Console で行ってください（`VITE_GOOGLE_SITE_VERIFICATION` か `public/google*.html` を使います）。
2. Google からのメール（Trust and Safety チーム）に返信して再審査を依頼
