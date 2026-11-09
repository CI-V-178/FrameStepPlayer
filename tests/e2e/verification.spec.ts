import { test, expect, type Page } from "@playwright/test";
import { mkdir, readFile, readdir } from "node:fs/promises";
import { siteInfo } from "../../src/shared/siteInfo";

const staticPaths = ["/", "/help", "/privacy", "/terms", "/licenses"];
const oldUrl = "frame-step-player.vercel.app";
const newUrl = "https://frame-step-player.win";
// 「Google 」が前に付かない単独の「Drive」
const bareDrive = /(?<!Google )\bDrive\b/;

async function visibleText(page: Page) {
  const text = await page.locator("body").innerText();
  const labels = await page
    .locator("[aria-label]")
    .evaluateAll((els) => els.map((el) => el.getAttribute("aria-label")));
  return text + "\n" + labels.join("\n");
}
function noBareDrive(text: string, where: string) {
  const hits = text
    .split("\n")
    .filter((line) => bareDrive.test(line))
    .map((line) => line.trim());
  expect(hits, where).toEqual([]);
}

test("V1: JSなしのトップに Google ユーザーデータの説明と /privacy へのリンク", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto("/");
  const main = page.locator("main");
  await expect(
    main.getByRole("heading", {
      name: "Google ユーザーデータの利用について",
      exact: true,
    }),
  ).toBeVisible();
  const section = page.locator("#google-user-data");
  await expect(section).toContainText(
    "https://www.googleapis.com/auth/drive.file",
  );
  await expect(section).toContainText("このアプリで使用する特定のファイルのみ");
  await expect(section.locator('a[href="/privacy"]')).toHaveCount(1);
  await expect(main).toContainText("できること");
  await expect(main.locator('a[href="/help"]').first()).toBeVisible();
  await expect(
    main.getByRole("heading", { name: "How we use Google user data" }),
  ).toBeVisible();
  await context.close();
});

test("V2: JSなしの /privacy にデータ種類の表・保存期間・保護・Limited Use", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto("/privacy");
  const main = page.locator("main");
  const table = main.locator("table").first();
  await expect(table).toBeVisible();
  for (const row of [
    "OAuth アクセストークン",
    "選んだ動画のメタデータ",
    "選んだ動画の中身",
    "メモファイル",
    "アプリが作ったフォルダ",
  ])
    await expect(table).toContainText(row);
  await expect(main.locator("table")).toHaveCount(2);
  await expect(
    main.getByRole("heading", { name: "4. 保存場所と保存期間" }),
  ).toBeVisible();
  await expect(
    main.getByRole("heading", { name: "5. データの保護" }),
  ).toBeVisible();
  await expect(main).toContainText("HTTPS");
  await expect(main).toContainText(
    "メールアドレス、氏名、プロフィール写真、連絡先",
  );
  // Limited Use の一文が「取得・利用する情報」の直後（表より前）にある
  const callout = main.locator(".policy-callout").first();
  await expect(callout).toContainText("Limited Use requirements");
  expect(
    await callout.evaluate(
      (el, t) =>
        !!(el.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING),
      await table.elementHandle(),
    ),
  ).toBe(true);
  await expect(main).toContainText(
    "最終改定日：" + siteInfo.privacyRevisedDate,
  );
  await expect(main).toContainText("削除の対象となるデータはありません");
  await context.close();
});

test("V3: ログインボタンは公式 G ロゴと文言のみ、直上にプライバシー通知", async ({
  page,
}) => {
  await page.goto("/");
  const button = page.getByRole("button", {
    name: "Google でログイン",
    exact: true,
  });
  await expect(button).toHaveCount(1);
  await expect(button).toHaveText("Google でログイン");
  const info = await button.evaluate((el) => {
    const svgs = el.querySelectorAll("svg");
    const style = getComputedStyle(el);
    return {
      svgCount: svgs.length,
      imgCount: el.querySelectorAll("img").length,
      fills: [...el.querySelectorAll("svg path")].map((p) =>
        p.getAttribute("fill"),
      ),
      testId: svgs[0]?.getAttribute("data-testid"),
      background: style.backgroundColor,
      border: style.borderTopColor,
      color: style.color,
      height: style.height,
      radius: style.borderTopLeftRadius,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      prevClass: el.previousElementSibling?.className,
      prevPrivacyLink:
        el.previousElementSibling?.querySelector('a[href="/privacy"]')
          ?.textContent,
    };
  });
  expect(info).toMatchObject({
    svgCount: 1,
    imgCount: 0,
    fills: ["#EA4335", "#4285F4", "#FBBC05", "#34A853", "none"],
    testId: "google-g-logo",
    background: "rgb(19, 19, 20)",
    border: "rgb(142, 145, 143)",
    color: "rgb(227, 227, 227)",
    height: "40px",
    radius: "20px",
    fontSize: "14px",
    fontWeight: "500",
    prevClass: "privacy-notice",
    prevPrivacyLink: "プライバシーポリシー",
  });
  await expect(page.locator(".privacy-notice")).toContainText(
    "このアプリは、あなたが選んだ Google ドライブの動画と、アプリが作るメモファイル（.memo.vtt）にだけアクセスします。データは運営者のサーバーに送られません。",
  );
  // 未ログインでは「Google ドライブから開く」を出さない
  await expect(
    page.getByRole("button", { name: "Google ドライブから開く" }),
  ).toHaveCount(0);
  // 最初の画面にも Google ユーザーデータの要点とリンクを表示
  await expect(
    page.getByRole("heading", { name: "Google ユーザーデータの利用について" }),
  ).toBeVisible();
});

