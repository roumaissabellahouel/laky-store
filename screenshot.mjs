import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const url      = process.argv[2] || "http://localhost:3000";
const label    = process.argv[3] || "";
const viewport = process.argv[4] || "desktop"; // desktop | tablet | mobile
const injectCart = process.argv[5] === "--with-cart";

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet:  { width: 768,  height: 1024 },
  mobile:  { width: 375,  height: 812 },
};

const MOCK_CART = [
  { productId: "p1", name: "Bague Stella",   price: 2900, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=85", slug: "bague-stella",   quantity: 1 },
  { productId: "p2", name: "Collier Luna",   price: 1800, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=85", slug: "collier-luna",   quantity: 2 },
  { productId: "p4", name: "Boucles Dina",   price: 1600, image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&q=85", slug: "boucles-dina",   quantity: 1 },
];

const dir = path.join(process.cwd(), "screenshots");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const existing = fs.readdirSync(dir).filter(f => f.endsWith(".png"));
const nums = existing.map(f => parseInt(f.match(/^(\d+)/)?.[1] ?? "0")).filter(Boolean);
const n = (Math.max(0, ...nums) + 1).toString().padStart(3, "0");

const parts = [n, viewport, label].filter(Boolean);
const filename = `${parts.join("-")}.png`;
const filepath = path.join(dir, filename);

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.setViewport(VIEWPORTS[viewport] || VIEWPORTS.desktop);

if (injectCart) {
  // Navigate to base URL first to set localStorage, then navigate to target
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.evaluate((cart) => {
    localStorage.setItem("laky_cart", JSON.stringify(cart));
  }, MOCK_CART);
}

await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
await new Promise(r => setTimeout(r, 1000));
// Use fullPage only for desktop/tablet to avoid oversized mobile screenshots
const useFullPage = viewport !== "mobile";
await page.screenshot({ path: filepath, fullPage: useFullPage });
await browser.close();

console.log(`✓ Screenshot saved: screenshots/${filename}`);
