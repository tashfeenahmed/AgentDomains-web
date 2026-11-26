import {
  SITE,
  esc,
  escInline,
  stripTicks,
  fitTitle,
  renderPage,
  breadcrumbSchema,
  faqSchema,
  codeBox,
  renderFaqs,
} from '../seo-lib/layout.mjs';
import { renderSpecStrip, renderFilterPills } from '../seo-lib/visuals.mjs';
import { HOST_GUIDES } from '../seo-data/guides.mjs';

function renderRoutingSvg(g) {
  const fqdn = `${g.defaultLabel}.agentdomains.co`;
  const midTitle =
    g.mode === 'record'
      ? 'Authoritative A Record'
      : g.mode === 'forward'
        ? 'Edge 302 / 301 Forward'
        : 'Edge HTTPS Reverse Proxy';
  const midSub =
    g.mode === 'record'
      ? 'DNS-01 TXT + Caddy / Certbot'
      : g.mode === 'forward'
        ? 'Path Preserved · Auto TLS'
        : 'Automatic Cloudflare Edge TLS';
  const rightTag = g.mode === 'record' ? 'ORIGIN IP' : 'ORIGIN HOST';
  const nameSize = g.name.length > 30 ? 11 : g.name.length > 24 ? 12.5 : g.name.length > 18 ? 14 : 16;
  const origSize = g.defaultOrigin.length > 34 ? 8.5 : g.defaultOrigin.length > 26 ? 9.5 : 11;
  const fqdnSize = fqdn.length > 26 ? 10 : 11;

  return `<div class="diagram-box">
  <svg viewBox="0 0 880 195" width="880" height="195" role="img" aria-label="Origin-to-edge HTTPS routing diagram for ${esc(g.name)}">
    <defs>
      <marker id="arr-guide" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#00CC74" stroke="#0A0A0A" stroke-width="1"/>
      </marker>
    </defs>
    <!-- Node 1: Origin -->
    <rect x="16" y="34" width="244" height="122" rx="14" fill="#0A0A0A"/>
    <rect x="10" y="28" width="244" height="122" rx="14" fill="#FFFFFF" stroke="#0A0A0A" stroke-width="3"/>
    <rect x="24" y="42" width="96" height="22" rx="6" fill="#EFFCF5" stroke="#0A0A0A" stroke-width="2"/>
    <text x="72" y="57" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#0A0A0A">${rightTag}</text>
    <text x="132" y="92" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="${nameSize}" fill="#0A0A0A">${esc(g.name)}</text>
    <text x="132" y="116" text-anchor="middle" font-family="Space Mono,monospace" font-size="${origSize}" fill="#00A85E">${esc(g.defaultOrigin)}</text>
    <text x="132" y="136" text-anchor="middle" font-family="Space Mono,monospace" font-size="10" fill="#525252">Your server or PaaS</text>

    <!-- Arrow 1 -->
    <line x1="258" y1="89" x2="322" y2="89" stroke="#0A0A0A" stroke-width="3" marker-end="url(#arr-guide)"/>
    <rect x="260" y="58" width="60" height="20" rx="5" fill="#C6F24E" stroke="#0A0A0A" stroke-width="1.8"/>
    <text x="290" y="72" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#0A0A0A">${g.mode === 'record' ? 'DNS A' : g.mode === 'forward' ? '302/301' : 'PROXY'}</text>

    <!-- Node 2: AgentDomains Edge -->
    <rect x="336" y="24" width="242" height="136" rx="14" fill="#00CC74"/>
    <rect x="330" y="18" width="242" height="136" rx="14" fill="#C6F24E" stroke="#0A0A0A" stroke-width="3"/>
    <rect x="346" y="32" width="114" height="22" rx="6" fill="#0A0A0A"/>
    <text x="403" y="47" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#C6F24E">AGENTDOMAINS</text>
    <text x="451" y="82" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="16" fill="#0A0A0A">${esc(midTitle)}</text>
    <text x="451" y="106" text-anchor="middle" font-family="Space Mono,monospace" font-size="${fqdnSize}" fill="#0A0A0A">${esc(fqdn)}</text>
    <text x="451" y="130" text-anchor="middle" font-family="Space Mono,monospace" font-size="10" fill="#007A43">${esc(midSub)}</text>

    <!-- Arrow 2 -->
    <line x1="576" y1="89" x2="646" y2="89" stroke="#0A0A0A" stroke-width="3" marker-end="url(#arr-guide)"/>
    <rect x="578" y="58" width="66" height="20" rx="5" fill="#EFFCF5" stroke="#0A0A0A" stroke-width="1.8"/>
    <text x="611" y="72" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#0A0A0A">TLS 1.3</text>

    <!-- Node 3: Visitors / Webhooks -->
    <rect x="660" y="34" width="210" height="122" rx="14" fill="#0A0A0A"/>
    <rect x="654" y="28" width="210" height="122" rx="14" fill="#EFFCF5" stroke="#0A0A0A" stroke-width="3"/>
    <rect x="668" y="42" width="96" height="22" rx="6" fill="#00CC74" stroke="#0A0A0A" stroke-width="2"/>
    <text x="716" y="57" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#0A0A0A">AUTO HTTPS</text>
    <text x="759" y="92" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="16" fill="#0A0A0A">Users &amp; Agents</text>
    <text x="759" y="116" text-anchor="middle" font-family="Space Mono,monospace" font-size="11" fill="#00A85E">Port 443 · Valid Cert</text>
    <text x="759" y="136" text-anchor="middle" font-family="Space Mono,monospace" font-size="10" fill="#525252">Zero bandwidth caps</text>
  </svg>
  <p class="diagram-caption">Origin-to-edge flow for ${esc(g.name)}: connect ${esc(g.defaultOrigin)} to ${esc(fqdn)} with automatic HTTPS.</p>
</div>`;
}

