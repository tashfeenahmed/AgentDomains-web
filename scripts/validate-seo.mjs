#!/usr/bin/env node
// Comprehensive validation script for AgentDomains Programmatic SEO & Tools
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

const errors = [];
const warnings = [];

function walk(dir, ext) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(full, ext));
    else if (ent.name.endsWith(ext)) out.push(full);
  }
  return out;
}

const htmlFiles = walk(PUBLIC_DIR, '.html').sort();
const titles = new Map();
const descs = new Map();
let jsonLdCount = 0;
let inlineScriptCount = 0;
const clusterCounts = {
  core: 0,
  mcp: 0,
  guides: 0,
  compare: 0,
  'use-cases': 0,
  dns: 0,
  names: 0,
  tools: 0,
};

for (const file of htmlFiles) {
  const rel = path.relative(PUBLIC_DIR, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  const isNoIndex = /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html) || rel === '404.html';

  if (rel.startsWith('mcp/')) clusterCounts.mcp++;
  else if (rel.startsWith('guides/')) clusterCounts.guides++;
  else if (rel.startsWith('compare/') && rel !== 'compare/index.html' && rel !== 'compare/paid-rivals/index.html') clusterCounts.compare++;
  else if (rel.startsWith('use-cases/')) clusterCounts['use-cases']++;
  else if (rel.startsWith('dns/')) clusterCounts.dns++;
  else if (rel.startsWith('names/')) clusterCounts.names++;
  else if (rel.startsWith('tools/')) clusterCounts.tools++;
  else clusterCounts.core++;

  // 1. Validate all JSON-LD blocks
  const ldRegex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let m;
  let pageLd = 0;
  while ((m = ldRegex.exec(html)) !== null) {
    pageLd++;
    jsonLdCount++;
    try {
      const parsed = JSON.parse(m[1]);
      if (!parsed['@context']) errors.push(`${rel}: JSON-LD missing @context`);
    } catch (e) {
      errors.push(`${rel}: Invalid JSON-LD: ${e.message}`);
    }
  }
  if (!isNoIndex && pageLd === 0) {
    errors.push(`${rel}: Missing application/ld+json`);
  }

  // 2. Validate title, description (<=160c), canonical, OG + Twitter
  if (!isNoIndex) {
    const tMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    if (!tMatch) errors.push(`${rel}: Missing <title>`);
    else {
      const t = tMatch[1].trim();
      const decodedTitle = t.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      if (decodedTitle.length > 60) errors.push(`${rel}: <title> > 60 chars (${decodedTitle.length}): "${decodedTitle}"`);
      if (titles.has(t)) errors.push(`${rel}: Duplicate <title> with ${titles.get(t)}: "${t}"`);
      else titles.set(t, rel);
    }

    const dMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
    if (!dMatch) errors.push(`${rel}: Missing meta description`);
    else {
      const d = dMatch[1].trim();
      // Unescape basic entities for character count check
      const decoded = d.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      if (decoded.length > 160) errors.push(`${rel}: Meta description > 160 chars (${decoded.length}): "${decoded}"`);
      if (descs.has(d)) errors.push(`${rel}: Duplicate meta description with ${descs.get(d)}`);
      else descs.set(d, rel);
    }

    const cMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
    if (!cMatch) errors.push(`${rel}: Missing canonical URL`);
    else {
      const expected = rel === 'index.html'
        ? 'https://agentdomains.co/'
        : 'https://agentdomains.co/' + rel.replace(/\/index\.html$/, '');
      if (cMatch[1] !== expected) errors.push(`${rel}: Canonical mismatch: got ${cMatch[1]}, expected ${expected}`);
    }

    for (const tag of ['og:title', 'og:description', 'og:url', 'og:image', 'twitter:card', 'twitter:title', 'twitter:description']) {
      if (!new RegExp(`(?:property|name)="${tag}"`, 'i').test(html)) {
        errors.push(`${rel}: Missing ${tag}`);
      }
    }
  }

  // 3. Validate inline JS syntax
  const scriptRegex = /<script(?![^>]*src=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/gi;
  while ((m = scriptRegex.exec(html)) !== null) {
    const src = m[1].trim();
    if (!src) continue;
    inlineScriptCount++;
    try {
      new vm.Script(src, { filename: rel });
    } catch (e) {
      errors.push(`${rel}: Inline JS syntax error: ${e.message}`);
    }
  }
}

// 4. Validate external JS files in public/assets & public/js
const jsFiles = [
  ...walk(path.join(PUBLIC_DIR, 'assets'), '.js'),
  ...walk(path.join(PUBLIC_DIR, 'js'), '.js'),
];
for (const jf of jsFiles) {
  const src = fs.readFileSync(jf, 'utf8');
  try {
    new vm.Script(src, { filename: path.relative(ROOT, jf) });
  } catch (e) {
    errors.push(`${path.relative(ROOT, jf)}: External JS syntax error: ${e.message}`);
  }
}

// 5. Validate sitemap.xml index + all 8 segmented sitemaps and disk mapping
const indexPath = path.join(PUBLIC_DIR, 'sitemap.xml');
const indexXml = fs.readFileSync(indexPath, 'utf8');
if (!indexXml.includes('<sitemapindex') || !indexXml.includes('</sitemapindex>')) {
  errors.push('public/sitemap.xml is not a valid <sitemapindex>');
}
const childSitemaps = [...indexXml.matchAll(/<loc>(https:\/\/agentdomains\.co\/(sitemap-[a-z-]+\.xml))<\/loc>/g)].map((m) => m[2]);
if (childSitemaps.length !== 8) {
  errors.push(`Expected 8 segmented sitemaps in sitemap.xml, found ${childSitemaps.length}`);
}

const sitemapUrls = new Set();
for (const sm of childSitemaps) {
  const smPath = path.join(PUBLIC_DIR, sm);
  if (!fs.existsSync(smPath)) {
    errors.push(`Missing referenced sitemap: ${sm}`);
    continue;
  }
  const xml = fs.readFileSync(smPath, 'utf8');
  if (!xml.includes('<urlset') || !xml.includes('</urlset>')) {
    errors.push(`${sm}: Invalid <urlset>`);
  }
  const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  const lastmods = [...xml.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map((m) => m[1]);
  if (locs.length === 0) errors.push(`${sm}: Contains 0 URLs`);
  if (lastmods.some((d) => d !== '2026-11-26')) errors.push(`${sm}: Found lastmod != 2026-11-26`);
  for (const loc of locs) {
    if (!loc.startsWith('https://agentdomains.co/')) errors.push(`${sm}: Invalid host in ${loc}`);
    if (sitemapUrls.has(loc)) errors.push(`${sm}: Duplicate sitemap URL ${loc}`);
    sitemapUrls.add(loc);
    const p = loc.replace('https://agentdomains.co', '');
    const diskPath = p === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, p.replace(/^\/+/, ''), 'index.html');
    if (!fs.existsSync(diskPath)) {
      errors.push(`${sm}: URL ${loc} does not map to ${diskPath}`);
    }
  }
}

console.log('=== AgentDomains SEO Validation Report ===');
console.log('HTML files scanned:', htmlFiles.length);
console.log('Cluster counts:', clusterCounts);
console.log('Unique indexable titles:', titles.size);
console.log('Unique indexable descriptions (<=160c):', descs.size);
console.log('JSON-LD blocks parsed:', jsonLdCount);
console.log('Inline <script> blocks syntax-checked:', inlineScriptCount);
console.log('External JS files syntax-checked:', jsFiles.length);
console.log('Segmented sitemaps verified:', childSitemaps.length, '(', sitemapUrls.size, 'total URLs )');

if (warnings.length) {
  console.log('\nWarnings:');
  warnings.forEach((w) => console.log('  WARN:', w));
}
if (errors.length) {
  console.error('\nERRORS FOUND (' + errors.length + '):');
  errors.forEach((e) => console.error('  ERR:', e));
  process.exit(1);
}
console.log('\nALL VALIDATION CHECKS PASSED WITH 0 ERRORS.');
