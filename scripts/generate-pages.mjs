import { writeFile } from "node:fs/promises";
import {
  siteInfo as s,
  siteLinks,
  socialLinks,
} from "../src/shared/siteInfo.ts";
import { pages, mitLicense, contact, contactEn } from "./site-content.mjs";
const root = new URL("../", import.meta.url);
const escape = (text) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const footer =
  '<footer class="site-footer"><nav aria-label="公開情報">' +
  siteLinks
    .map(
      (link, i) =>
        "<span>" +
        (i ? '<span class="link-separator" aria-hidden="true">・</span>' : "") +
        '<a href="' +
        link.href +
        '">' +
        link.label +
        "</a></span>",
    )
    .join("") +
  '</nav><div class="social-links">' +
  socialLinks
    .map(
      (link) =>
        '<a href="' +
        link.href +
        '" aria-label="' +
        link.label +
        '" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="' +
        link.path +
        '"/></svg></a>',
    )
    .join("") +
  "</div><p>" +
  s.operator +
  "</p></footer>";
const head = (title, description, path) =>
  '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="theme-color" content="#101215"><title>' +
  title +
  '</title><meta name="description" content="' +
  escape(description) +
  '"><link rel="canonical" href="' +
  s.siteUrl +
  path +
  '"><link rel="stylesheet" href="/site.css">';
