import { siteInfo as s } from "../src/shared/siteInfo.ts";
export const p = (text) => "<p>" + text + "</p>";
export const list = (...items) =>
  "<ul>" + items.map((item) => "<li>" + item + "</li>").join("") + "</ul>";
export const section = (title, body) =>
  "<section><h2>" + title + "</h2>" + body + "</section>";
export const external = (url, text) =>
  '<a href="' +
  url +
  '" target="_blank" rel="noopener noreferrer">' +
  text +
  "</a>";
export const contact =
  p(
    s.operator + " / " + '<a href="mailto:' + s.email + '">' + s.email + "</a>",
  ) +
  "<p>" +
  external(s.githubUrl + "/issues", "GitHub Issues") +
  " ・ " +
  external(s.xUrl, s.xLabel) +
  "</p>";
export const contactEn =
  p(
    "Operated by " +
      s.copyrightHolder +
      " (individual developer). Contact: " +
      '<a href="mailto:' +
      s.email +
      '">' +
      s.email +
      "</a>",
  ) +
  "<p>" +
  external(s.githubUrl + "/issues", "GitHub Issues") +
  " · " +
  external(s.xUrl, s.xLabel) +
  "</p>";
export const mitLicense =
  "Copyright (c) " +
  s.year +
  " " +
  s.copyrightHolder +
  `\n
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the \"Software\"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.\n`;
const policySentence =
  "FrameStep Player's use and transfer of information received from Google APIs to any other app will adhere to the " +
  external(
    "https://developers.google.com/terms/api-services-user-data-policy",
    "Google API Services User Data Policy",
  ) +
  ", including the Limited Use requirements.";

