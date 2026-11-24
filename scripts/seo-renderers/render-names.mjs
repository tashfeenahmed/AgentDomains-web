import {
  SITE,
  esc,
  renderPage,
  breadcrumbSchema,
  faqSchema,
  renderFaqs,
} from '../seo-lib/layout.mjs';
import { NAME_CATEGORIES } from '../seo-data/names-categories.mjs';

export function buildNamesPages() {
  const pages = [];

  // Hub: /names
  const hubPath = '/names';
  const hubUrl = `${SITE}${hubPath}`;
  const hubBreadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Live Subdomain Ideas', url: hubPath },
  ];
  const hubFaqs = [
    {
      q: 'How live are the availability checks on these pages?',
      a: 'Every check calls GET https://api.agentdomains.co/v1/available in real time straight from your browser, showing whether each short label is currently free under makes.fyi or agentdomains.co.',
    },
    {
      q: 'Can the same label exist under both makes.fyi and agentdomains.co?',
      a: 'Yes! makes.fyi and agentdomains.co are separate namespaces, so if my-bot.makes.fyi is taken, my-bot.agentdomains.co might still be available.',
    },
    {
      q: 'How many names can I claim on one account?',
      a: 'Up to 10 names on the 30-day card-free trial, and up to 100 names on Pro ($10/year or $1/month).',
    },
  ];

  const hubHtml = `
    <span class="eyebrow">Cluster 06 · 45 Live Subdomain Availability Hubs</span>
    <h1>Live <span class="g">Subdomain Ideas</span> &amp; Availability</h1>
    <p class="lede">Browse 900+ short, curated labels across 45 developer and AI categories. Check live availability under <code>*.makes.fyi</code> and <code>*.agentdomains.co</code> and copy the exact claim command in one click.</p>
    <div class="hub-search">
      <input type="text" placeholder="Filter 45 categories (e.g. mcp, webhooks, chatbots, voice, stripe, rag)…" data-filter-input="names-cat-grid" aria-label="Filter subdomain categories">
      <span class="pill" id="names-cat-grid-count">${NAME_CATEGORIES.length} shown</span>
    </div>
    <div class="grid" id="names-cat-grid">
      ${NAME_CATEGORIES.map(
        (cat) => `<a class="card" href="/names/${esc(cat.slug)}" data-search="${esc((cat.name + ' ' + cat.slug + ' ' + cat.tagline + ' ' + cat.labels.join(' ')).toLowerCase())}">
        <span class="kicker">${cat.labels.length} Live Labels</span>
        <h3>${esc(cat.name)}</h3>
        <p>${esc(cat.tagline)}</p>
      </a>`
      ).join('\n      ')}
    </div>
    ${renderFaqs(hubFaqs)}
  `;

  pages.push({
    path: hubPath,
    priority: '0.9',
    html: renderPage({
      path: hubPath,
      title: 'Live Subdomain Ideas & Availability Checker — makes.fyi & agentdomains.co',
      description: 'Browse 45 curated developer and AI subdomain categories with live api.agentdomains.co availability checks and 1-click claim commands.',
      activeNav: 'names',
      breadcrumbs: hubBreadcrumbs,
      ogType: 'website',
      jsonLdGraph: [
        breadcrumbSchema(hubBreadcrumbs, hubUrl),
        {
          '@type': 'CollectionPage',
          '@id': `${hubUrl}#page`,
          url: hubUrl,
          name: 'Live Subdomain Availability Hubs',
          isPartOf: { '@id': `${SITE}/#website` },
        },
        faqSchema(hubFaqs, hubUrl),
      ],
      bodyHtml: hubHtml,
    }),
  });

  // 45 category pages
  NAME_CATEGORIES.forEach((cat, idx) => {
    const pagePath = `/names/${cat.slug}`;
    const pageUrl = `${SITE}${pagePath}`;
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Live Subdomain Ideas', url: '/names' },
      { name: cat.name, url: pagePath },
    ];

    const faqs = [
      {
        q: `How do I claim one of these ${cat.name} subdomains?`,
        a: `Click "Copy claim" on any available card and paste the command into your terminal (after running agentdomains signup), or ask your MCP-connected agent to call claim_domain for that label.`,
      },
      {
        q: `Can I point a ${cat.name} subdomain at my own VPS, Fly.io, or Railway app?`,
        a: `Yes. Every claimed makes.fyi or agentdomains.co subdomain supports A, AAAA, CNAME, TXT, NS delegation, URL forwarding, and automatic HTTPS reverse proxying.`,
      },
      {
        q: `What happens after the 30-day free trial?`,
        a: `On day 25 we email a reminder. Upgrade to Pro ($10/year or $1/month) to keep up to 100 names permanently with daily visitor stats and zero inactivity expiry.`,
      },
    ];

    const related = NAME_CATEGORIES.slice(idx + 1, idx + 5)
      .concat(NAME_CATEGORIES.slice(0, Math.max(0, 4 - (NAME_CATEGORIES.length - 1 - idx))))
      .filter((x) => x.slug !== cat.slug)
      .slice(0, 4);

    const bodyHtml = `
      <span class="eyebrow">Live Availability Hub · ${cat.labels.length} Curated Labels</span>
      <h1>Best Subdomain Names for <span class="g">${esc(cat.name)}</span></h1>
      <p class="lede">${esc(cat.tagline)}</p>

      <div class="widget" data-names-hub>
        <div class="widget-head">
          <strong>Live Registry Search (<code>api.agentdomains.co/v1/available</code>)</strong>
          <button type="button" class="btn sm" data-names-check-all>Check All ${cat.labels.length} Names Live</button>
        </div>
        <div class="widget-grid">
          <div class="field">
            <label for="names-domain">Domain Namespace</label>
            <select id="names-domain" data-names-domain>
              <option value="makes.fyi">.makes.fyi (default)</option>
              <option value="agentdomains.co">.agentdomains.co</option>
            </select>
          </div>
          <div class="field">
            <label for="names-custom">Check Your Own Custom Label</label>
            <input id="names-custom" type="text" data-names-custom placeholder="e.g. my-${esc(cat.slug.split('-')[0])}">
          </div>
          <div class="field" style="display:flex;align-items:flex-end">
            <button type="button" class="btn sm dark" style="width:100%;justify-content:center" data-names-custom-btn>Check Custom Label →</button>
          </div>
        </div>
        <div class="status-line" data-names-custom-out></div>

        <div class="name-grid">
          ${cat.labels
            .map(
              (lbl) => `<div class="name-card" data-label="${esc(lbl)}">
            <div class="name-fqdn">${esc(lbl)}.makes.fyi</div>
            <div class="name-meta">
              <span class="badge checking">click check</span>
              <div style="display:flex;gap:.35rem">
                <button type="button" class="copy-btn" style="background:#fff" data-check-one>CHECK</button>
                <button type="button" class="copy-btn" data-copy="agentdomains claim ${esc(lbl)} --email you@example.com">COPY CLAIM</button>
              </div>
            </div>
          </div>`
            )
            .join('\n          ')}
        </div>
      </div>

      <div class="panel accent">
        <strong>Zero-install browser claim:</strong> Want to claim any available name right from your browser without installing the CLI? Head to the <a href="/">homepage instant checker</a> or connect your AI editor via our <a href="/mcp">MCP setup guides</a>.
      </div>

      ${renderFaqs(faqs)}

      <h2>Explore More <span class="g">Subdomain Categories</span></h2>
      <div class="grid">
        ${related
          .map(
            (r) => `<a class="card" href="/names/${esc(r.slug)}">
          <span class="kicker">${r.labels.length} Live Labels</span>
          <h3>${esc(r.name)}</h3>
          <p>${esc(r.tagline)}</p>
        </a>`
          )
          .join('\n        ')}
      </div>
    `;

    pages.push({
      path: pagePath,
      priority: '0.7',
      html: renderPage({
        path: pagePath,
        title: `${cat.name} Subdomain Ideas & Live Availability — makes.fyi & agentdomains.co`,
        description: `Check live availability for ${cat.labels.length}+ short ${cat.name} subdomains under makes.fyi and agentdomains.co. Copy claim commands in 1 click.`,
        activeNav: 'names',
        breadcrumbs,
        jsonLdGraph: [
          breadcrumbSchema(breadcrumbs, pageUrl),
          {
            '@type': 'WebApplication',
            '@id': `${pageUrl}#webapp`,
            name: `${cat.name} Subdomain Availability Checker`,
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any (Browser)',
            url: pageUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
          faqSchema(faqs, pageUrl),
        ],
        bodyHtml,
      }),
    });
  });

  return pages;
}
