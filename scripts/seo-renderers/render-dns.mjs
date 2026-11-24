import {
  SITE,
  esc,
  renderPage,
  breadcrumbSchema,
  faqSchema,
  codeBox,
  renderFaqs,
} from '../seo-lib/layout.mjs';
import { renderSpecStrip, renderFilterPills, trunc } from '../seo-lib/visuals.mjs';
import { DNS_TOPICS } from '../seo-data/dns-topics.mjs';

function renderDnsAnatomySvg(host, type, value, topicName) {
  const fullHost = host === '@' ? 'myapp.makes.fyi' : `${host}.myapp.makes.fyi`;
  return `<div class="diagram-box">
  <svg viewBox="0 0 880 198" width="880" height="198" role="img" aria-label="DNS record anatomy diagram for ${esc(topicName)}: HOST ${esc(fullHost)}, TYPE ${esc(type)}, TTL 300s, TARGET ${esc(value)}">
    <text x="16" y="28" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="16" fill="#0A0A0A">DNS Record Anatomy — ${esc(trunc(topicName, 44))}</text>

    <!-- Field 1: HOST -->
    <rect x="18" y="48" width="246" height="82" rx="12" fill="#0A0A0A"/>
    <rect x="14" y="44" width="246" height="82" rx="12" fill="#EFFCF5" stroke="#0A0A0A" stroke-width="2.5"/>
    <rect x="26" y="54" width="60" height="20" rx="5" fill="#0A0A0A"/>
    <text x="56" y="68" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#C6F24E">HOST</text>
    <text x="26" y="96" font-family="Space Mono,monospace" font-weight="700" font-size="12" fill="#0A0A0A">${esc(trunc(fullHost, 28))}</text>
    <text x="26" y="114" font-family="Space Mono,monospace" font-size="10" fill="#525252">Sub-label: ${esc(host)}</text>

    <!-- Field 2: TYPE -->
    <rect x="278" y="48" width="122" height="82" rx="12" fill="#00CC74"/>
    <rect x="274" y="44" width="122" height="82" rx="12" fill="#C6F24E" stroke="#0A0A0A" stroke-width="2.5"/>
    <rect x="286" y="54" width="58" height="20" rx="5" fill="#0A0A0A"/>
    <text x="315" y="68" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#FFFFFF">TYPE</text>
    <text x="335" y="102" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="24" fill="#0A0A0A">${esc(type)}</text>

    <!-- Field 3: TTL -->
    <rect x="414" y="48" width="114" height="82" rx="12" fill="#0A0A0A"/>
    <rect x="410" y="44" width="114" height="82" rx="12" fill="#FFFFFF" stroke="#0A0A0A" stroke-width="2.5"/>
    <rect x="422" y="54" width="48" height="20" rx="5" fill="#EFFCF5" stroke="#0A0A0A" stroke-width="1.5"/>
    <text x="446" y="68" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#0A0A0A">TTL</text>
    <text x="467" y="100" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="20" fill="#00A85E">300s</text>
    <text x="467" y="116" text-anchor="middle" font-family="Space Mono,monospace" font-size="9.5" fill="#525252">Auto cache</text>

    <!-- Field 4: TARGET / CONTENT -->
    <rect x="542" y="48" width="326" height="82" rx="12" fill="#0A0A0A"/>
    <rect x="538" y="44" width="326" height="82" rx="12" fill="#FFFFFF" stroke="#0A0A0A" stroke-width="2.5"/>
    <rect x="550" y="54" width="76" height="20" rx="5" fill="#00CC74" stroke="#0A0A0A" stroke-width="1.5"/>
    <text x="588" y="68" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#0A0A0A">TARGET</text>
    <text x="550" y="96" font-family="Space Mono,monospace" font-weight="700" font-size="12" fill="#0A0A0A">${esc(trunc(value, 36))}</text>
    <text x="550" y="114" font-family="Space Mono,monospace" font-size="10" fill="#525252">Returned by 1.1.1.1 &amp; 8.8.8.8</text>

    <!-- Callout Footer Bar -->
    <rect x="14" y="146" width="850" height="36" rx="8" fill="#EFFCF5" stroke="#0A0A0A" stroke-width="2"/>
    <text x="439" y="169" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="11" fill="#0A0A0A">Authoritative zone: Cloudflare Edge DNS · Manage via Go CLI, REST API, or MCP tool</text>
  </svg>
  <p class="diagram-caption">Exact DNS wire fields: HOST identifies the label, TYPE picks the record format, TTL sets cache duration, TARGET holds the answer.</p>
</div>`;
}