export const pages = {
  help: {
    title: "使い方",
    description:
      "FrameStep Playerの動画の開き方、1フレーム操作、メモ保存、ホーム画面への追加方法。",
    ja:
      section(
        "1. はじめに",
        p(
          "60fpsの動画を1フレームずつ確認し、位置にメモを残せるアプリです。対応動画は60fps（59.0〜60.5fpsとして判定）のmp4 / movのみです。",
        ),
      ) +
      section(
        "2. 動画を開く",
        list(
          "Google Driveから：「Google でログインして Drive から開く」→ Googleにログイン → 動画を選び、ファイル名・長さ・作成日時を確認して「この動画を開く」を押します。初回はGoogleの権限確認画面が出ます。",
          "端末から：「端末から開く」→ 動画を選び、確認画面で「この動画を開く」を押します。スマホでは端末のファイル選択画面からGoogle Driveの動画を選べる場合もあります。",
          "60fps以外の動画は開けません。確認画面にサムネイルは表示せず、端末ファイルの作成日時は取得できないため「取得不可」と表示します。",
        ),
      ) +
      section(
        "3. 1フレームずつ動かす",
        list(
          "「−1f」「+1f」をタップすると、自動で一時停止して1フレーム戻る／進みます。",
          "長押しすると0.4秒後から1フレームずつ連続で動き、離すと止まります。",
          "再生ボタンで再生／一時停止でき、シークバーで好きな位置へ移動できます。",
        ),
      ) +
      section(
        "4. PCのキー操作",
        list(
          "<code>,</code>で1f戻る、<code>.</code>で1f進みます。押しっぱなしでも連続で動きます。",
          "<code>Space</code>で再生／一時停止、<code>M</code>でメモ入力へ移動します。",
          "メモ入力欄などにフォーカスがあるときは、これらのショートカットは動きません。",
        ),
      ) +
      section(
        "5. メモを付ける",
        list(
          "一時停止した位置で50文字以内のメモを入力し、「追加」またはEnterを押します。追加すると自動で一時停止します。",
          "一覧のメモをタップするとその位置へ移動します。行の末尾の×ボタンで削除できます。",
          "シークバー上の目印でメモの位置がわかります。",
        ),
      ) +
      section(
        "6. メモの保存先",
        list(
          "Driveから開いた動画：動画と同じフォルダの「動画名.memo.vtt」へ自動保存します。作成できない場合は、マイドライブの「FrameStep メモ」フォルダへ保存します。",
          "別端末でもDriveから同じ動画を開けば、保存されたメモを読み込めます。変更後は「Drive に保存済み」の表示を確認してください。",
          "端末から開いた動画：その端末のブラウザに保存します。「.vtt を書き出す」「.vtt を読み込む」で持ち運べます。端末のファイル選択からDriveを選んだ場合も、この保存方法です。",
        ),
      ) +
      section(
        "7. ホーム画面に追加する",
        list(
          "iPhone（Safari）：共有ボタン →「ホーム画面に追加」を選びます。",
          "Android（Chrome）：メニュー →「ホーム画面に追加」または「アプリをインストール」を選びます。",
        ),
      ) +
      section(
        "8. 困ったとき",
        list(
          "「60fps の動画のみ対応しています」：60fpsで撮り直すか、60fpsで書き出し直してください。",
          "ログインできない：ポップアップのブロックを解除し、利用するGoogleアカウントを確認してください。",
          "「メモの保存に失敗しました」：通信を確認し、保存状態の「保存に失敗しました［再試行］」を押してください。",
          "再生が始まらない：読み込みの進み具合が出ていれば待ち、出なければページを再読み込みしてください。未保存の変更がある場合は、先に保存状態を確認してください。",
        ),
      ) +
      section("9. お問い合わせ", contact),
    en:
      section(
        "English — Help",
        p(
          "Review 60fps videos one frame at a time and attach timestamped notes. Only 60fps MP4 / MOV videos are supported; measured rates from 59.0 to 60.5fps are accepted.",
        ),
      ) +
      section(
        "1. Open a video",
        list(
          "Choose “Google でログインして Drive から開く”, sign in to Google, select a video, review its filename, duration and creation date, and choose “この動画を開く” (Open this video). Google asks for permission the first time.",
          "Choose “端末から開く” (Open from device), select a video and confirm with “この動画を開く”. A mobile system file chooser may also offer Google Drive.",
          "Other frame rates cannot be opened. The confirmation screen has no thumbnails. Device-file creation dates are unavailable in the browser and are shown as unavailable.",
        ),
      ) +
      section(
        "2. Frame controls and keyboard",
        list(
          "Tap “−1f” / “+1f” to pause and move back / forward one frame. Hold for 0.4 seconds to start repeated stepping; release to stop.",
          "Use the play button to play / pause and the seek bar to move to another position.",
          "On PC, comma moves back one frame, period moves forward, Space toggles playback and M focuses the note field. Holding comma or period repeats the action. Shortcuts are disabled in text fields.",
        ),
      ) +
      section(
        "3. Add notes",
        list(
          "At the paused position, enter up to 50 Unicode code points and choose “追加” (Add) or press Enter. Adding a note also pauses playback.",
          "Choose a note to jump to its position. Use its × button to delete it. Marks above the seek bar show note positions.",
        ),
      ) +
      section(
        "4. Note storage",
        list(
          "Videos opened through the Drive button: notes are saved automatically as video-name.memo.vtt in the video's folder, or in a “FrameStep メモ” folder in My Drive if creation there is denied.",
          "Opening the same video through Drive on another device loads its saved notes. Wait for “Drive に保存済み” (Saved to Drive) after making changes.",
          "Videos opened through the device chooser: notes stay in that browser. Use “.vtt を書き出す” (Export VTT) and “.vtt を読み込む” (Import VTT) to transfer them. This also applies when choosing a Drive file through the system device chooser.",
        ),
      ) +
      section(
        "5. Add to the home screen",
        list(
          "iPhone Safari: Share → Add to Home Screen.",
          "Android Chrome: Menu → Add to Home Screen or Install app.",
        ),
      ) +
      section(
        "6. Troubleshooting",
        list(
          "Unsupported frame rate: record or export the video at 60fps.",
          "Sign-in failure: allow pop-ups and check which Google account is signed in.",
          "Note save failure: check your connection and choose “保存に失敗しました［再試行］” (Save failed [Retry]).",
          "Playback does not start: wait if download progress is shown; otherwise reload. Check that your notes are saved before reloading.",
        ),
      ) +
      section("7. Contact", contactEn),
  },
  privacy: {
    title: "プライバシーポリシー",
    description:
      "FrameStep Playerが利用するGoogle認証情報、Driveファイル、メモ、キャッシュ、外部サービスについて。",
    ja:
      section("1. 運営者と連絡先", contact) +
      section(
        "2. 取得・利用する情報",
        p(
          "<strong>Googleアカウントの認証情報：</strong>Google Identity Servicesからアクセストークンを取得します。トークンはページとService Workerのメモリにのみ保持し、CookieやlocalStorageなどに永続保存せず、運営者のサーバーには送信しません。ページを閉じるとページ側のメモリは失われ、Service Worker側のメモリもWorkerの終了時に失われます。",
        ) +
          p(
            "<strong>Google Driveのファイル：</strong>要求する権限は<code>https://www.googleapis.com/auth/drive.file</code>のみです。利用者が選びアクセスを許可した動画、その動画に対応するアプリのメモファイル（.memo.vtt）、アプリが作成した「FrameStep メモ」フォルダを扱います。選択画面ではファイル名・長さ・作成日時などのメタデータを利用します。",
          ) +
          p(
            "動画は利用者のブラウザがGoogle Drive APIへ直接リクエストして読み込みます。再生用にメモリ上のBlobを作る場合がありますが、運営者のサーバーへアップロードせず、動画やメモをService Workerのキャッシュに保存しません。端末から選んだ動画もブラウザ内で読み込み、アップロードしません。",
          ) +
          p(
            "<strong>メモ：</strong>Driveから開いた動画のメモは利用者自身のGoogle Driveへ保存します。端末から開いた動画のメモは、そのブラウザのlocalStorageにファイル名とサイズをキーとして保存します。VTTの書き出し・読み込みも利用者の操作で行います。",
          ) +
          p(
            "<strong>アプリのキャッシュ：</strong>Service Workerは同じサイトの<code>/assets/</code>配下にあるJavaScript・CSSなど、画面を構成するファイルをキャッシュします。動画、メモ、アクセストークンはキャッシュしません。",
          ),
      ) +
      section(
        "3. 利用目的",
        p(
          "取得した情報は、動画の再生、フレーム確認、ファイルの選択、メモの保存・読み込みのためだけに利用します。広告、アクセス解析、AIの学習、その他の目的には利用しません。",
        ),
      ) +
      section(
        "4. 第三者への提供",
        p(
          "運営者が動画、メモ、Googleのユーザーデータを販売したり、第三者へ提供したりすることはありません。利用者の指示によるGoogle Driveへの保存と、次項の外部サービスへの通常の通信は行われます。",
        ),
      ) +
      section(
        "5. 外部サービス",
        list(
          "Google：ログイン、Google Picker、Google Drive APIを利用します。" +
            external(
              "https://policies.google.com/privacy",
              "Googleのプライバシーポリシー",
            ) +
            "をご確認ください。",
          "Google Fonts：アプリの画面でNoto Sans JPとJetBrains Monoを読み込むため、閲覧時にIPアドレスやリクエスト情報などがGoogleに送信されます。" +
            external(
              "https://developers.google.com/fonts/faq/privacy",
              "Google Fontsのプライバシー情報",
            ) +
            "をご確認ください。",
          "Vercel：サイトのホスティングに利用します。IPアドレス、ブラウザ情報、アクセス先などがVercelのアクセスログに記録される場合があります。" +
            external(
              "https://vercel.com/legal/privacy-notice",
              "Vercelのプライバシー通知",
            ) +
            "をご確認ください。",
          "運営者はアクセス解析、広告、Cookieによる追跡を実装していません。メモ保存にはCookieではなくlocalStorageを使用します。Googleのログイン画面など、外部サービスによるCookie等の扱いは各社のポリシーによります。",
        ),
      ) +
      section(
        "6. Google API Services User Data Policy",
        p(policySentence) +
          p(
            "日本語訳：FrameStep PlayerがGoogle APIから受け取った情報を利用し、他のアプリへ転送する場合は、Limited Use（限定的な利用）の要件を含むGoogle API Services User Data Policyに従います。",
          ),
      ) +
      section(
        "7. データの削除とアクセスの取り消し",
        list(
          "Driveのメモ：Google Drive上の該当する.memo.vttファイルを削除してください。画面内の×では個々のメモを削除できます。",
          "端末のメモ：ブラウザのこのサイトのサイトデータを削除してください。",
          "アクセスの取り消し：" +
            external(
              "https://myaccount.google.com/permissions",
              "Googleアカウントのアクセス許可",
            ) +
            "でFrameStep Playerへのアクセスを取り消してください。取り消しても既存のメモファイルは自動削除されません。",
        ),
      ) +
      section(
        "8. 改定",
        p("変更がある場合はこのページで告知し、改定日を更新します。"),
      ) +
      section(
        "9. 制定日・改定日",
        p("制定日・最終改定日：" + s.establishedDate),
      ),
    en:
      section("English — Privacy Policy", contactEn) +
      section(
        "1. Information we access and use",
        p(
          "<strong>Google authorization:</strong> The app obtains an access token through Google Identity Services. It is held only in page and Service Worker memory, never persisted in cookies or localStorage, and is not sent to the operator's server. Page memory is lost when the page closes; Worker memory is lost when that Worker terminates.",
        ) +
          p(
            "<strong>Google Drive files:</strong> The only requested scope is drive.file. The app handles videos selected and authorized by the user, associated app-created .memo.vtt files and the app-created “FrameStep メモ” folder. Selection uses metadata such as filename, duration and creation time.",
          ) +
          p(
            "Your browser requests videos directly from the Google Drive API. A temporary in-memory Blob may be used for playback. Videos are not uploaded to the operator's server or saved in the Service Worker cache. Device videos are read within the browser without uploading.",
          ) +
          p(
            "<strong>Notes:</strong> For videos opened through Drive, notes are stored in your own Google Drive. For videos opened through the device chooser, notes are stored in that browser's localStorage, keyed by filename and size. VTT export and import are initiated by you.",
          ) +
          p(
            "<strong>App cache:</strong> The Service Worker caches same-origin files under /assets/, such as JavaScript and CSS. It does not cache videos, notes or tokens.",
          ),
      ) +
      section(
        "2. Purpose and sharing",
        p(
          "Information is used only for video playback, frame review, file selection, and saving or loading notes. It is not used for advertising, analytics, AI training or other purposes. The operator does not sell or disclose your videos, notes or Google user data to third parties; your requested Drive storage and ordinary external-service requests described below still occur.",
        ),
      ) +
      section(
        "3. External services",
        list(
          "Google provides sign-in, Picker and the Drive API. See " +
            external(
              "https://policies.google.com/privacy",
              "Google's Privacy Policy",
            ) +
            ".",
          "Google Fonts supplies Noto Sans JP and JetBrains Mono to the app. Your IP address and request information are sent to Google when fonts load. See " +
            external(
              "https://developers.google.com/fonts/faq/privacy",
              "Google Fonts privacy information",
            ) +
            ".",
          "Vercel hosts the site and may record IP addresses, browser information and requested paths in access logs. See " +
            external(
              "https://vercel.com/legal/privacy-notice",
              "Vercel's Privacy Notice",
            ) +
            ".",
          "The operator implements no analytics, advertising or cookie tracking. Notes use localStorage rather than cookies. Cookies on external services such as Google's sign-in screens are governed by those services' policies.",
        ),
      ) +
      section("4. Google API Services User Data Policy", p(policySentence)) +
      section(
        "5. Deletion and revocation",
        list(
          "Delete the relevant .memo.vtt file in your Google Drive to remove Drive notes. The × button removes individual notes.",
          "Delete this site's browser data to remove device notes.",
          "Revoke FrameStep Player at " +
            external(
              "https://myaccount.google.com/permissions",
              "Google Account permissions",
            ) +
            ". Revocation does not automatically delete existing note files.",
        ),
      ) +
      section(
        "6. Revisions and dates",
        p(
          "Changes will be announced on this page and the revision date updated. Established and last revised: " +
            s.establishedDateEn +
            ".",
        ),
      ),
  },
  terms: {
    title: "利用規約",
    description:
      "FrameStep Playerの無料サービスとしての利用条件、利用者の責任、免責、連絡先について。",
    ja:
      section(
        "1. 適用",
        p(
          "本規約はFrameStep Playerを利用するすべての方に適用されます。利用を開始した時点で本規約に同意したものとみなします。",
        ),
      ) +
      section(
        "2. サービス内容",
        p(
          "Google Driveまたは端末の60fps動画を1フレーム単位で確認し、タイムスタンプ付きメモを付けられるWebアプリです。",
        ),
      ) +
      section(
        "3. 料金",
        p(
          "無料で利用できます。通信料や外部サービスの利用料は利用者の負担です。",
        ),
      ) +
      section(
        "4. 利用者の責任",
        list(
          "再生する動画とメモの内容に関する権利・責任は利用者にあります。",
          "Googleアカウントとファイルの管理は利用者の責任で行ってください。",
        ),
      ) +
      section(
        "5. 禁止事項",
        list(
          "法令や公序良俗に反する行為",
          "本サービスやGoogleのサービスに過度な負荷をかける行為",
          "他人の権利を侵害する行為",
          "本サービスの運営を妨げる行為",
        ),
      ) +
      section(
        "6. 免責",
        p(
          "本サービスは現状のまま提供し、正確性・完全性・特定目的への適合性を保証しません。メモの消失や動画・ファイルの損傷を含め、利用により生じた損害について、運営者に故意または重大な過失がある場合を除き責任を負いません。ただし、適用法令により制限できない責任は除きます。",
        ),
      ) +
      section(
        "7. サービスの変更・停止",
        p("予告なく内容を変更し、または提供を停止することがあります。"),
      ) +
      section(
        "8. ソースコード",
        p(
          "ソースコードは" +
            external(s.githubUrl, "GitHub") +
            "でMIT Licenseにより公開しています。本規約はWebサービスとしての利用に適用し、ソースコードの利用許諾はMIT Licenseに従います。",
        ),
      ) +
      section(
        "9. 規約の変更",
        p(
          "このページでの告知によって規約を変更できます。変更時には改定日を更新します。法令により別の手続きが必要な場合は、その手続きに従います。",
        ),
      ) +
      section(
        "10. 準拠法と管轄",
        p(
          "日本法を準拠法とします。紛争が生じた場合は、運営者の住所地を管轄する地方裁判所を第一審の専属的合意管轄裁判所とします。ただし、適用法令に別段の定めがある場合はそれに従います。",
        ),
      ) +
      section("11. お問い合わせ", contact) +
      section("12. 制定日", p("制定日・最終改定日：" + s.establishedDate)),
    en:
      section(
        "English — Terms of Service",
        p(
          "These terms apply to everyone using FrameStep Player. By beginning to use the service, you agree to these terms.",
        ),
      ) +
      section(
        "1. Service and fees",
        p(
          "FrameStep Player is a free web app for reviewing 60fps videos from Google Drive or your device frame by frame and attaching timestamped notes. You are responsible for network and external-service charges.",
        ),
      ) +
      section(
        "2. Your responsibilities",
        p(
          "You are responsible for rights to and the contents of your videos and notes, and for managing your Google account and files.",
        ),
      ) +
      section(
        "3. Prohibited conduct",
        list(
          "Violating laws or public order and morals.",
          "Placing excessive load on this service or Google's services.",
          "Infringing other people's rights.",
          "Interfering with operation of the service.",
        ),
      ) +
      section(
        "4. Disclaimer",
        p(
          "The service is provided as is, without warranties of accuracy, completeness or fitness for a particular purpose. The operator is not liable for damages arising from use, including lost notes or damage to videos or files, except in cases of intentional misconduct or gross negligence. Liability that cannot be limited by applicable law is not excluded.",
        ),
      ) +
      section(
        "5. Changes and suspension",
        p("The service may be changed or suspended without prior notice."),
      ) +
      section(
        "6. Source code",
        p(
          "Source code is available on " +
            external(s.githubUrl, "GitHub") +
            " under the MIT License. These terms govern use of the hosted service; the MIT License governs use of the source code.",
        ),
      ) +
      section(
        "7. Changes to these terms",
        p(
          "These terms may be changed by notice on this page, with the revision date updated. Any additional procedure required by applicable law will be followed.",
        ),
      ) +
      section(
        "8. Governing law and jurisdiction",
        p(
          "Japanese law governs these terms. The district court with jurisdiction over the operator's place of residence is the agreed exclusive court of first instance for disputes, except where applicable law requires otherwise.",
        ),
      ) +
      section(
        "9. Contact and date",
        contactEn +
          p("Established and last revised: " + s.establishedDateEn + "."),
      ),
  },
  licenses: {
    title: "ライセンス",
    description:
      "FrameStep PlayerのMIT License全文と、React・mp4box・フォントを含む第三者ライセンス情報。",
    ja:
      section(
        "FrameStep Player — MIT License",
        p(
          "本体のソースコードはMIT Licenseで公開しています。" +
            external(s.githubUrl, "GitHub リポジトリ") +
            "をご覧ください。",
        ),
      ) +
      section(
        "第三者のライセンス",
        p(
          '本番依存パッケージ・推移依存・フォントの著作権表示とライセンス原文は、生成済みの<a href="/licenses.txt">第三者ライセンス全文（licenses.txt）</a>をご覧ください。',
        ) +
          list(
            "React / React DOM：MIT",
            "mp4box：BSD-3-Clause",
            "Noto Sans JP / JetBrains Mono：SIL Open Font License 1.1（OFL-1.1）",
          ),
      ) +
      section("お問い合わせ", contact),
    en:
      section(
        "English — Licenses",
        p(
          "FrameStep Player source code is available under the MIT License at " +
            external(s.githubUrl, "the GitHub repository") +
            ". The complete MIT License text is provided below.",
        ),
      ) +
      section(
        "Third-party notices",
        p(
          'See <a href="/licenses.txt">licenses.txt</a> for generated notices and full license texts for production dependencies, transitive dependencies and fonts.',
        ) +
          list(
            "React / React DOM: MIT",
            "mp4box: BSD-3-Clause",
            "Noto Sans JP / JetBrains Mono: SIL Open Font License 1.1 (OFL-1.1)",
          ),
      ) +
      section("Contact", contactEn),
  },
};
