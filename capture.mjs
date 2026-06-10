// Dev-only: capture the envelope scene at several scroll positions so the
// scroll-driven choreography can be eyeballed/tuned. Run: node capture.mjs
import { chromium } from "playwright";
import { mkdirSync } from "fs";

const URL = process.env.URL || "http://localhost:3001";
const OUT = "shots";
// progress points (0..1) across the scene, labelled by beat
const FRAMES = [
  [0.0, "00-reveal"],
  [0.14, "01-rising"],
  [0.28, "02-risen"],
  [0.4, "03-flap-opening"],
  [0.52, "04-flap-open"],
  [0.66, "05-ejecting"],
  [0.8, "06-ejecting2"],
  [0.92, "07-settled"],
  [1.0, "08-hold"],
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: "no-preference",
});

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForSelector(".envelope");

const maxScroll = await page.evaluate(
  () => document.body.scrollHeight - window.innerHeight,
);
console.log("maxScroll =", maxScroll, "px");

for (const [p, label] of FRAMES) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(p * maxScroll));
  await page.waitForTimeout(450); // let the scrub + rAF settle
  const file = `${OUT}/${label}.png`;
  await page.screenshot({ path: file });
  console.log(`p=${p.toFixed(2)}  ->  ${file}`);
}

await browser.close();
console.log("done");
