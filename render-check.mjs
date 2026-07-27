import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { chromium } from "file:///C:/Users/86189/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs";

const root = "C:/Users/86189/Documents/Codex/2026-07-26/ne/work/WhimsicalHe-main";
const out = "C:/Users/86189/Documents/Codex/2026-07-26/ne/work";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const file = normalize(join(root, requested));
  if (!file.startsWith(normalize(root))) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": mime[extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});

await new Promise((resolve) => server.listen(4173, "127.0.0.1", resolve));

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
const failures = [];

page.on("response", (response) => {
  if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
});
page.on("pageerror", (error) => failures.push(`pageerror ${error.message}`));

await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
await page.evaluate(async () => {
  for (let y = 0; y <= document.body.scrollHeight; y += 420) {
    window.scrollTo(0, y);
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  window.scrollTo(0, 0);
  await new Promise((resolve) => setTimeout(resolve, 120));
});
await page.screenshot({ path: `${out}/racco-desktop.png`, fullPage: true });

const desktopMetrics = await page.evaluate(() => {
  const hero = document.querySelector(".hero");
  const title = document.querySelector(".hero-title");
  const cards = [...document.querySelectorAll(".work-card")];
  return {
    heroHeight: Math.round(hero.getBoundingClientRect().height),
    titleText: title.textContent.trim().replace(/\s+/g, " "),
    cardCount: cards.length,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
  };
});

await page.setViewportSize({ width: 390, height: 1100 });
await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
await page.evaluate(async () => {
  for (let y = 0; y <= document.body.scrollHeight; y += 360) {
    window.scrollTo(0, y);
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  window.scrollTo(0, 0);
  await new Promise((resolve) => setTimeout(resolve, 120));
});
await page.screenshot({ path: `${out}/racco-mobile.png`, fullPage: true });

const mobileMetrics = await page.evaluate(() => ({
  horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
  hamburgerVisible: getComputedStyle(document.querySelector(".hamburger")).display !== "none",
  heroTitleWidth: Math.round(document.querySelector(".hero-title").getBoundingClientRect().width),
}));

await browser.close();
server.close();

console.log(JSON.stringify({ failures, desktopMetrics, mobileMetrics }, null, 2));
