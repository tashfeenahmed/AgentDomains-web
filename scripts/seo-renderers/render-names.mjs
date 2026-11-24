import {
  SITE,
  esc,
  renderPage,
  breadcrumbSchema,
  faqSchema,
  renderFaqs,
} from '../seo-lib/layout.mjs';
import { renderSpecStrip, renderFilterPills } from '../seo-lib/visuals.mjs';
import { NAME_CATEGORIES } from '../seo-data/names-categories.mjs';

function inferBucket(cat) {
  const s = (cat.slug + ' ' + cat.name).toLowerCase();
  if (/agent|mcp|llm|ml|rag|eval|chat|voice|ai|prompt|embed/.test(s)) return 'AI & Agents';
  if (/webhook|api|cli|dev|stage|staging|oss|open-source|ci|data|pipe|ext|mobile|iot|db|infra|auth|cron/.test(s)) return 'Dev & Infra';
  return 'Apps & Demos';
}

function renderClaimFlowSvg(sampleLabel, titleText) {
  const lbl = String(sampleLabel ?? '');
  return `<div class="diagram-box">
  <svg viewBox="0 0 880 156" width="880" height="156" role="img" aria-label="3-step live subdomain claim flow for ${esc(titleText)}">
    <defs>
      <marker id="arr-nm" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#00CC74" stroke="#0A0A0A" stroke-width="1"/>
      </marker>
    </defs>

    <!-- Step 1 -->
    <rect x="16" y="24" width="246" height="106" rx="14" fill="#0A0A0A"/>
    <rect x="10" y="18" width="246" height="106" rx="14" fill="#EFFCF5" stroke="#0A0A0A" stroke-width="2.5"/>
    <rect x="24" y="30" width="64" height="20" rx="5" fill="#C6F24E" stroke="#0A0A0A" stroke-width="1.8"/>
    <text x="56" y="44" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#0A0A0A">STEP 01</text>
    <text x="24" y="76" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="16" fill="#0A0A0A">Check Live API</text>
    <text x="24" y="100" font-family="Space Mono,monospace" font-size="10.5" fill="#00A85E">GET /v1/available?label=${esc(lbl)}</text>

    <line x1="260" y1="71" x2="312" y2="71" stroke="#0A0A0A" stroke-width="3" marker-end="url(#arr-nm)"/>

    <!-- Step 2 -->
    <rect x="322" y="24" width="246" height="106" rx="14" fill="#00CC74"/>
    <rect x="316" y="18" width="246" height="106" rx="14" fill="#C6F24E" stroke="#0A0A0A" stroke-width="2.5"/>
    <rect x="330" y="30" width="64" height="20" rx="5" fill="#0A0A0A"/>
    <text x="362" y="44" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#C6F24E">STEP 02</text>
    <text x="330" y="76" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="16" fill="#0A0A0A">Claim in 1 Command</text>
    <text x="330" y="100" font-family="Space Mono,monospace" font-size="10.5" fill="#0A0A0A">agentdomains claim ${esc(lbl)}</text>

    <line x1="566" y1="71" x2="618" y2="71" stroke="#0A0A0A" stroke-width="3" marker-end="url(#arr-nm)"/>

    <!-- Step 3 -->
    <rect x="628" y="24" width="242" height="106" rx="14" fill="#0A0A0A"/>
    <rect x="622" y="18" width="242" height="106" rx="14" fill="#FFFFFF" stroke="#0A0A0A" stroke-width="2.5"/>
    <rect x="636" y="30" width="64" height="20" rx="5" fill="#00CC74" stroke="#0A0A0A" stroke-width="1.8"/>
    <text x="668" y="44" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#0A0A0A">STEP 03</text>
    <text x="636" y="76" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="16" fill="#0A0A0A">Live Edge HTTPS</text>
    <text x="636" y="100" font-family="Space Mono,monospace" font-size="10.5" fill="#00A85E">https://${esc(lbl)}.makes.fyi</text>
  </svg>
  <p class="diagram-caption">Click any card below to query api.agentdomains.co live and copy the exact claim command.</p>
</div>`;
}

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
      a: 'Every click queries GET https://api.agentdomains.co/v1/available from your browser in real time.',
    },
    {
      q: 'Can the same label exist on both makes.fyi and agentdomains.co?',
      a: 'Yes. Both suffixes are separate namespaces. If my-bot.makes.fyi is taken, my-bot.agentdomains.co can still be free.',
    },
    {
      q: 'How many names can I claim on one account?',
      a: 'Claim up to 10 names on the 30-day card-free trial. Upgrade to Pro ($10/yr) for up to 100 names.',
    },
  ];

  const totalLabels = NAME_CATEGORIES.reduce((sum, c) => sum + c.labels.length, 0);

  const hubHtml = `
    <span class="eyebrow">Cluster 06 · 45 Live Subdomain Availability Hubs</span>
    <h1>Live <span class="g">Subdomain Ideas</span> &amp; Availability</h1>
    <p class="lede">Browse ${totalLabels}+ short labels across 45 categories. Check live status on <code>makes.fyi</code> and <code>agentdomains.co</code> and copy the claim command.</p>
    ${renderSpecStrip([
      { icon: 'globe', label: 'Curated Labels', value: `${totalLabels}+ Names`, tone: 'green' },
      { icon: 'layers', label: 'Categories', value: `${NAME_CATEGORIES.length} Hubs` },
      { icon: 'bolt', label: 'Status API', value: 'Live Real-Time', tone: 'lime' },
      { icon: 'card', label: 'Trial Cost', value: '$0 / 30 Days' },
    ])}
    ${renderClaimFlowSvg('agent-ops', 'Live Subdomain Ideas')}
    <div class="hub-search">
      <input type="text" placeholder="Filter 45 categories (e.g. mcp, webhooks, chatbots, voice, stripe, rag)…" data-filter-input="names-cat-grid" aria-label="Filter subdomain categories">
      <span class="pill" id="names-cat-grid-count">${NAME_CATEGORIES.length} shown</span>
    </div>
    ${renderFilterPills('names-cat-grid', ['AI & Agents', 'Dev & Infra', 'Apps & Demos'])}
    <div class="grid" id="names-cat-grid">
      ${NAME_CATEGORIES.map((cat) => {
        const bucket = inferBucket(cat);
        return `<a class="card" href="/names/${esc(cat.slug)}" data-cat="${esc(bucket.toLowerCase())}" data-search="${esc((cat.name + ' ' + cat.slug + ' ' + cat.tagline + ' ' + cat.labels.join(' ')).toLowerCase())}">
        <div class="card-top">
          <span class="kicker">${esc(bucket)}</span>
          <span class="badge free">${cat.labels.length} Live</span>
        </div>
        <h3>${esc(cat.name)}</h3>
        <p>${esc(cat.tagline)}</p>
      </a>`;
      }).join('\n      ')}
    </div>
    ${renderFaqs(hubFaqs)}
  `;

  pages.push({
    path: hubPath,
    priority: '0.9',
    html: renderPage({
      path: hubPath,
      title: 'Live Subdomain Ideas & Availability Checker — makes.fyi & agentdomains.co',
      description: 'Browse 45 developer and AI subdomain categories with live api.agentdomains.co availability checks and 1-click claim commands.',
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
        a: 'Click COPY CLAIM on any free card and run it in your terminal. Or ask your MCP agent to call claim_domain.',
      },
      {
        q: `Can I point a ${cat.name} subdomain at my VPS, Fly.io, or Railway app?`,
        a: 'Yes. Every subdomain supports A, AAAA, CNAME, TXT, NS delegation, URL forwarding, and edge HTTPS proxying.',
      },
      {
        q: 'What happens after the 30-day free trial?',
        a: 'We email a reminder on day 25. Upgrade to Pro ($10/yr or $1/mo) to keep up to 100 names permanently.',
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
      ${renderSpecStrip([
        { icon: 'globe', label: 'Curated Ideas', value: `${cat.labels.length} Labels`, tone: 'green' },
        { icon: 'bolt', label: 'Live API', value: 'Real-Time Check' },
        { icon: 'tag', label: 'Namespaces', value: '.makes.fyi / .co', tone: 'lime' },
        { icon: 'card', label: 'Trial Cost', value: '$0 / 30 Days' },
      ])}

      ${renderClaimFlowSvg(cat.labels[0], cat.name)}

      <div class="widget" data-names-hub>
        <div class="widget-head">
          <strong>Live Registry Search (<code>api.agentdomains.co/v1/available</code>)</strong>
          <button type="button" class="btn sm" data-names-check-all>Check All ${cat.labels.length} Names Live</button>
        </div>

        <div class="live-summary" aria-live="polite">
          <div class="live-stat avail"><span class="lbl">Available</span><span class="val" data-stat-avail>0</span></div>
          <div class="live-stat taken"><span class="lbl">Taken</span><span class="val" data-stat-taken>0</span></div>
          <div class="live-stat"><span class="lbl">Unchecked</span><span class="val" data-stat-pending>${cat.labels.length}</span></div>
          <div class="live-stat"><span class="lbl">Active Suffix</span><span class="val" data-stat-suffix>.makes.fyi</span></div>
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
        <strong>Claim right in your browser:</strong> Visit the <a href="/">homepage checker</a> or connect your editor with our <a href="/mcp">MCP setup guides</a>.
      </div>

      ${renderFaqs(faqs)}

      <h2>Explore More <span class="g">Subdomain Categories</span></h2>
      <div class="grid four">
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
        description: `Check live availability for ${cat.labels.length}+ short ${cat.name} subdomains on makes.fyi and agentdomains.co. Copy claim commands fast.`,
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
