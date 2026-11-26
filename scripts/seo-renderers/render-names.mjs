import {
  SITE,
  esc,
  fitTitle,
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
    <rect x="24" y="30" width="64" height="20" rx="5" fill="#00CC74" stroke="#0A0A0A" stroke-width="1.8"/>
    <text x="56" y="44" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#0A0A0A">STEP 01</text>
    <text x="24" y="76" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="16" fill="#0A0A0A">Check Live API</text>
    <text x="24" y="100" font-family="Space Mono,monospace" font-size="10.5" fill="#00A85E">GET /v1/available?label=${esc(lbl)}</text>

    <line x1="260" y1="71" x2="312" y2="71" stroke="#0A0A0A" stroke-width="3" marker-end="url(#arr-nm)"/>

    <!-- Step 2 -->
    <rect x="322" y="24" width="246" height="106" rx="14" fill="#0A0A0A"/>
    <rect x="316" y="18" width="246" height="106" rx="14" fill="#00CC74" stroke="#0A0A0A" stroke-width="2.5"/>
    <rect x="330" y="30" width="64" height="20" rx="5" fill="#0A0A0A"/>
    <text x="362" y="44" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#00CC74">STEP 02</text>
    <text x="330" y="76" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="16" fill="#0A0A0A">Claim in 1 Command</text>
    <text x="330" y="100" font-family="Space Mono,monospace" font-size="10" fill="#0A0A0A">agentdomains claim ${esc(lbl)}</text>

    <line x1="566" y1="71" x2="618" y2="71" stroke="#0A0A0A" stroke-width="3" marker-end="url(#arr-nm)"/>

    <!-- Step 3 -->
    <rect x="628" y="24" width="242" height="106" rx="14" fill="#0A0A0A"/>
    <rect x="622" y="18" width="242" height="106" rx="14" fill="#FFFFFF" stroke="#0A0A0A" stroke-width="2.5"/>
    <rect x="636" y="30" width="64" height="20" rx="5" fill="#00CC74" stroke="#0A0A0A" stroke-width="1.8"/>
    <text x="668" y="44" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#0A0A0A">STEP 03</text>
    <text x="636" y="76" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="16" fill="#0A0A0A">Live Edge HTTPS</text>
    <text x="636" y="100" font-family="Space Mono,monospace" font-size="9.5" fill="#00A85E">https://${esc(lbl)}.agentdomains.co</text>
  </svg>
  <p class="diagram-caption">Click any card below to check live availability and claim it in your browser or CLI.</p>
</div>`;
}

function renderNicheRoutingGuide(cat) {
  const bucket = inferBucket(cat);
  const [l0, l1, l2] = cat.labels;
  const bucketConfig =
    bucket === 'AI & Agents'
      ? {
          originA: `${l0}.fly.dev`,
          guideHref: '/guides/fly-io',
          guideLabel: 'Fly.io HTTPS Proxy Playbook',
          useCaseHref: '/use-cases/ai-agent-deployments',
          useCaseLabel: 'Autonomous AI Agent Blueprint',
          rule1: `Keep ${cat.name} hostnames short and clear so MCP clients, webhook senders, and humans read them fast.`,
          rule2: `Use \`agentdomains proxy\` for PaaS origins like \`${l0}.fly.dev\`. Edge TLS terminates on port 443 with no certificate setup.`,
          rule3: `Pair \`${l1}.agentdomains.co\` for production traffic with \`${l2}.agentdomains.co\` for isolated prompt or tool tests.`,
        }
      : bucket === 'Dev & Infra'
        ? {
            originA: '203.0.113.10',
            guideHref: '/guides/hetzner-vps',
            guideLabel: 'Hetzner VPS + ACME DNS-01 Playbook',
            useCaseHref: '/use-cases/stripe-webhook-testing',
            useCaseLabel: 'Webhook & API Routing Blueprint',
            rule1: `Use predictable ${cat.name} names like \`${l0}.agentdomains.co\` in CI pipelines, webhook dashboards, and OAuth allowlists.`,
            rule2: `Point an \`A\` record at a bare VPS IPv4 address, or use \`agentdomains proxy\` when your service runs on Railway, Render, or Fly.io.`,
            rule3: `Publish \`_acme-challenge\` TXT tokens with \`agentdomains txt\` when your firewall blocks port 80.`,
          }
        : {
            originA: `${l0}.up.railway.app`,
            guideHref: '/guides/railway',
            guideLabel: 'Railway Edge Proxy Playbook',
            useCaseHref: '/use-cases/vibe-coding-demos',
            useCaseLabel: 'Live Demo Shipping Blueprint',
            rule1: `Pick a short ${cat.name} label like \`${l0}.agentdomains.co\` so visitors can type it from slides, chat links, or QR codes.`,
            rule2: `Start with \`agentdomains forward\` while your preview URL moves between hosts. Switch to \`agentdomains proxy\` to keep your hostname in the address bar.`,
            rule3: `Claim up to 10 ${cat.name} names free for 30 days with no card. Move active builds to Pro ($10/year for 100 names).`,
          };

  const cmdSample =
    bucket === 'Dev & Infra'
      ? `agentdomains claim ${l0} --email you@example.com --domain agentdomains.co --type A --content ${bucketConfig.originA}`
      : `agentdomains claim ${l0} --email you@example.com --domain agentdomains.co && agentdomains proxy ${l0} ${bucketConfig.originA} --domain agentdomains.co`;

  return `<section aria-labelledby="routing-guide-heading">
  <h2 id="routing-guide-heading">How to name &amp; route <span class="g">${esc(cat.name)}</span></h2>
  <div class="decision-grid">
    <div class="decision-card recommended">
      <div class="decision-card-head">
        <h3>Recommended Pattern</h3>
        <span class="badge free">${esc(bucket.toUpperCase())}</span>
      </div>
      <ul>
        <li>${bucketConfig.rule1.replace(/`([^`]+)`/g, '<code>$1</code>')}</li>
        <li>${bucketConfig.rule2.replace(/`([^`]+)`/g, '<code>$1</code>')}</li>
        <li>${bucketConfig.rule3.replace(/`([^`]+)`/g, '<code>$1</code>')}</li>
      </ul>
    </div>
    <div class="decision-card">
      <div class="decision-card-head">
        <h3>Quick Launch Command</h3>
        <span class="badge checking">CLI / MCP</span>
      </div>
      <p style="font-size:.9rem;margin:0 0 .65rem">Claim <code>${esc(l0)}.agentdomains.co</code> and attach your origin in one line:</p>
      <div class="code-box" style="margin:0 0 .75rem">
        <div class="code-head">
          <span>${esc(cat.name)} launch</span>
          <button type="button" class="copy-btn">COPY</button>
        </div>
        <pre><code>${esc(cmdSample)}</code></pre>
      </div>
      <p style="font-size:.86rem;margin:0">Next steps: <a href="${bucketConfig.guideHref}">${esc(bucketConfig.guideLabel)}</a> · <a href="${bucketConfig.useCaseHref}">${esc(bucketConfig.useCaseLabel)}</a></p>
    </div>
  </div>