export function buildDnsPages() {
  const pages = [];

  // Hub: /dns
  const hubPath = '/dns';
  const hubUrl = `${SITE}${hubPath}`;
  const hubBreadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'DNS, SSL & Edge Proxy Reference', url: hubPath },
  ];
  const hubFaqs = [
    {
      q: 'Which DNS record types can I manage on AgentDomains?',
      a: 'Manage A, AAAA, CNAME, and TXT records on any sub-label. You also get NS delegation, URL forwards, and edge HTTPS proxies.',
    },
    {
      q: 'How do I debug live DNS propagation or ACME tokens?',
      a: 'Open /tools/dns-ssl-checker in your browser. It queries Cloudflare 1.1.1.1 and Google 8.8.8.8 over DoH side by side.',
    },
  ];

  const hubHtml = `
    <span class="eyebrow">Cluster 05 · 40 Engineering Reference Guides</span>
    <h1>Developer <span class="g">DNS, SSL &amp; Proxy</span> Reference</h1>
    <p class="lede">Short engineering guides, a live DNS syntax checker, and exact CLI, <code>curl</code>, and MCP payloads for shipping AI agents.</p>
    ${renderSpecStrip([
      { icon: 'layers', label: 'Topics', value: `${DNS_TOPICS.length} Guides`, tone: 'green' },
      { icon: 'check', label: 'Validator', value: 'Live Syntax Check' },
      { icon: 'terminal', label: 'Payloads', value: 'CLI · curl · MCP', tone: 'lime' },
      { icon: 'globe', label: 'Resolvers', value: '1.1.1.1 + 8.8.8.8' },
    ])}
    ${renderDnsAnatomySvg('_acme-challenge', 'TXT', 'gfj9Xq...acme_token_9zK2', 'ACME DNS-01 & Writable Records')}
    <div class="btn-row">
      <a class="btn" href="/tools/dns-ssl-checker">Open Live DNS &amp; ACME Debugger →</a>
      <a class="btn ghost" href="https://docs.agentdomains.co/records">API Record Reference</a>
    </div>
    <div class="hub-search">
      <input type="text" placeholder="Filter 40 DNS &amp; SSL topics (e.g. acme, cname, txt, ttl, sni, cors)…" data-filter-input="dns-grid" aria-label="Filter DNS topics">
      <span class="pill" id="dns-grid-count">${DNS_TOPICS.length} shown</span>
    </div>
    ${renderFilterPills('dns-grid', DNS_TOPICS.map((d) => d.category))}
    <div class="grid" id="dns-grid">
      ${DNS_TOPICS.map(
        (d) => `<a class="card" href="/dns/${esc(d.slug)}" data-cat="${esc(d.category.toLowerCase())}" data-search="${esc((d.name + ' ' + d.slug + ' ' + d.category + ' ' + d.summary).toLowerCase())}">
        <div class="card-top">
          <span class="kicker">${esc(d.category)}</span>
          <span class="badge free">${esc(d.defaultType)}</span>
        </div>
        <h3>${esc(d.name)}</h3>
        <p>${esc(d.summary)}</p>
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
      title: 'Developer DNS, SSL & Edge Proxy Reference — 40 AgentDomains Guides',
      description: 'Engineering reference for ACME DNS-01, CNAME vs A records, NS delegation, TTL, reverse proxies, and MCP JSON-RPC payloads.',
      activeNav: 'dns',
      breadcrumbs: hubBreadcrumbs,
      ogType: 'website',
      jsonLdGraph: [
        breadcrumbSchema(hubBreadcrumbs, hubUrl),
        {
          '@type': 'CollectionPage',
          '@id': `${hubUrl}#page`,
          url: hubUrl,
          name: 'Developer DNS, SSL & Edge Proxy Reference',
          isPartOf: { '@id': `${SITE}/#website` },
        },
        faqSchema(hubFaqs, hubUrl),
      ],
      bodyHtml: hubHtml,
    }),
  });

  // 40 reference topic pages
  DNS_TOPICS.forEach((d, idx) => {
    const pagePath = `/dns/${d.slug}`;
    const pageUrl = `${SITE}${pagePath}`;
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'DNS & SSL Reference', url: '/dns' },
      { name: d.name, url: pagePath },
    ];

    const mcpPayload = JSON.stringify(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: d.mcpTool,
          arguments: d.mcpArgs,
        },
      },
      null,
      2
    );

    const faqs = [
      {
        q: `What is ${d.term}?`,
        a: d.summary,
      },
      {
        q: `How do I automate ${d.name} with AgentDomains?`,
        a: `Use the Go CLI snippet above, send a REST curl call, or invoke ${d.mcpTool} on https://mcp.agentdomains.co.`,
      },
    ];

    const related = DNS_TOPICS.filter((x) => x.slug !== d.slug && x.category === d.category)
      .concat(DNS_TOPICS.slice((idx + 1) % DNS_TOPICS.length, (idx + 5) % DNS_TOPICS.length))
      .filter((v, i, a) => v.slug !== d.slug && a.findIndex((x) => x.slug === v.slug) === i)
      .slice(0, 4);

    const bodyHtml = `
      <span class="eyebrow">${esc(d.category)} · DNS &amp; TLS Reference</span>
      <h1>${esc(d.name)} <span class="g">Explained</span></h1>
      <p class="lede">${esc(d.summary)}</p>
      ${renderSpecStrip([
        { icon: 'tag', label: 'Record Type', value: d.defaultType, tone: 'green' },
        { icon: 'globe', label: 'Sub-Label', value: trunc(d.defaultHost, 18) },
        { icon: 'bolt', label: 'Default TTL', value: '300s Auto', tone: 'lime' },
        { icon: 'plug', label: 'MCP Tool', value: trunc(d.mcpTool, 20) },
      ])}

      ${renderDnsAnatomySvg(d.defaultHost, d.defaultType, d.defaultValue, d.name)}

      <h2>1. Engineering <span class="g">Breakdown</span></h2>
      <div class="panel accent">
        <p style="margin:0">${esc(d.explanation)}</p>
      </div>
      <div class="panel warn">
        <h3>Common Pitfalls</h3>
        <ul>
          ${d.pitfalls.map((p) => `<li>${esc(p)}</li>`).join('\n          ')}
        </ul>
      </div>

      <h2>2. Interactive <span class="g">DNS Record Syntax Validator</span></h2>
      <p>Edit the record type, host label, or value below to validate syntax and build your CLI command.</p>
      <div class="widget" data-dns-validator>
        <div class="widget-head">
          <strong>Validate DNS syntax &amp; generate AgentDomains CLI</strong>
          <a class="btn sm ghost" href="/tools/dns-ssl-checker">Query Live DoH Resolvers →</a>
        </div>
        <div class="widget-grid">
          <div class="field">
            <label for="dns-type">Record Type</label>
            <select id="dns-type" data-dns-type>
              ${['A', 'AAAA', 'CNAME', 'TXT', 'NS']
                .map((t) => `<option value="${t}"${t === d.defaultType ? ' selected' : ''}>${t}</option>`)
                .join('')}
            </select>
          </div>
          <div class="field">
            <label for="dns-host">Sub-label (@ for apex)</label>
            <input id="dns-host" type="text" data-dns-host value="${esc(d.defaultHost)}">
          </div>
          <div class="field">
            <label for="dns-val">Record Content</label>
            <input id="dns-val" type="text" data-dns-val value="${esc(d.defaultValue)}">
          </div>
        </div>
        <div class="status-line" data-dns-result></div>
        <div class="code-box" style="margin:.5rem 0 0">
          <div class="code-head">
            <span>Validated CLI command</span>
            <button type="button" class="copy-btn" data-target="dns-cli-out">COPY</button>
          </div>
          <pre id="dns-cli-out" data-dns-cli></pre>
        </div>
      </div>

      <h2>3. Exact <span class="g">CLI, curl &amp; MCP JSON-RPC</span> Payloads</h2>
      <p>Pick your preferred interface below and copy the working payload.</p>
      <div data-tabs>
        <div class="tabs" role="tablist">
          <button type="button" class="tab-btn active" data-tab="cli">AgentDomains CLI</button>
          <button type="button" class="tab-btn" data-tab="curl">REST API (curl)</button>
          <button type="button" class="tab-btn" data-tab="mcp">MCP JSON-RPC</button>
        </div>
        <div class="tab-pane active" data-pane="cli">
          ${codeBox('CLI command', d.cli)}
        </div>
        <div class="tab-pane" data-pane="curl">
          ${codeBox('REST API via curl', d.curl)}
        </div>
        <div class="tab-pane" data-pane="mcp">
          ${codeBox(`POST https://mcp.agentdomains.co (${d.mcpTool})`, mcpPayload)}
        </div>
      </div>

      ${renderFaqs(faqs)}

      <h2>Related <span class="g">DNS &amp; SSL Guides</span></h2>
      <div class="grid">
        ${related
          .map(
            (r) => `<a class="card" href="/dns/${esc(r.slug)}">
          <span class="kicker">${esc(r.category)}</span>
          <h3>${esc(r.name)}</h3>
          <p>${esc(r.summary)}</p>
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
        title: `${d.name}: Developer DNS & SSL Reference — AgentDomains`,
        description: `${d.summary} Includes DNS anatomy diagram, syntax validator, and CLI, curl, and MCP payloads.`,
        activeNav: 'dns',
        breadcrumbs,
        jsonLdGraph: [
          breadcrumbSchema(breadcrumbs, pageUrl),
          {
            '@type': 'TechArticle',
            '@id': `${pageUrl}#article`,
            headline: `${d.name} Explained`,
            description: d.summary,
            url: pageUrl,
            author: { '@id': `${SITE}/#organization` },
            publisher: { '@id': `${SITE}/#organization` },
          },
          {
            '@type': 'DefinedTerm',
            '@id': `${pageUrl}#term`,
            name: d.term,
            description: d.summary,
            inDefinedTermSet: `${SITE}/dns`,
          },
          faqSchema(faqs, pageUrl),
        ],
        bodyHtml,
      }),
    });
  });

  return pages;
}