test("V3: ログイン後は「Google ドライブから開く」を表示", async ({ page }) => {
  await page.route("https://www.googleapis.com/**", (route) =>
    route.fulfill({ status: 404, body: "{}" }),
  );
  await page.goto("/");
  await page.evaluate(() =>
    window.__framestep!.openDrive({ fileId: "none", token: "mock-token" }),
  );
  await expect(
    page.getByRole("button", { name: "Google ドライブから開く" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Google でログイン" }),
  ).toHaveCount(0);
  noBareDrive(await visibleText(page), "ログイン後の最初の画面");
});

test("V4: 静的ページ・最初の画面に単独の「Drive」が無い", async ({
  browser,
  baseURL,
  page,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const staticPage = await context.newPage();
  for (const path of staticPaths) {
    await staticPage.goto(path);
    noBareDrive(await visibleText(staticPage), path);
    expect(await staticPage.title()).not.toMatch(bareDrive);
    expect(
      await staticPage
        .locator('meta[name="description"]')
        .getAttribute("content"),
    ).not.toMatch(bareDrive);
  }
  await context.close();
  await page.goto("/");
  noBareDrive(await visibleText(page), "最初の画面");
  noBareDrive(await readFile("README.md", "utf8"), "README.md");
  // 画面のソース中の文字列リテラル・JSX テキスト（識別子・コメントは除く）
  for (const dir of [
    "src/app",
    "src/features/selection",
    "src/features/drive",
    "src/shared",
  ]) {
    for (const file of await readdir(dir)) {
      if (!/\.tsx?$/.test(file)) continue;
      const source = (await readFile(dir + "/" + file, "utf8"))
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "");
      const literals = [
        ...source.matchAll(/"([^"\n]*)"|`([^`]*)`|>([^<>{}]+)</g),
      ].map((m) => m[1] ?? m[2] ?? m[3]);
      noBareDrive(literals.join("\n"), dir + "/" + file);
    }
  }
});

test("V5: 全静的ページと README に商標の表記", async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  for (const path of staticPaths) {
    await page.goto(path);
    const footer = page.locator("footer.site-footer");
    await expect(footer, path).toContainText(siteInfo.trademark);
    await expect(footer, path).toContainText(siteInfo.trademarkEn);
  }
  await context.close();
  const readme = await readFile("README.md", "utf8");
  expect(readme.trimEnd().endsWith(siteInfo.trademarkEn)).toBe(true);
  expect(readme).toContain(siteInfo.trademark);
});

test("V5: React の最初の画面のフッターにも商標の表記", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer.site-footer");
  await expect(footer).toContainText(siteInfo.trademark);
  await expect(footer).toContainText(siteInfo.trademarkEn);
});

test("V7: 公開 URL は frame-step-player.win で vercel.app が残っていない", async ({
  browser,
  baseURL,
}) => {
  expect(siteInfo.siteUrl).toBe(newUrl);
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  for (const path of staticPaths) {
    await page.goto(path);
    const html = await page.content();
    expect(html, path).not.toContain(oldUrl);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      newUrl + (path === "/" ? "" : path),
    );
  }
  await context.close();
  const readme = await readFile("README.md", "utf8");
  expect(readme).not.toContain(oldUrl);
  expect(readme).toContain("[" + newUrl + "](" + newUrl + ")");
  for (const file of [
    "src/shared/siteInfo.ts",
    "src/shared/homeContent.ts",
    "src/app/App.tsx",
    "scripts/site-content.mjs",
    "scripts/generate-pages.mjs",
  ])
    expect(await readFile(file, "utf8"), file).not.toContain(oldUrl);
});

test("V6: 390×844 と 1280×800 で最初の画面を撮影", async ({ page }, info) => {
  await mkdir("docs/screenshots/verification", { recursive: true });
  for (const [width, height] of [
    [390, 844],
    [1280, 800],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Google でログイン" }),
    ).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path:
        "docs/screenshots/verification/" +
        info.project.name +
        "-" +
        width +
        "x" +
        height +
        ".png",
    });
  }
});