for (const [path, page] of Object.entries(pages)) {
  const license =
    path === "licenses"
      ? '<pre lang="en">' + escape(mitLicense) + "</pre>"
      : "";
  const html =
    '<!doctype html>\n<html lang="ja"><head>' +
    head(page.title + " | " + s.appName, page.description, "/" + path) +
    '</head><body><main class="document"><a class="back-link" href="/">← ' +
    s.appName +
    " に戻る</a><h1>" +
    page.title +
    '</h1><p class="date">制定日・最終改定日：' +
    s.establishedDate +
    "</p><article>" +
    page.ja +
    license +
    '<section lang="en">' +
    page.en +
    (path === "licenses" ? "<pre>" + escape(mitLicense) + "</pre>" : "") +
    "</section></article></main>" +
    footer +
    "</body></html>\n";
  await writeFile(new URL(path + ".html", root), html);
}
await writeFile(
  new URL("index.html", root),
  '<!doctype html>\n<html lang="ja"><head>' +
    head(s.appName, s.description, "") +
    '<link rel="manifest" href="/manifest.webmanifest"><meta name="google-site-verification" content="%VITE_GOOGLE_SITE_VERIFICATION%"></head><body><div id="root"><main class="document static-home"><h1>' +
    s.appName +
    '</h1><p class="description">' +
    s.description +
    "</p><p>端末の動画にも対応し、停止位置に50文字以内のメモを残せます。60fpsのmp4 / movに対応しています。</p><p>運営者・連絡先</p>" +
    contact +
    '<p><a href="/privacy">プライバシーポリシー</a>をご確認ください。動画の再生にはJavaScriptを有効にしてください。</p><section lang="en"><h2>English</h2><p>Review 60fps MP4 / MOV videos from Google Drive or your device one frame at a time and add timestamped notes of up to 50 Unicode code points.</p>' +
    contactEn +
    '<p>Read our <a href="/privacy">Privacy Policy</a>. Enable JavaScript to use the player.</p></section></main>' +
    footer +
    '</div><script type="module" src="/src/main.tsx"></script></body></html>\n',
);
await writeFile(new URL("LICENSE", root), mitLicense);
await writeFile(
  new URL("SECURITY.md", root),
  "# セキュリティの連絡先\n\n脆弱性の報告は " +
    s.email +
    " へお送りください。公開の Issue に書かないでください。\n\nPlease report vulnerabilities privately to " +
    s.email +
    ". Do not disclose them in public issues.\n",
);
const readme = [
  "# " + s.appName,
  "",
  "Google Driveや端末の60fps動画を1フレームずつ確認し、タイムスタンプ付きメモを残せる無料のWebアプリです。",
  "",
  "## 公開 URL",
  "",
  "[" + s.siteUrl + "](" + s.siteUrl + ")",
  "",
  "## 主な機能",
  "",
  "- ±1fの移動、長押しによる連続移動、PCのキー操作",
  "- 50文字以内のタイムスタンプ付きメモ",
  "- Google DriveへのVTT自動保存、端末ブラウザへの保存、VTT入出力",
  "",
  "## 対応している動画",
  "",
  "60fpsのmp4 / movのみ。平均59.0〜60.5fpsを受け入れます。",
  "",
  "## 使い方",
  "",
  "1. 「Google でログインして Drive から開く」または「端末から開く」で動画を選び、情報を確認して「この動画を開く」を押します。",
  "2. 「−1f」「+1f」をタップしてフレーム移動。0.4秒以上の長押しで連続移動し、離すと止まります。",
  "3. 停止位置でメモを入力し「追加」またはEnter。一覧を選ぶとその位置へ戻り、×で削除できます。",
  "",
  "詳しくは[使い方](" + s.siteUrl + "/help)をご覧ください。",
  "",
  "## プライバシー",
  "",
  "動画・メモ・アクセストークンは運営者のサーバーへ送信しません。<br>",
  "DriveはブラウザからGoogleへ直接アクセスし、メモは自分のDriveまたは端末のブラウザに保存します。<br>",
  "Google Fontsへの通信とVercelのアクセスログについては[プライバシーポリシー](" +
    s.siteUrl +
    "/privacy)をご覧ください。",
  "",
  "## 開発方法",
  "",
  "Node.js 22.12以上（.nvmrcの22系を推奨）とnpmを使用します。",
  "",
  "~~~sh",
  "npm install",
  "cp .env.example .env",
  "npm run dev",
  "~~~",
  "",
  ".env.exampleのGoogle設定3つを.envへ設定してください。未設定でも端末から開けます。.envはコミットしません。",
  "",
  "~~~sh",
  "npm run build",
  "npm test",
  "npx playwright install --with-deps chromium webkit",
  "npm run test:e2e",
  "npm run licenses",
  "~~~",
  "",
  "テスト動画の再生成は bash Example/MOCK/generate.sh。E2EのDrive通信はモックで検証し、専用サーバーはIPv6ループバックの5174番を使用します。",
  "",
  "公開ページとLICENSE・このREADMEはsrc/shared/siteInfo.tsとscripts/site-content.mjsをもとに、npm run pages（buildとdevの前にも実行）で生成します。生成済みHTMLもコミットし、JavaScriptなしで読めます。第三者通知はnpm run licensesで生成します。",
  "",
  "Search ConsoleのHTMLタグ方式ではVITE_GOOGLE_SITE_VERIFICATIONを設定して再ビルドします。空ならタグを除去します。public/にGoogle指定のgoogle*.htmlを置くHTMLファイル方式も使用できます（確認ファイル自体は同梱していません）。",
  "",
  "Vercelのビルドはnpm run build、出力先はdistです。cleanUrlsで/help・/privacy・/terms・/licensesを配信します。VercelやGCPの設定は手動で行ってください。",
  "",
  "ファイル選択のOS側制約などは[ファイル選択](docs/file-selection.md)、公開設定の手順と検証結果は[公開準備レポート](docs/publish-report.md)を参照してください。",
  "",
  "## ライセンス",
  "",
  s.license +
    "。本体の[LICENSE](LICENSE)と、依存パッケージ・フォントの[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)をご確認ください。",
  "",
  "## 連絡先",
  "",
  "- [GitHub Issues](" + s.githubUrl + "/issues)",
  "- [X: " + s.xLabel + "](" + s.xUrl + ")",
  "- [メール: " + s.email + "](mailto:" + s.email + ")",
  "",
  "運営者：" + s.operator,
  "",
].join("\n");
await writeFile(new URL("README.md", root), readme);
console.log("Generated static pages, LICENSE, SECURITY.md and README.md");
