import fs from 'node:fs';
import path from 'node:path';
import { SITE, LASTMOD } from './layout.mjs';

function xmlEsc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function writeUrlSet(publicDir, filename, entries) {
  const body = entries
    .map((e) => {
      const loc = e.path === '/' ? `${SITE}/` : `${SITE}${e.path}`;
      return `  <url>
    <loc>${xmlEsc(loc)}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${e.changefreq || 'monthly'}</changefreq>
    <priority>${e.priority || '0.7'}</priority>
  </url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
  fs.writeFileSync(path.join(publicDir, filename), xml, 'utf8');
}

export function writeSitemapIndex(publicDir, filenames) {
  const body = filenames
    .map(
      (f) => `  <sitemap>
    <loc>${xmlEsc(`${SITE}/${f}`)}</loc>
    <lastmod>${LASTMOD}</lastmod>
  </sitemap>`
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
}
