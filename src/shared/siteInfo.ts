export const siteInfo = Object.freeze({
  appName: "FrameStep Player",
  description: "Google Drive の 60fps 動画を 1 フレームずつ確認できます",
  operator: "CI-V-178（個人開発）",
  copyrightHolder: "CI-V-178",
  email: "carrotinaba@gmail.com",
  xUrl: "https://x.com/carrot_inaba",
  xLabel: "@carrot_inaba",
  githubUrl: "https://github.com/CI-V-178/FrameStepPlayer",
  siteUrl: "https://frame-step-player.vercel.app",
  license: "MIT",
  year: 2026,
  establishedDate: "2026年11月2日",
  establishedDateEn: "November 2, 2026",
});
export const siteLinks = [
  { label: "使い方", href: "/help" },
  { label: "プライバシーポリシー", href: "/privacy" },
  { label: "利用規約", href: "/terms" },
  { label: "ライセンス", href: "/licenses" },
  { label: "お問い合わせ", href: "mailto:" + siteInfo.email },
];
export const socialLinks = [
  {
    href: siteInfo.githubUrl,
    label: "GitHub リポジトリ",
    path: "M8 20v-4c-4 1-5-2-5-2m14 6v-4c0-1-1-2-2-2 4 0 6-2 6-5 0-2-1-3-2-4l-1-3-4 2H10L6 2 5 5C4 6 3 7 3 9c0 3 2 5 6 5-1 0-1 1-1 2",
  },
  {
    href: siteInfo.xUrl,
    label: "X（" + siteInfo.xLabel + "）",
    path: "m5 4 14 16M19 4 5 20",
  },
];