</section>`;
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
    <span class="eyebrow">45 Live Subdomain Availability Hubs</span>
    <h1>Live <span class="g">Subdomain Ideas</span> &amp; Availability</h1>
    <p class="lede">Browse ${totalLabels}+ short labels across 45 categories. Check live status on <code>agentdomains.co</code> and <code>makes.fyi</code> and claim in your browser or CLI.</p>
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
      title: 'Live Subdomain Ideas & Checker — AgentDomains',
      description: 'Browse 45 developer and AI subdomain categories with live availability checks and 1-click browser or CLI claiming.',
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
        a: 'Click CLAIM on any available card to register it in your browser, or click COPY to run the CLI command. Your MCP agent can also call claim_domain.',
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
        { icon: 'tag', label: 'Namespaces', value: '.agentdomains.co / .fyi', tone: 'lime' },
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
          <div class="live-stat"><span class="lbl">Active Suffix</span><span class="val" data-stat-suffix>.agentdomains.co</span></div>
        </div>

        <div class="widget-grid">
          <div class="field">
            <label for="names-domain">Domain Namespace</label>
            <select id="names-domain" data-names-domain>
              <option value="agentdomains.co">.agentdomains.co (default)</option>
              <option value="makes.fyi">.makes.fyi</option>
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
            <div class="name-fqdn">${esc(lbl)}.agentdomains.co</div>
            <div class="name-meta">
              <span class="badge checking">unchecked</span>
              <div class="name-actions">
                <button type="button" class="copy-btn" style="background:#fff" data-check-one>CHECK</button>
                <button type="button" class="copy-btn" data-copy="agentdomains claim ${esc(lbl)} --email you@example.com --domain agentdomains.co">COPY</button>
                <a class="claim-link" data-claim-link href="/?q=${encodeURIComponent(lbl)}&amp;domain=agentdomains.co#domain-input" data-umami-event="claim_from_seo" data-umami-event-location="${esc(pagePath)}">CLAIM →</a>
              </div>
            </div>
          </div>`
            )
            .join('\n          ')}
        </div>
      </div>

      <div class="panel accent">
        <strong>Claim right in your browser:</strong> Click <strong>CLAIM →</strong> on any card above, or connect your editor with our <a href="/mcp">MCP setup guides</a>.
      </div>

      ${renderNicheRoutingGuide(cat)}

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
        title: fitTitle(`${cat.name} Subdomain Ideas — AgentDomains`, `${cat.name} Subdomains | AgentDomains`),
        description: `Check live availability for ${cat.labels.length}+ short ${cat.name} subdomains on agentdomains.co and makes.fyi. Claim in browser or CLI.`,
        activeNav: 'names',
        ctaPrefill: cat.labels[0],
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
