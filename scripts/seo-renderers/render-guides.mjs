import {
  SITE,
  esc,
  renderPage,
  breadcrumbSchema,
  faqSchema,
  codeBox,
  renderFaqs,
} from '../seo-lib/layout.mjs';
import { HOST_GUIDES } from '../seo-data/guides.mjs';

export function buildGuidePages() {
  const pages = [];

  // Hub: /guides
  const hubPath = '/guides';
  const hubUrl = `${SITE}${hubPath}`;
  const hubBreadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Host Integration Playbooks', url: hubPath },
  ];
  const hubFaqs = [
    {
      q: 'Should I use agentdomains proxy or an A record?',
      a: 'Use agentdomains proxy whenever your host gives you a public hostname (Fly.io, Railway, Render, Cloud Run, Tailscale Funnel). Use an A record + Caddy/Certbot whenever you have a bare server IPv4 address (Hetzner VPS, DigitalOcean Droplet, EC2, Raspberry Pi).',
    },
    {
      q: 'Does AgentDomains host my application code or containers?',
      a: 'No. AgentDomains hosts nothing — it gives your agent a real hostname under agentdomains.co or makes.fyi with writable DNS, forwarding, and an edge HTTPS reverse proxy in front of whatever server or PaaS you already run.',
    },
    {
      q: 'Are there bandwidth or request caps on proxied origins?',
      a: 'No request quotas and no bandwidth bills on either the 30-day free trial or the $10/yr Pro plan.',
    },
  ];

  const hubHtml = `
    <span class="eyebrow">Cluster 02 · 45 Origin &amp; Host Playbooks</span>
    <h1>Host &amp; Origin <span class="g">Integration Playbooks</span></h1>
    <p class="lede">Give any VPS, PaaS container, web framework, local LLM, or webhook handler a real HTTPS hostname under <code>makes.fyi</code> or <code>agentdomains.co</code> in three commands.</p>
    <div class="meta-strip">
      <span class="pill green">45 Platforms Covered</span>
      <span class="pill">Interactive CLI Generator</span>
      <span class="pill lime">Live Availability Check</span>
    </div>
    <div class="hub-search">
      <input type="text" placeholder="Filter 45 hosts (e.g. hetzner, fly, railway, fastapi, stripe, ollama)…" data-filter-input="guides-grid" aria-label="Filter host playbooks">
      <span class="pill" id="guides-grid-count">${HOST_GUIDES.length} shown</span>
    </div>
    <div class="grid" id="guides-grid">
      ${HOST_GUIDES.map(
        (g) => `<a class="card" href="/guides/${esc(g.slug)}" data-search="${esc((g.name + ' ' + g.slug + ' ' + g.group + ' ' + g.mode).toLowerCase())}">
        <span class="kicker">${esc(g.group)} · ${g.mode === 'record' ? 'A Record + TLS' : g.mode === 'forward' ? 'HTTPS Forward' : 'Edge HTTPS Proxy'}</span>
        <h3>${esc(g.name)}</h3>
        <p>${esc(g.recommendation)}</p>
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
      title: 'AgentDomains Integration Playbooks: 45 VPS, PaaS, Framework & Webhook Guides',
      description: 'Point makes.fyi and agentdomains.co hostnames at Hetzner, Fly.io, Railway, Render, FastAPI, Next.js, Ollama, Caddy, Stripe webhooks, and 36 more hosts.',
      activeNav: 'guides',
      breadcrumbs: hubBreadcrumbs,
      ogType: 'website',
      jsonLdGraph: [
        breadcrumbSchema(hubBreadcrumbs, hubUrl),
        {
          '@type': 'CollectionPage',
          '@id': `${hubUrl}#page`,
          url: hubUrl,
          name: 'AgentDomains Host Integration Playbooks',
          isPartOf: { '@id': `${SITE}/#website` },
        },
        faqSchema(hubFaqs, hubUrl),
      ],
      bodyHtml: hubHtml,
    }),
  });

  // 45 platform pages
  HOST_GUIDES.forEach((g, idx) => {
    const pagePath = `/guides/${g.slug}`;
    const pageUrl = `${SITE}${pagePath}`;
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Host Playbooks', url: '/guides' },
      { name: g.name, url: pagePath },
    ];
    const modeLabel =
      g.mode === 'record'
        ? 'A Record + ACME / Caddy TLS'
        : g.mode === 'forward'
          ? 'Edge HTTPS Redirect (302/301)'
          : 'Edge HTTPS Reverse Proxy';

    const step3 =
      g.mode === 'record'
        ? `agentdomains record ${g.defaultLabel} --type A --content ${g.defaultOrigin}`
        : g.mode === 'forward'
          ? `agentdomains forward ${g.defaultLabel} https://${g.defaultOrigin}`
          : `agentdomains proxy ${g.defaultLabel} ${g.defaultOrigin}`;

    const cli3 = [
      'agentdomains signup',
      `agentdomains claim ${g.defaultLabel} --email you@example.com`,
      step3,
    ].join('\n');

    const related = HOST_GUIDES.filter((other) => other.slug !== g.slug && other.group === g.group)
      .concat(HOST_GUIDES.slice((idx + 1) % HOST_GUIDES.length, (idx + 5) % HOST_GUIDES.length))
      .filter((v, i, a) => v.slug !== g.slug && a.findIndex((x) => x.slug === v.slug) === i)
      .slice(0, 4);

    const faqs = [
      {
        q: `Should I use edge proxy or an A record for ${g.name}?`,
        a: g.recommendation,
      },
      {
        q: `How do I verify DNS propagation for ${g.name}?`,
        a: `After running the CLI commands above, open our free /tools/dns-ssl-checker or run dig @1.1.1.1 ${g.defaultLabel}.makes.fyi to confirm Cloudflare and Google resolvers return your new record.`,
      },
      {
        q: `Can an AI agent set up ${g.name} routing automatically via MCP?`,
        a: `Yes. Connect Claude Code, Cursor, or any MCP client to https://mcp.agentdomains.co and ask it to run claim_domain followed by ${g.mode === 'record' ? 'add_dns_record' : g.mode === 'forward' ? 'set_forward' : 'set_proxy'}.`,
      },
    ];

    const bodyHtml = `
      <span class="eyebrow">${esc(g.group)} · Integration Playbook</span>
      <h1>Custom HTTPS Domain for <span class="g">${esc(g.name)}</span></h1>
      <p class="lede">${esc(g.recommendation)}</p>
      <div class="meta-strip">
        <span class="pill green">Recommended: ${esc(modeLabel)}</span>
        <span class="pill">30-Day Free Trial (10 Names)</span>
        <span class="pill lime">No Card Required</span>
      </div>

      <h2>1. Recommended Architecture: <span class="g">Proxy vs A-Record + ACME</span></h2>
      <div class="panel accent">
        <p style="margin:0"><strong>${esc(g.name)} verdict:</strong> ${esc(g.recommendation)}</p>
      </div>
      ${codeBox(`${g.name} — 3-command AgentDomains setup`, cli3)}

      <h2>2. Interactive: <span class="g">Generate My CLI Command</span></h2>
      <div class="widget" data-cli-gen data-mode="${esc(g.mode)}">
        <div class="widget-head">
          <strong>Live CLI Generator &amp; Availability Checker</strong>
          <button type="button" class="btn sm" data-check-btn>Check Availability Live</button>
        </div>
        <div class="widget-grid">
          <div class="field">
            <label for="gen-label">Subdomain Label</label>
            <input id="gen-label" type="text" data-field="label" value="${esc(g.defaultLabel)}">
          </div>
          <div class="field">
            <label for="gen-domain">Domain Suffix</label>
            <select id="gen-domain" data-field="domain">
              <option value="makes.fyi">.makes.fyi (default)</option>
              <option value="agentdomains.co">.agentdomains.co</option>
            </select>
          </div>
          <div class="field">
            <label for="gen-origin">${g.mode === 'record' ? 'Server IPv4 Address' : 'Origin Hostname'}</label>
            <input id="gen-origin" type="text" data-field="origin" value="${esc(g.defaultOrigin)}" placeholder="${esc(g.originHint)}">
          </div>
          <div class="field">
            <label for="gen-email">Confirm Email (first claim)</label>
            <input id="gen-email" type="text" data-field="email" value="you@example.com">
          </div>
        </div>
        <div class="status-line status-dim" data-avail-status>Click "Check Availability Live" to query api.agentdomains.co/v1/available.</div>
        <div class="code-box" style="margin:.6rem 0 0">
          <div class="code-head">
            <span>Generated shell commands for ${esc(g.name)}</span>
            <button type="button" class="copy-btn" data-target="gen-cli-out">COPY COMMANDS</button>
          </div>
          <pre id="gen-cli-out" data-cli-out></pre>
        </div>
      </div>

      <h2>3. ${esc(g.name)} <span class="g">Origin Configuration</span></h2>
      ${codeBox(`${g.name} server / platform config`, g.serverSnippet)}
      <div class="panel warn">
        <h3>Operational Checklist</h3>
        <ul>
          ${g.notes.map((n) => `<li>${esc(n)}</li>`).join('\n          ')}
        </ul>
      </div>

      <div class="btn-row">
        <a class="btn" href="/tools/dns-ssl-checker">Debug DNS &amp; ACME Live →</a>
        <a class="btn ghost" href="/mcp">Connect via MCP Instead</a>
      </div>

      ${renderFaqs(faqs)}

      <h2>Related <span class="g">Host Playbooks</span></h2>
      <div class="grid">
        ${related
          .map(
            (r) => `<a class="card" href="/guides/${esc(r.slug)}">
          <span class="kicker">${esc(r.group)}</span>
          <h3>${esc(r.name)}</h3>
          <p>${esc(r.recommendation)}</p>
        </a>`
          )
          .join('\n        ')}
      </div>
    `;

    pages.push({
      path: pagePath,
      priority: '0.8',
      html: renderPage({
        path: pagePath,
        title: `Custom HTTPS Domain for ${g.name} — AgentDomains Playbook`,
        description: `Give your ${g.name} deployment a live makes.fyi or agentdomains.co HTTPS domain in 3 CLI commands. Includes ${modeLabel} config and live availability check.`,
        activeNav: 'guides',
        breadcrumbs,
        jsonLdGraph: [
          breadcrumbSchema(breadcrumbs, pageUrl),
          {
            '@type': 'TechArticle',
            '@id': `${pageUrl}#article`,
            headline: `Custom HTTPS Domain for ${g.name}`,
            description: g.recommendation,
            url: pageUrl,
            author: { '@id': `${SITE}/#organization` },
            publisher: { '@id': `${SITE}/#organization` },
          },
          {
            '@type': 'HowTo',
            '@id': `${pageUrl}#howto`,
            name: `Point an AgentDomains hostname at ${g.name}`,
            step: [
              { '@type': 'HowToStep', name: 'Create account', text: 'Run agentdomains signup to get an instant API key with no card.' },
              { '@type': 'HowToStep', name: 'Claim subdomain', text: `Run agentdomains claim ${g.defaultLabel} --email you@example.com.` },
              { '@type': 'HowToStep', name: `Connect ${g.name}`, text: `Run ${step3}.` },
            ],
          },
          faqSchema(faqs, pageUrl),
        ],
        bodyHtml,
      }),
    });
  });

  return pages;
}
