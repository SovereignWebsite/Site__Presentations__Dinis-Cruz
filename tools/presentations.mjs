// Builds site/presentations/index.json from the folders in site/presentations/.
// To add a presentation: make a folder site/presentations/<short-name>/ and put the PDF in it.
// Optional: a presentation.json beside it, e.g. {"title": "...", "date": "2019-05-01", "event": "...", "summary": "..."}.
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
const root = 'site/presentations';
const items = [];
for (const slug of readdirSync(root).sort()) {
  const dir = `${root}/${slug}`;
  if (!statSync(dir).isDirectory()) continue;
  const files = readdirSync(dir);
  const pdf = files.find((f) => f.toLowerCase().endsWith('.pdf'));
  let meta = {};
  if (existsSync(`${dir}/presentation.json`)) {
    try { meta = JSON.parse(readFileSync(`${dir}/presentation.json`, 'utf8')); } catch (e) { console.log(`::warning::${dir}/presentation.json is not valid JSON; using the folder name`); }
  }
  if (!pdf && !meta.url) { console.log(`::warning::${dir} has no PDF yet; skipped`); continue; }
  const pick = (k) => (typeof meta[k] === 'string' ? meta[k].slice(0, 400) : '');
  items.push({
    slug,
    title: pick('title') || slug.replace(/[-_]+/g, ' ').replace(/^./, (c) => c.toUpperCase()),
    date: pick('date'), event: pick('event'), summary: pick('summary'),
    pdf: pdf ? `/presentations/${slug}/${encodeURIComponent(pdf)}` : '',
    url: pick('url'),
  });
}
items.sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title));
writeFileSync(`${root}/index.json`, JSON.stringify({ updated: new Date().toISOString(), presentations: items }, null, 2) + '\n');
console.log(`presentations: ${items.length}`);
