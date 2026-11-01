# 公開準備 完成報告

## 結果: 完了

`publish-docs` ブランチに実装・検証結果をコミットし、pushしました。PR・デプロイ・外部サービスの設定変更は行っていません。

## 追加・変更したファイル

- 公開ページ：`help.html`、`privacy.html`、`terms.html`、`licenses.html`、静的本文入りの `index.html`、共通の `public/site.css`。
- 公開情報・導線：`src/shared/siteInfo.ts`、`src/shared/SiteFooter.tsx`、`src/app/App.tsx`、`src/app/style.css`。
- 文書・通知：`LICENSE`、`THIRD_PARTY_NOTICES.md`、`public/licenses.txt`、`README.md`、`SECURITY.md`。
- 生成処理：`scripts/generate-pages.mjs`、`scripts/site-content.mjs`、`scripts/generate-licenses.mjs`、フォントの公式OFL原文2件。
- 設定・検証：`vite.config.ts`、`vercel.json`、`.env.example`、`package.json`・ロックファイル、`tests/e2e/publish.spec.ts`、`docs/screenshots/`。

## テスト結果: 既存 単体26/26・E2E28/28、追加 P1〜P9 9/9

- Chromium・WebKitで既存E2E各14件、追加P1〜P9各9件、合計46/46合格。
- JavaScript無効時のトップ・静的4ページ、本文・英語・連絡先、フッター、再生画面の導線、licenses.txt、所有確認タグの空／設定あり、固定情報の一致、390px幅を検証。
- 本番マルチページビルド成功。生成処理の再実行で差分なし。npm auditの指摘0件。
- VercelのcleanUrls・書き換え除外は設定とローカル配信で検証。公開環境での動作はデプロイ後に確認してください。

## プライバシーポリシー・使い方で実装に合わせて直した点

- トークンはページだけでなくService Workerのメモリにも保持するため、永続保存しないことと、それぞれのメモリが失われる時点を区別。
- 「外部へ一切送信しない」とはせず、動画・メモ・トークンを運営者のサーバーへ送らないこと、Googleへの直接通信、再生用Blob、localStorage、/assets/のみのキャッシュを説明。
- Google Fontsへの通信、Vercelのログ、外部Google画面のCookieの扱いを明記。広告・アクセス解析・追跡Cookieはアプリに追加していません。
- 動画選択後の「この動画を開く」、端末ファイルの作成日時「取得不可」、実際の再試行表示を反映。
- 端末の選択画面からDriveを選んだ場合も、メモは端末側に保存されることを説明。

## 第三者ライセンスの要確認（コピーレフトなど）

本番依存6パッケージはMITまたはBSD-3-Clauseで、GPL・AGPL等は見つかりませんでした。Noto Sans JPとJetBrains MonoはOFL-1.1です。フォントを改変・再配布する場合は、予約フォント名などOFLの条件を確認してください。著作権表示と全文は自動生成した通知に収録しています。

## この指示書から外れた判断と理由

- Node 22と互換性のあるlicense-checker-rseidelsohn 4.4.2を使用。最新5系はNode 24以上を要求するためです。生成ツールの推移依存glob・minimatchは修正版へoverrideし、生成動作を確認しました。
- 利用規約に、適用法令により制限できない責任・手続きを除く旨を補足しました。一般公開文書として法令との関係を明確にするためです。
- 制定日・改定日は2026年11月2日。元から未追跡のJO.md・JO2.mdは変更・コミットしていません。

## ユーザーが行うこと

1. Vercelで`publish-docs`の変更を公開対象へ取り込み、デプロイしてください。[トップ](https://frame-step-player.vercel.app)、[使い方](https://frame-step-player.vercel.app/help)、[プライバシー](https://frame-step-player.vercel.app/privacy)、[規約](https://frame-step-player.vercel.app/terms)、[ライセンス](https://frame-step-player.vercel.app/licenses)と`/licenses.txt`が開けることを確認してください。
2. Google Search Consoleで公開URLの所有を確認してください。HTMLタグ方式なら、Vercelの環境変数`VITE_GOOGLE_SITE_VERIFICATION`に値を設定して再デプロイします。`public/google*.html`による確認にも対応できます。
3. [Google Auth Platformのブランド確認](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification)を進め、「ブランディング」に以下を入力してください。
   - アプリ名：FrameStep Player
   - サポート・デベロッパー連絡先：carrotinaba@gmail.com
   - トップページ：https://frame-step-player.vercel.app
   - プライバシー：https://frame-step-player.vercel.app/privacy
   - 利用規約：https://frame-step-player.vercel.app/terms
   - 承認済みドメイン：frame-step-player.vercel.app
   - ロゴを登録する場合：既存のアプリアイコンを120×120pxのPNGに変換して使用。ロゴ登録により確認に時間がかかる場合があります。
4. 「データアクセス」で`https://www.googleapis.com/auth/drive.file`のみが登録されていることを確認してください。
5. 「ブランディングを確認」→「ブランディングを公開」→「対象」で「アプリを公開」を進めてください。確認・承認はGoogle側で行われます。
6. GitHubリポジトリのAboutに公開URLを設定し、Issuesを有効にしてください。
