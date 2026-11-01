# FrameStep Player

Google Drive / 端末の60fps動画を1フレームずつ確認し、停止位置にメモを残す静的PWAです。React 18、TypeScript、Viteを使い、独自のサーバーやDBは必要ありません。

## 起動

Node.js 22.12以上（推奨: `.nvmrc` の22系）、npm、テスト動画の再生成にはffmpegが必要です。

```sh
npm ci
cp .env.example .env
npm run dev
```

Google設定が空でも「端末から開く」が使えます。`.env` はGitの追跡対象外です。

## Google / Vercel 設定

1. Google CloudでDrive APIとGoogle Picker APIを有効にします。
2. Webアプリ用OAuthクライアントを作成し、承認済みのJavaScript生成元に `http://localhost:5173` と公開URLを追加します。
3. OAuth同意画面のテストユーザーに利用アカウントを追加し、スコープは `https://www.googleapis.com/auth/drive.file` のみを使用します。
4. APIキーは利用する生成元とAPIに制限します。
5. `.env.example` の3変数をローカルの `.env` またはVercel環境変数へ設定します。`VITE_GOOGLE_APP_ID` はプロジェクト番号（数字）です。
6. Vercelへリポジトリの `mvp` ブランチを取り込み、Viteプリセット、ビルド `npm run build`、出力先 `dist` を指定します。環境変数を変更したら再デプロイします。

## 操作とメモ

- `,` / `.` で1フレーム戻る / 進む。Spaceで再生 / 一時停止、Mでメモ入力へ。
- ±1fの長押しは400ms後に連続移動します。入力欄にフォーカスがある間はキー操作を停止します。
- メモは50コードポイントまで。時刻をタップするとその位置に戻り、削除は即時に反映します。
- ローカル動画のメモはファイル名とサイズをキーにlocalStorageへ保存します。VTTの書き出し・読み込みも可能です。
- Drive動画のメモは動画と同じフォルダの `*.memo.vtt` へ自動保存します。作成権限がない場合はマイドライブの「FrameStep メモ」へ保存します。
- Driveストリーミングに失敗した場合、動画を全件取得するBlob再生へ自動的に切り替えます。

## 検証

```sh
npm run build
npm test
npx playwright install --with-deps chromium webkit
npm run test:e2e
```

テスト動画は `bash Example/MOCK/generate.sh` で再生成できます。E2EはGoogle APIを模擬し、認証情報は不要です。テスト時のみ `VITE_E2E=1` でフックを公開し、本番ビルドでは公開しません。環境の未使用IPv4ポートがタイムアウトするため、E2EサーバーはIPv6ループバックの5174番を使用します。

Service WorkerのRange・206・トークン更新・キャッシュ対象は単体テストで検証します。ブラウザE2EのDrive再生はSWを無効化したBlob代替経路で検証します。

完成報告と実機の確認項目は [docs/completion-report.md](docs/completion-report.md)、画面は `docs/screenshots/` に保存しています。


## サムネイルなしの選択

Driveは一覧表示で開き、Drive・端末の選択後にはファイル名・長さ・作成日時だけの確認画面を表示します。動画を開くまではサムネイル生成やプレビュー再生を行いません。

端末のOS標準ファイル選択画面の表示項目はアプリから指定できません。また、端末ファイルの作成日時はブラウザから取得できないため「取得不可」と表示します。詳しくは [ファイル選択](docs/file-selection.md) を参照してください。
