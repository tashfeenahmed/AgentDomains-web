#!/usr/bin/env node
// Deterministic Programmatic SEO & Free Tools Static Generator for AgentDomains
// Zero external npm dependencies (pure Node 24 ESM).
// Preserves all hand-authored core pages (/, /compare, /compare/paid-rivals, /pricing, /manage, /404).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMcpPages } from './seo-renderers/render-mcp.mjs';
import { buildGuidePages } from './seo-renderers/render-guides.mjs';
import { buildComparePages } from './seo-renderers/render-compare.mjs';
import { buildUseCasePages } from './seo-renderers/render-use-cases.mjs';
import { buildDnsPages } from './seo-renderers/render-dns.mjs';
import { buildNamesPages } from './seo-renderers/render-names.mjs';
import { buildToolPages } from './seo-renderers/render-tools.mjs';
import { writeUrlSet, writeSitemapIndex } from './seo-lib/sitemap.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

// Guardrail: never allow generator to overwrite hand-authored core files
const PROTECTED = new Set([
  path.join(PUBLIC_DIR, 'index.html'),
  path.join(PUBLIC_DIR, 'pricing', 'index.html'),
  path.join(PUBLIC_DIR, 'compare', 'index.html'),
  path.join(PUBLIC_DIR, 'compare', 'paid-rivals', 'index.html'),
  path.join(PUBLIC_DIR, 'manage', 'index.html'),
  path.join(PUBLIC_DIR, '404.html'),
]);

function writePages(pages) {
  for (const p of pages) {
    const rel = p.path.replace(/^\/+/, '');
    const outPath = path.join(PUBLIC_DIR, rel, 'index.html');
    if (PROTECTED.has(outPath)) {
      throw new Error(`Refusing to overwrite protected hand-authored page: ${outPath}`);
    }
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, p.html, 'utf8');
  }
}

const clusters = {
  mcp: buildMcpPages(),
  guides: buildGuidePages(),
  compare: buildComparePages(),
  'use-cases': buildUseCasePages(),
  dns: buildDnsPages(),
  names: buildNamesPages(),
  tools: buildToolPages(),
};

for (const [name, pages] of Object.entries(clusters)) {
  writePages(pages);
  console.log(`[build-seo] ${name.padEnd(10)} -> ${String(pages.length).padStart(3)} HTML pages written`);
}

// Write 8 segmented XML sitemaps + sitemapindex
const coreUrls = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/compare', changefreq: 'monthly', priority: '0.9' },
  { path: '/compare/paid-rivals', changefreq: 'monthly', priority: '0.9' },
  { path: '/pricing', changefreq: 'monthly', priority: '0.8' },
];

writeUrlSet(PUBLIC_DIR, 'sitemap-core.xml', coreUrls);
writeUrlSet(PUBLIC_DIR, 'sitemap-mcp.xml', clusters.mcp);
writeUrlSet(PUBLIC_DIR, 'sitemap-guides.xml', clusters.guides);
writeUrlSet(PUBLIC_DIR, 'sitemap-compare.xml', clusters.compare);
writeUrlSet(PUBLIC_DIR, 'sitemap-use-cases.xml', clusters['use-cases']);
writeUrlSet(PUBLIC_DIR, 'sitemap-dns.xml', clusters.dns);
writeUrlSet(PUBLIC_DIR, 'sitemap-names.xml', clusters.names);
writeUrlSet(PUBLIC_DIR, 'sitemap-tools.xml', clusters.tools);

const sitemapFiles = [
  'sitemap-core.xml',
  'sitemap-mcp.xml',
  'sitemap-guides.xml',
  'sitemap-compare.xml',
  'sitemap-use-cases.xml',
  'sitemap-dns.xml',
  'sitemap-names.xml',
  'sitemap-tools.xml',
];
writeSitemapIndex(PUBLIC_DIR, sitemapFiles);

const totalGenerated = Object.values(clusters).reduce((sum, arr) => sum + arr.length, 0);
const totalIndexed = totalGenerated + coreUrls.length;
console.log(`[build-seo] Done! Generated ${totalGenerated} new pages (+ ${coreUrls.length} core = ${totalIndexed} indexed URLs across ${sitemapFiles.length} sitemaps).`);
