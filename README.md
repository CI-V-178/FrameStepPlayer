# FrameStep Player

Google ドライブや端末の60fps動画を1フレームずつ確認し、タイムスタンプ付きメモを残せる無料のWebアプリです。

## 公開 URL

[https://frame-step-player.win](https://frame-step-player.win)

## 主な機能

- ±1fの移動、長押しによる連続移動、PCのキー操作
- 50文字以内のタイムスタンプ付きメモ
- Google ドライブへのVTT自動保存、端末ブラウザへの保存、VTT入出力

## 対応している動画

60fpsのmp4 / movのみ。平均59.0〜60.5fpsを受け入れます。

## 使い方

1. 「Google でログイン」してから「Google ドライブから開く」、または「端末から開く」で動画を選び、情報を確認して「この動画を開く」を押します。
2. 「−1f」「+1f」をタップしてフレーム移動。0.4秒以上の長押しで連続移動し、離すと止まります。
3. 停止位置でメモを入力し「追加」またはEnter。一覧を選ぶとその位置へ戻り、×で削除できます。

詳しくは[使い方](https://frame-step-player.win/help)をご覧ください。

## プライバシー

要求するGoogleの権限は `https://www.googleapis.com/auth/drive.file`（このアプリで使用する特定のファイルのみ）だけです。<br>
動画・メモ・アクセストークンは運営者のサーバーへ送信しません。<br>
Google ドライブにはブラウザからGoogleへ直接アクセスし、メモは自分のGoogle ドライブまたは端末のブラウザに保存します。<br>
Google Fontsへの通信とVercelのアクセスログについては[プライバシーポリシー](https://frame-step-player.win/privacy)をご覧ください。

## 開発方法

Node.js 22.12以上（.nvmrcの22系を推奨）とnpmを使用します。

~~~sh
npm install
cp .env.example .env
npm run dev
~~~

.env.exampleのGoogle設定3つを.envへ設定してください。未設定でも端末から開けます。.envはコミットしません。

~~~sh
npm run build
npm test
npx playwright install --with-deps chromium webkit
npm run test:e2e
npm run licenses
~~~

テスト動画の再生成は bash Example/MOCK/generate.sh。E2EのGoogle ドライブ通信はモックで検証し、専用サーバーはIPv6ループバックの5174番を使用します。

公開ページとLICENSE・このREADMEはsrc/shared/siteInfo.tsとscripts/site-content.mjsをもとに、npm run pages（buildとdevの前にも実行）で生成します。生成済みHTMLもコミットし、JavaScriptなしで読めます。第三者通知はnpm run licensesで生成します。

Search ConsoleのHTMLタグ方式ではVITE_GOOGLE_SITE_VERIFICATIONを設定して再ビルドします。空ならタグを除去します。public/にGoogle指定のgoogle*.htmlを置くHTMLファイル方式も使用できます（確認ファイル自体は同梱していません）。

Vercelのビルドはnpm run build、出力先はdistです。cleanUrlsで/help・/privacy・/terms・/licensesを配信します。VercelやGCPの設定は手動で行ってください。

ファイル選択のOS側制約などは[ファイル選択](docs/file-selection.md)、公開設定の手順と検証結果は[公開準備レポート](docs/publish-report.md)を参照してください。

## ライセンス

MIT。本体の[LICENSE](LICENSE)と、依存パッケージ・フォントの[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)をご確認ください。

## 連絡先

- [GitHub Issues](https://github.com/CI-V-178/FrameStepPlayer/issues)
- [X: @carrot_inaba](https://x.com/carrot_inaba)
- [メール: carrotinaba@gmail.com](mailto:carrotinaba@gmail.com)

運営者：CI-V-178（個人開発）

---

Google、Google ドライブ は Google LLC の商標です。FrameStep Player は Google が提供・承認しているものではありません。

Google and Google Drive are trademarks of Google LLC. FrameStep Player is not affiliated with or endorsed by Google.
