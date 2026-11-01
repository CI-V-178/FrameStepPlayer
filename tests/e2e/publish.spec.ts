import { test, expect, type Locator, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { siteInfo, siteLinks } from "../../src/shared/siteInfo";

const paths = ["/help", "/privacy", "/terms", "/licenses"];
const titles = ["使い方", "プライバシーポリシー", "利用規約", "ライセンス"];
async function checkLinks(nav: Locator) {
  for (const link of siteLinks)
    await expect(
      nav.getByRole("link", { name: link.label, exact: true }),
    ).toHaveAttribute("href", link.href);
}
async function openVideo(page: Page) {
  await page.goto("/");
  await page
    .getByLabel("動画ファイル", { exact: true })
    .setInputFiles("Example/MOCK/f60.mp4");
  await page
    .getByRole("button", { name: "この動画を開く", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "再生", exact: true }),
  ).toBeEnabled();
}
test("P1: 静的4ページはJSなしで本文と連絡先・英語を表示", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  for (const [i, path] of paths.entries()) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText(titles[i]);
    await expect(page.locator("main")).toContainText(siteInfo.email);
    await expect(page.locator("main section[lang=en]")).toContainText(
      "English",
    );
    if (path === "/help")
      await expect(page.locator("main img,main svg,main video")).toHaveCount(0);
  }
  await context.close();
});
test("P2: トップもJSなしで説明とprivacyリンクを表示", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("main")).toContainText(siteInfo.description);
  await expect(page.locator('main a[href="/privacy"]').first()).toBeVisible();
  await expect(page.locator("main")).toContainText(siteInfo.email);
  await context.close();
});
test("P3: 最初の画面のフッターは5リンクと外部2リンク", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer.site-footer");
  await expect(footer).toBeVisible();
  await checkLinks(footer.getByRole("navigation", { name: "公開情報" }));
  for (const [label, url] of [
    ["GitHub リポジトリ", siteInfo.githubUrl],
    ["X（" + siteInfo.xLabel + "）", siteInfo.xUrl],
  ]) {
    const link = footer.getByRole("link", { name: label, exact: true });
    await expect(link).toHaveAttribute("href", url);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
  expect(await footer.locator("svg").count()).toBe(2);
});
test("P4: 再生画面はスマホのその他メニュー・PC右下から辿れる", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openVideo(page);
  await expect(page.locator("footer.site-footer")).toHaveCount(0);
  await page.getByRole("button", { name: "その他", exact: true }).click();
  const menu = page.locator("#site-menu-links");
  await expect(menu).toBeVisible();
  await checkLinks(menu.getByRole("navigation", { name: "公開情報" }));
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await page.setViewportSize({ width: 1280, height: 800 });
  await checkLinks(page.locator("aside .site-panel-links"));
  await expect(
    page.getByRole("button", { name: "その他", exact: true }),
  ).toBeHidden();
});
test("P5: licenses.txtは200でreactの通知を含む", async ({ request }) => {
  const response = await request.get("/licenses.txt");
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("react");
  expect(await response.text()).toContain("BSD-3-Clause");
  expect(await response.text()).toContain("OFL-1.1");
});
async function verificationBuild(value: string) {
  const dir = await mkdtemp(join(tmpdir(), "framestep-verification-"));
  try {
    execFileSync(
      process.execPath,
      [resolve("node_modules/vite/bin/vite.js"), "build", "--outDir", dir],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          VITE_GOOGLE_SITE_VERIFICATION: value,
          VITE_E2E: "",
        },
        encoding: "utf8",
        timeout: 30000,
      },
    );
    return await readFile(join(dir, "index.html"), "utf8");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
test("P6: 空の所有確認タグを本番HTMLから除外", async () => {
  const html = await verificationBuild("");
  expect(html).not.toContain("google-site-verification");
  expect(html).not.toContain("%VITE_");
});
test("P7: 設定した所有確認値を本番HTMLに出力", async () => {
  const html = await verificationBuild("framestep-test-verification-2026");
  expect(html).toContain(
    '<meta name="google-site-verification" content="framestep-test-verification-2026">',
  );
});
test("P8: siteInfoと静的ページの固定情報・canonicalが一致", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  for (const path of ["/", ...paths]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.+/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      siteInfo.siteUrl + (path === "/" ? "" : path),
    );
    const footer = page.locator("footer.site-footer");
    await expect(
      footer.locator('a[href="mailto:' + siteInfo.email + '"]'),
    ).toHaveCount(1);
    await expect(
      footer.getByRole("link", { name: "GitHub リポジトリ" }),
    ).toHaveAttribute("href", siteInfo.githubUrl);
    await expect(
      footer.getByRole("link", { name: "X（" + siteInfo.xLabel + "）" }),
    ).toHaveAttribute("href", siteInfo.xUrl);
    await expect(page.locator("main")).toContainText(siteInfo.operator);
  }
  await context.close();
  const config = JSON.parse(await readFile("vercel.json", "utf8"));
  expect(config.cleanUrls).toBe(true);
  const rewrite = new RegExp("^" + config.rewrites[0].source + "$");
  for (const path of [
    ...paths,
    ...paths.map((p) => p + ".html"),
    "/licenses.txt",
    "/site.css",
    "/google123.html",
    "/assets/test.js",
    "/drive-stream/1",
  ])
    expect(rewrite.test(path)).toBe(false);
  expect(rewrite.test("/arbitrary-spa-path")).toBe(true);
});
test("P9: 全静的ページが390px幅で横スクロールしない", async ({
  browser,
  baseURL,
}, info) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await mkdir("docs/screenshots", { recursive: true });
  for (const path of ["/", ...paths]) {
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/help");
  await page.screenshot({
    path: "docs/screenshots/" + info.project.name + "-help-390.png",
    fullPage: true,
  });
  await context.close();
});