function renderHubRoutingSvg() {
  return `<div class="diagram-box">
  <svg viewBox="0 0 880 185" width="880" height="185" role="img" aria-label="Choose Edge Proxy for PaaS hostnames or A Record plus ACME DNS-01 for VPS servers">
    <rect x="16" y="24" width="400" height="136" rx="14" fill="#00CC74"/>
    <rect x="10" y="18" width="400" height="136" rx="14" fill="#EFFCF5" stroke="#0A0A0A" stroke-width="3"/>
    <rect x="26" y="32" width="124" height="22" rx="6" fill="#00CC74" stroke="#0A0A0A" stroke-width="2"/>
    <text x="88" y="47" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#0A0A0A">PATH A · PAAS</text>
    <text x="26" y="84" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="18" fill="#0A0A0A">Edge HTTPS Proxy</text>
    <text x="26" y="108" font-family="Space Mono,monospace" font-size="11" fill="#0A0A0A">Fly.io · Railway · Render · Cloud Run</text>
    <text x="26" y="132" font-family="Space Mono,monospace" font-weight="700" font-size="11" fill="#007A43">agentdomains proxy app my.fly.dev</text>

    <rect x="464" y="24" width="406" height="136" rx="14" fill="#0A0A0A"/>
    <rect x="458" y="18" width="406" height="136" rx="14" fill="#FFFFFF" stroke="#0A0A0A" stroke-width="3"/>
    <rect x="474" y="32" width="146" height="22" rx="6" fill="#C6F24E" stroke="#0A0A0A" stroke-width="2"/>
    <text x="547" y="47" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#0A0A0A">PATH B · BARE VPS</text>
    <text x="474" y="84" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="18" fill="#0A0A0A">A Record + ACME DNS-01</text>
    <text x="474" y="108" font-family="Space Mono,monospace" font-size="11" fill="#0A0A0A">Hetzner · DigitalOcean · EC2 · Raspberry Pi</text>
    <text x="474" y="132" font-family="Space Mono,monospace" font-weight="700" font-size="11" fill="#007A43">agentdomains record app --type A --content IP</text>
  </svg>
  <p class="diagram-caption">Pick Edge Proxy for any upstream hostname, or pick A Record + ACME DNS-01 for bare IPv4 servers.</p>
</div>`;
}

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
      q: 'Should I use edge proxy or an A record?',
      a: 'Use edge proxy when your host gives you a public hostname like Fly.io or Railway. Use an A record plus Caddy when you own a bare IPv4 VPS.',
    },
    {
      q: 'Does AgentDomains host my app code or containers?',
      a: 'No. AgentDomains hosts no app code. It gives your server a real hostname with writable DNS, forwards, and an HTTPS edge proxy.',
    },
    {
      q: 'Are there bandwidth or request caps on proxied origins?',
      a: 'No. Neither the 30-day free trial nor the $10/yr Pro plan has request quotas or bandwidth bills.',
    },
  ];

  const hubHtml = `
    <span class="eyebrow">45 Origin &amp; Host Playbooks</span>
    <h1>Host &amp; Origin <span class="g">Integration Playbooks</span></h1>
    <p class="lede">Give any VPS, PaaS container, web framework, local LLM, or webhook app a real HTTPS domain in three commands.</p>
    ${renderSpecStrip([
      { icon: 'layers', label: 'Playbooks', value: `${HOST_GUIDES.length} Platforms`, tone: 'green' },
      { icon: 'terminal', label: 'Setup', value: '3 CLI Steps' },
      { icon: 'lock', label: 'HTTPS', value: 'Edge or DNS-01', tone: 'lime' },
      { icon: 'card', label: 'Card Needed', value: 'None' },
    ])}
    ${renderHubRoutingSvg()}
    <div class="hub-search">
      <input type="text" placeholder="Filter 45 hosts (e.g. hetzner, fly, railway, fastapi, stripe, ollama)…" data-filter-input="guides-grid" aria-label="Filter host playbooks">
      <span class="pill" id="guides-grid-count">${HOST_GUIDES.length} shown</span>
    </div>
    ${renderFilterPills('guides-grid', HOST_GUIDES.map((g) => g.group))}
    <div class="grid" id="guides-grid">
      ${HOST_GUIDES.map(
        (g) => `<a class="card" href="/guides/${esc(g.slug)}" data-cat="${esc(g.group.toLowerCase())}" data-search="${esc((g.name + ' ' + g.slug + ' ' + g.group + ' ' + g.mode).toLowerCase())}">
        <div class="card-top">
          <span class="kicker">${esc(g.group)}</span>
          <span class="badge ${g.mode === 'proxy' ? 'free' : 'checking'}">${g.mode === 'record' ? 'A + TLS' : g.mode === 'forward' ? '302 FWD' : 'PROXY'}</span>
        </div>
        <h3>${esc(g.name)}</h3>
        <p>${escInline(g.recommendation)}</p>
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
      title: 'Host & Origin Playbooks (45 Platforms) — AgentDomains',
      description: 'Point agentdomains.co and makes.fyi hostnames at Hetzner, Fly.io, Railway, Render, FastAPI, Next.js, Ollama, Caddy, Stripe webhooks, and 36 more hosts.',
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
        ? 'A Record + DNS-01'
        : g.mode === 'forward'
          ? 'Edge HTTPS Forward'
          : 'Edge HTTPS Proxy';

    const step3 =
      g.mode === 'record'
        ? `agentdomains record ${g.defaultLabel} --domain agentdomains.co --type A --content ${g.defaultOrigin}`
        : g.mode === 'forward'
          ? `agentdomains forward ${g.defaultLabel} https://${g.defaultOrigin} --domain agentdomains.co`
          : `agentdomains proxy ${g.defaultLabel} ${g.defaultOrigin} --domain agentdomains.co`;

    const cli3 = [
      'agentdomains signup',
      `agentdomains claim ${g.defaultLabel} --email you@example.com --domain agentdomains.co`,
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
        q: `How do I check DNS propagation for ${g.name}?`,
        a: `Open /tools/dns-ssl-checker or run dig @1.1.1.1 ${g.defaultLabel}.agentdomains.co. Confirm both Cloudflare and Google return your record.`,
      },
      {
        q: `Can an AI agent configure ${g.name} routing via MCP?`,
        a: `Yes. Connect your client to https://mcp.agentdomains.co. Ask it to call claim_domain and ${g.mode === 'record' ? 'add_dns_record' : g.mode === 'forward' ? 'set_forward' : 'set_proxy'}.`,
      },
    ];

    const isProxyMode = g.mode === 'proxy' || g.mode === 'forward';

    const bodyHtml = `
      <span class="eyebrow">${esc(g.group)} · Integration Playbook</span>
      <h1>Custom HTTPS Domain for <span class="g">${esc(g.name)}</span></h1>
      <p class="lede">${escInline(g.recommendation)}</p>
      ${renderSpecStrip([
        { icon: 'bolt', label: 'Best Mode', value: modeLabel, tone: 'green' },
        { icon: 'terminal', label: 'Setup', value: '3 Commands' },
        { icon: 'lock', label: 'TLS Cert', value: g.mode === 'record' ? 'ACME DNS-01 / Caddy' : 'Automatic Edge', tone: 'lime' },
        { icon: 'tag', label: 'Trial Cost', value: '$0 / 30 days' },
      ])}

      ${renderRoutingSvg(g)}

      <h2>1. Choose Mode: <span class="g">Edge Proxy vs DNS-01</span></h2>
      <div class="decision-grid">
        <div class="decision-card${isProxyMode ? ' recommended' : ''}">
          <div class="decision-card-head">
            <h3>${g.mode === 'forward' ? 'Edge HTTPS Forward / Proxy' : 'Edge HTTPS Reverse Proxy'}</h3>
            <span class="badge ${isProxyMode ? 'free' : 'checking'}">${isProxyMode ? 'RECOMMENDED' : 'FOR PAAS HOSTS'}</span>
          </div>
          <ul>
            <li>Point at any public hostname without <code>https://</code>.</li>
            <li>Cloudflare edge handles TLS 1.3 automatically.</li>
            <li>Zero Certbot config and zero IP exposure.</li>
          </ul>
        </div>
        <div class="decision-card${g.mode === 'record' ? ' recommended' : ''}">
          <div class="decision-card-head">
            <h3>A Record + ACME DNS-01</h3>
            <span class="badge ${g.mode === 'record' ? 'free' : 'checking'}">${g.mode === 'record' ? 'RECOMMENDED' : 'FOR BARE VPS'}</span>
          </div>
          <ul>
            <li>Point directly at your server IPv4 or IPv6 address.</li>
            <li>Issue certs via Caddy or <code>agentdomains txt</code> DNS-01.</li>
            <li>Works even when your firewall blocks port 80.</li>
          </ul>
        </div>
      </div>

      ${codeBox(`${g.name} — 3-command AgentDomains setup`, cli3)}

      <h2>2. Interactive: <span class="g">Generate My CLI Command</span></h2>
      <p>Enter your subdomain label and origin below. Copy the generated commands or check live name availability.</p>
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
              <option value="agentdomains.co">.agentdomains.co (default)</option>
              <option value="makes.fyi">.makes.fyi</option>
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
      <p>Apply this config on ${esc(g.name)} so headers, TLS, and routing match your new hostname.</p>
      ${codeBox(`${g.name} server / platform config`, g.serverSnippet)}
      <div class="panel warn">
        <h3>Operational Checklist</h3>
        <ul>
          ${g.notes.map((n) => `<li>${escInline(n)}</li>`).join('\n          ')}
        </ul>
      </div>

      <div class="btn-row">
        <a class="btn" href="/tools/dns-ssl-checker">Debug DNS &amp; ACME Live →</a>
        <a class="btn ghost" href="/mcp">Connect via MCP Instead</a>
      </div>

      ${renderFaqs(faqs)}

      <h2>Related <span class="g">Host Playbooks</span></h2>
      <div class="grid four">
        ${related
          .map(
            (r) => `<a class="card" href="/guides/${esc(r.slug)}">
          <span class="kicker">${esc(r.group)}</span>
          <h3>${esc(r.name)}</h3>
          <p>${escInline(r.recommendation)}</p>
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
        title: fitTitle(`HTTPS Domain for ${g.name} — AgentDomains`, `${g.name} Domain Guide | AgentDomains`),
        description: `Give ${g.name} a live agentdomains.co or makes.fyi HTTPS domain in 3 CLI commands. Includes ${modeLabel} config and live check.`,
        activeNav: 'guides',
        ctaPrefill: g.defaultLabel,
        breadcrumbs,
        jsonLdGraph: [
          breadcrumbSchema(breadcrumbs, pageUrl),
          {
            '@type': 'TechArticle',
            '@id': `${pageUrl}#article`,
            headline: `Custom HTTPS Domain for ${g.name}`,
            description: stripTicks(g.recommendation),
            url: pageUrl,
            author: { '@id': `${SITE}/#organization` },
            publisher: { '@id': `${SITE}/#organization` },
          },
          {
            '@type': 'HowTo',
            '@id': `${pageUrl}#howto`,
            name: `Point an AgentDomains hostname at ${g.name}`,
            step: [
              { '@type': 'HowToStep', name: 'Create account', text: 'Run agentdomains signup to get a free API key.' },
              { '@type': 'HowToStep', name: 'Claim subdomain', text: `Run agentdomains claim ${g.defaultLabel} --email you@example.com --domain agentdomains.co.` },
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
