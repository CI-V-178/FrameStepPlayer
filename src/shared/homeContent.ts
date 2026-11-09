// トップページ（静的 index.html と React の最初の画面）で共有する説明文。
export const driveScope = "https://www.googleapis.com/auth/drive.file";

export const homeContent = Object.freeze({
  ja: {
    featuresHeading: "できること",
    features: [
      "±1 フレーム移動、長押しでの連続移動",
      "一時停止した位置に、タイムスタンプ付きのメモ（50 文字以内）",
      "メモを Google ドライブに保存して、スマホと PC で共有",
      "端末の動画も開ける（Google ログイン不要）",
    ],
    dataHeading: "Google ユーザーデータの利用について",
    scopeLabel: "要求する権限：",
    scopeNote:
      " だけです（Google ドライブの「このアプリで使用する特定のファイルのみ」）。",
    purposeLabel: "使う目的：",
    purposes: [
      "利用者が Google Picker で選んだ動画を、ブラウザで再生するため",
      "メモファイル（動画名.memo.vtt）を作成・読み込み・更新するため",
    ],
    notAccessed:
      "アクセスしないもの：選んでいない動画やファイル、メールアドレスやプロフィールなど、ほかの Google アカウント情報。",
    flow: "動画とメモは、利用者のブラウザと Google ドライブの間だけでやり取りし、運営者のサーバーには送りません。",
    privacyBefore: "詳しくは",
    privacyLink: "プライバシーポリシー",
    privacyAfter: "をご覧ください。",
    stepsHeading: "使い方",
    steps: [
      "「Google でログイン」してから「Google ドライブから開く」、または「端末から開く」で 60fps の動画を選びます。",
      "「−1f」「+1f」で 1 フレームずつ移動します。長押しすると連続で移動します。",
      "一時停止した位置にメモを追加します。メモを選ぶとその位置へ戻ります。",
    ],
    helpLink: "詳しい使い方",
  },
  en: {
    tagline:
      "A free web app for reviewing 60fps videos from Google Drive one frame at a time",
    featuresHeading: "Features",
    features: [
      "Step ±1 frame, or hold to step continuously",
      "Add timestamped notes (up to 50 characters) at the paused position",
      "Save notes to Google Drive and share them between phone and PC",
      "Open videos from your device, too (no Google sign-in required)",
    ],
    dataHeading: "How we use Google user data",
    scopeLabel: "Requested scope: ",
    scopeNote:
      " only (Google Drive access limited to the specific files you use with this app).",
    purposeLabel: "Purposes:",
    purposes: [
      "To play the video you select with Google Picker in your browser",
      "To create, read and update the note file (video-name.memo.vtt)",
    ],
    notAccessed:
      "Not accessed: videos or files you did not select, and any other Google Account information such as your email address or profile.",
    flow: "Videos and notes travel only between your browser and Google Drive. They are never sent to the operator's server.",
    privacyBefore: "See the ",
    privacyLink: "Privacy Policy",
    privacyAfter: " for details.",
    stepsHeading: "How to use",
    steps: [
      "Choose “Sign in with Google” and then “Open from Google Drive”, or “Open from device”, to select a 60fps video.",
      "Use “−1f” / “+1f” to move one frame at a time. Hold to step continuously.",
      "Add notes at the paused position. Choose a note to jump back to it.",
    ],
    helpLink: "Full help",
  },
});

// アプリは日本語表示のみのため、通知も日本語のみ。
export const privacyNotice =
  "このアプリは、あなたが選んだ Google ドライブの動画と、アプリが作るメモファイル（.memo.vtt）にだけアクセスします。データは運営者のサーバーに送られません。";
