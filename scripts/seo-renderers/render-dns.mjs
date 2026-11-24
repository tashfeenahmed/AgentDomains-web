import {
  SITE,
  esc,
  renderPage,
  breadcrumbSchema,
  faqSchema,
  codeBox,
  renderFaqs,
} from '../seo-lib/layout.mjs';
import { DNS_TOPICS } from '../seo-data/dns-topics.mjs';

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
      a: 'AgentDomains supports A, AAAA, CNAME, and TXT records (including _acme-challenge and deeper sub-labels via --host), plus NS delegation for full zone control, edge HTTPS reverse proxying, and 301/302 URL forwarding.',
    },
    {
      q: 'How do I debug live DNS propagation or ACME DNS-01 tokens?',
      a: 'Use our free browser-based /tools/dns-ssl-checker which queries Cloudflare (1.1.1.1) and Google (8.8.8.8) DoH resolvers simultaneously for A, AAAA, CNAME, TXT, NS, and _acme-challenge records.',
    },
  ];

  const hubHtml = `
    <span class="eyebrow">Cluster 05 · 40 Engineering Reference Guides</span>
    <h1>Developer <span class="g">DNS, SSL &amp; Proxy</span> Reference</h1>
    <p class="lede">Concise engineering explanations, interactive DNS syntax validation, and exact CLI, <code>curl</code>, and MCP JSON-RPC payloads for every record and TLS concept you hit when shipping AI agents.</p>
    <div class="btn-row">
      <a class="btn" href="/tools/dns-ssl-checker">Open Live DNS &amp; ACME DNS-01 Debugger →</a>
      <a class="btn ghost" href="https://docs.agentdomains.co/records">API Record Reference</a>
    </div>
    <div class="hub-search">
      <input type="text" placeholder="Filter 40 DNS &amp; SSL topics (e.g. acme, cname, txt, ttl, sni, cors)…" data-filter-input="dns-grid" aria-label="Filter DNS topics">
      <span class="pill" id="dns-grid-count">${DNS_TOPICS.length} shown</span>
    </div>
    <div class="grid" id="dns-grid">
      ${DNS_TOPICS.map(
        (d) => `<a class="card" href="/dns/${esc(d.slug)}" data-search="${esc((d.name + ' ' + d.slug + ' ' + d.category + ' ' + d.summary).toLowerCase())}">
        <span class="kicker">${esc(d.category)}</span>
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
      description: 'Engineering reference for ACME DNS-01, CNAME vs A records, NS delegation, TTL propagation, reverse proxies, and MCP JSON-RPC payloads.',
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
        a: `Run \`${d.cli}\` from the Go CLI, call the REST API over curl, or invoke the \`${d.mcpTool}\` tool on https://mcp.agentdomains.co.`,
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
        description: `${d.summary} Includes interactive DNS syntax validator plus exact CLI, curl, and MCP JSON-RPC examples.`,
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
