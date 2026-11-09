export const siteInfo = Object.freeze({
  appName: "FrameStep Player",
  description:
    "Google ドライブの 60fps 動画を 1 フレームずつ確認できる無料の Web アプリ",
  operator: "CI-V-178（個人開発）",
  copyrightHolder: "CI-V-178",
  email: "carrotinaba@gmail.com",
  xUrl: "https://x.com/carrot_inaba",
  xLabel: "@carrot_inaba",
  githubUrl: "https://github.com/CI-V-178/FrameStepPlayer",
  siteUrl: "https://frame-step-player.win",
  license: "MIT",
  year: 2026,
  establishedDate: "2026年11月2日",
  establishedDateEn: "November 2, 2026",
  privacyRevisedDate: "2026年11月9日",
  privacyRevisedDateEn: "November 9, 2026",
  trademark:
    "Google、Google ドライブ は Google LLC の商標です。FrameStep Player は Google が提供・承認しているものではありません。",
  trademarkEn:
    "Google and Google Drive are trademarks of Google LLC. FrameStep Player is not affiliated with or endorsed by Google.",
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
