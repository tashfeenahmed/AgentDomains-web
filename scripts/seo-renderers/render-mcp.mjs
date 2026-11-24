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
import { MCP_CLIENTS } from '../seo-data/mcp-clients.mjs';

function renderMcpFlowSvg(clientName, transport) {
  const cname = trunc(clientName, 22);
  const tr = trunc(transport, 22);
  return `<div class="diagram-box">
  <svg viewBox="0 0 880 210" width="880" height="210" role="img" aria-label="MCP handshake flow from ${esc(clientName)} to mcp.agentdomains.co and live HTTPS subdomains">
    <defs>
      <marker id="arr-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#00CC74" stroke="#0A0A0A" stroke-width="1"/>
      </marker>
    </defs>
    <!-- Shadow + Node 1: Client -->
    <rect x="16" y="42" width="218" height="114" rx="14" fill="#0A0A0A"/>
    <rect x="10" y="36" width="218" height="114" rx="14" fill="#EFFCF5" stroke="#0A0A0A" stroke-width="3"/>
    <rect x="24" y="50" width="76" height="22" rx="6" fill="#C6F24E" stroke="#0A0A0A" stroke-width="2"/>
    <text x="62" y="65" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="11" fill="#0A0A0A">CLIENT</text>
    <text x="119" y="100" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="17" fill="#0A0A0A">${esc(cname)}</text>
    <text x="119" y="126" text-anchor="middle" font-family="Space Mono,monospace" font-size="11" fill="#00A85E">${esc(tr)}</text>

    <!-- Arrow 1 -->
    <line x1="232" y1="84" x2="314" y2="84" stroke="#0A0A0A" stroke-width="3" marker-end="url(#arr-g)"/>
    <rect x="237" y="54" width="74" height="20" rx="5" fill="#FFFFFF" stroke="#0A0A0A" stroke-width="1.8"/>
    <text x="274" y="68" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#0A0A0A">JSON-RPC</text>

    <!-- Shadow + Node 2: MCP Server -->
    <rect x="330" y="28" width="242" height="142" rx="14" fill="#00CC74"/>
    <rect x="324" y="22" width="242" height="142" rx="14" fill="#C6F24E" stroke="#0A0A0A" stroke-width="3"/>
    <rect x="340" y="36" width="96" height="22" rx="6" fill="#0A0A0A"/>
    <text x="388" y="51" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#C6F24E">20 MCP TOOLS</text>
    <text x="445" y="86" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="17" fill="#0A0A0A">mcp.agentdomains.co</text>
    <text x="445" y="110" text-anchor="middle" font-family="Space Mono,monospace" font-size="11" fill="#0A0A0A">Streamable HTTP or stdio</text>
    <text x="445" y="132" text-anchor="middle" font-family="Space Mono,monospace" font-size="11" fill="#0A0A0A">signup · claim · DNS · proxy</text>
    <text x="445" y="152" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#007A43">Bearer adom_... auth</text>

    <!-- Arrow 2 -->
    <line x1="570" y1="84" x2="648" y2="84" stroke="#0A0A0A" stroke-width="3" marker-end="url(#arr-g)"/>
    <rect x="576" y="54" width="68" height="20" rx="5" fill="#FFFFFF" stroke="#0A0A0A" stroke-width="1.8"/>
    <text x="610" y="68" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#0A0A0A">AUTO TLS</text>

    <!-- Shadow + Node 3: Live Domain -->
    <rect x="664" y="42" width="206" height="114" rx="14" fill="#0A0A0A"/>
    <rect x="658" y="36" width="206" height="114" rx="14" fill="#FFFFFF" stroke="#0A0A0A" stroke-width="3"/>
    <rect x="672" y="50" width="76" height="22" rx="6" fill="#00CC74" stroke="#0A0A0A" stroke-width="2"/>
    <text x="710" y="65" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="11" fill="#0A0A0A">LIVE URL</text>
    <text x="761" y="100" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="16" fill="#0A0A0A">*.agentdomains.co</text>
    <text x="761" y="122" text-anchor="middle" font-family="Space Mono,monospace" font-size="11" fill="#00A85E">or *.makes.fyi</text>
    <text x="761" y="140" text-anchor="middle" font-family="Space Mono,monospace" font-size="10" fill="#525252">200 OK · Edge HTTPS</text>

    <!-- Return feedback bar -->
    <path d="M 761 160 L 761 190 L 119 190 L 119 162" fill="none" stroke="#00A85E" stroke-width="2.5" stroke-dasharray="6 4" marker-end="url(#arr-g)"/>
    <rect x="330" y="178" width="230" height="22" rx="6" fill="#EFFCF5" stroke="#0A0A0A" stroke-width="1.8"/>
    <text x="445" y="193" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#0A0A0A">Returns live HTTPS URL to agent</text>
  </svg>
  <p class="diagram-caption">MCP tool flow: ${esc(clientName)} sends JSON-RPC calls to mcp.agentdomains.co and receives a live HTTPS domain.</p>
</div>`;
}

function renderToolGroups() {
  const groups = [
    {
      title: 'Account & Auth',
      count: '5 tools',
      tools: ['signup', 'whoami', 'attach_email', 'upgrade_to_pro', 'manage_billing'],
    },
    {
      title: 'Domains & Stats',
      count: '6 tools',
      tools: ['check_availability', 'claim_domain', 'list_domains', 'get_domain', 'get_visits', 'delete_domain'],
    },
    {
      title: 'DNS & ACME',
      count: '4 tools',
      tools: ['add_dns_record', 'delete_record', 'add_acme_challenge', 'delegate_nameservers'],
    },
    {
      title: 'Edge Proxy & Forward',
      count: '5 tools',
      tools: ['set_proxy', 'remove_proxy', 'set_forward', 'remove_forward', 'delete_account'],
    },
  ];
  return `<div class="tool-groups">
  ${groups
    .map(
      (g) => `<div class="tool-group">
    <h3>${esc(g.title)} <span class="badge free">${esc(g.count)}</span></h3>
    <div class="tool-chips">
      ${g.tools.map((t) => `<span class="tool-chip">${esc(t)}</span>`).join('')}
    </div>
  </div>`
    )
    .join('\n  ')}
</div>`;
}

export function buildMcpPages() {
  const pages = [];
  const bySlug = new Map(MCP_CLIENTS.map((c) => [c.slug, c]));

  // Hub: /mcp
  const hubPath = '/mcp';
  const hubUrl = `${SITE}${hubPath}`;
  const hubBreadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'MCP Setup Guides', url: hubPath },
  ];
  const hubFaqs = [
    {
      q: 'What is the difference between Streamable HTTP and stdio MCP?',
      a: 'Streamable HTTP runs at https://mcp.agentdomains.co with no local Node install. Local stdio runs via npx and reads your Go CLI config file.',
    },
    {
      q: 'Can my AI agent connect before I have an API key?',
      a: 'Yes. Connect without an Authorization header and call the signup tool first. Pass the returned adom_ key on your next tool calls.',
    },
    {
      q: 'How many MCP tools does AgentDomains expose?',
      a: 'Both transports expose the same 20 tools. They cover signup, domain claims, DNS records, ACME tokens, forwards, edge proxies, and stats.',
    },
  ];

  const hubHtml = `
    <span class="eyebrow">Cluster 01 · 25 MCP Client Integrations</span>
    <h1>AgentDomains <span class="g">MCP Setup</span> Guides</h1>
    <p class="lede">Connect any AI editor, CLI agent, or framework to our 20-tool MCP server. Use hosted Streamable HTTP or local <code>npx</code> stdio.</p>
    ${renderSpecStrip([
      { icon: 'plug', label: 'Clients Covered', value: `${MCP_CLIENTS.length} Guides`, tone: 'green' },
      { icon: 'bolt', label: 'MCP Tools', value: '20 Live Tools' },
      { icon: 'tag', label: 'Free Trial', value: '$0 / 30 Days', tone: 'lime' },
      { icon: 'card', label: 'Card Needed', value: 'None' },
    ])}
    ${renderMcpFlowSvg('Any AI Client', 'Streamable HTTP / stdio')}
    <div class="btn-row">
      <a class="btn" href="/tools/mcp-config-builder">Open Universal MCP Config Builder →</a>
      <a class="btn ghost" href="https://docs.agentdomains.co/mcp">Read MCP Tool Reference</a>
    </div>
    <div class="hub-search">
      <input type="text" placeholder="Filter 25 MCP clients (e.g. cursor, claude, langchain, n8n)…" data-filter-input="mcp-grid" aria-label="Filter MCP clients">
      <span class="pill" id="mcp-grid-count">${MCP_CLIENTS.length} shown</span>
    </div>
    ${renderFilterPills('mcp-grid', MCP_CLIENTS.map((c) => c.category))}
    <div class="grid" id="mcp-grid">
      ${MCP_CLIENTS.map(
        (c, i) => `<a class="card" href="/mcp/${esc(c.slug)}" data-cat="${esc(c.category.toLowerCase())}" data-search="${esc((c.name + ' ' + c.slug + ' ' + c.category + ' ' + c.transport).toLowerCase())}">
        <div class="card-top">
          <span class="kicker">${esc(c.category)}</span>
          <span class="card-icon">${String(i + 1).padStart(2, '0')}</span>
        </div>
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.summary)}</p>
        <span class="pill green" style="align-self:flex-start;margin-top:auto">${esc(c.transport)}</span>
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
      title: 'AgentDomains MCP Setup Guides: 25 AI Clients & Frameworks',
      description: 'Copy-paste MCP setup configs for Claude Code, Cursor, VS Code, Windsurf, OpenAI Agents SDK, LangChain, CrewAI, n8n, and 17 more AI clients.',
      activeNav: 'mcp',
      breadcrumbs: hubBreadcrumbs,
      ogType: 'website',
      jsonLdGraph: [
        breadcrumbSchema(hubBreadcrumbs, hubUrl),
        {
          '@type': 'CollectionPage',
          '@id': `${hubUrl}#page`,
          url: hubUrl,
          name: 'AgentDomains MCP Setup Guides',
          isPartOf: { '@id': `${SITE}/#website` },
        },
        faqSchema(hubFaqs, hubUrl),
      ],
      bodyHtml: hubHtml,
    }),
  });

  // 25 client pages
  for (const c of MCP_CLIENTS) {
    const pagePath = `/mcp/${c.slug}`;
    const pageUrl = `${SITE}${pagePath}`;
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'MCP Setup Guides', url: '/mcp' },
      { name: c.name, url: pagePath },
    ];
    const faqs = [
      {
        q: `Does ${c.name} work with Streamable HTTP or stdio?`,
        a: `${c.name} supports ${c.transport}. Pick hosted Streamable HTTP when available for zero local Node setup, or run npx -y agentdomains-mcp for stdio.`,
      },
      {
        q: `Where does ${c.name} store its MCP config?`,
        a: `Store it in ${c.configPath}. Keep your adom_ API key in an env var and never commit it to Git.`,
      },
      {
        q: `How much does it cost to claim domains from ${c.name}?`,
        a: 'Start with a 30-day free trial for 10 names with no card. Pro costs $10/yr or $1/mo for up to 100 names.',
      },
    ];

    const relatedCards = (c.related || [])
      .map((slug) => bySlug.get(slug))
      .filter(Boolean)
      .map(
        (r) => `<a class="card" href="/mcp/${esc(r.slug)}">
        <span class="kicker">${esc(r.category)}</span>
        <h3>${esc(r.name)} MCP Setup</h3>
        <p>${esc(r.summary)}</p>
      </a>`
      )
      .join('\n      ');

    const bodyHtml = `
      <span class="eyebrow">${esc(c.category)} · MCP Setup Guide</span>
      <h1>AgentDomains MCP for <span class="g">${esc(c.name)}</span></h1>
      <p class="lede">${esc(c.summary)}</p>
      ${renderSpecStrip([
        { icon: 'bolt', label: 'Setup Time', value: '45 sec', tone: 'green' },
        { icon: 'plug', label: 'Transport', value: trunc(c.transport, 22) },
        { icon: 'tag', label: 'Cost', value: '$0 / 30 days', tone: 'lime' },
        { icon: 'card', label: 'Card Needed', value: 'None' },
      ])}

      ${renderMcpFlowSvg(c.name, c.transport)}

      <div class="step-grid" aria-label="Quick setup steps">
        <div class="step-tile">
          <div class="step-tile-head"><span class="step-badge">01</span><h3>Add Config</h3></div>
          <p>Open <code>${esc(c.configPath)}</code> and paste the snippet below.</p>
        </div>
        <div class="step-tile">
          <div class="step-tile-head"><span class="step-badge">02</span><h3>Reload Tools</h3></div>
          <p>Refresh MCP tools in ${esc(c.name)}. Confirm 20 AgentDomains tools appear.</p>
        </div>
        <div class="step-tile">
          <div class="step-tile-head"><span class="step-badge">03</span><h3>Run Prompt</h3></div>
          <p>Paste the test prompt below to check, claim, and route a live domain.</p>
        </div>
      </div>

      <div class="panel accent">
        <strong>Config path:</strong> <code>${esc(c.configPath)}</code>
        ${
          c.deeplink
            ? `<div class="btn-row" style="margin:.85rem 0 0"><a class="btn" href="${esc(c.deeplink.href)}">${esc(c.deeplink.label)} →</a><a class="btn ghost" href="/tools/mcp-config-builder">Customize in Builder</a></div>`
            : `<div class="btn-row" style="margin:.85rem 0 0"><a class="btn" href="/tools/mcp-config-builder">Customize &amp; Test Live Handshake →</a></div>`
        }
      </div>

      <h2>1. Install &amp; <span class="g">Configure</span> ${esc(c.name)}</h2>
      <p>Choose hosted Streamable HTTP for zero local setup, or pick local stdio to reuse your Go CLI config.</p>
      ${c.cliCommand ? codeBox(`${c.name} quick CLI command`, c.cliCommand) : ''}
      <div data-tabs>
        <div class="tabs" role="tablist">
          <button type="button" class="tab-btn active" data-tab="http">Hosted Streamable HTTP (Recommended)</button>
          <button type="button" class="tab-btn" data-tab="stdio">Local stdio (npx agentdomains-mcp)</button>
        </div>
        <div class="tab-pane active" data-pane="http">
          ${codeBox(`${c.name} — Streamable HTTP config`, c.httpConfig)}
        </div>
        <div class="tab-pane" data-pane="stdio">
          ${codeBox(`${c.name} — Local stdio config`, c.stdioConfig)}
        </div>
      </div>

      <h2>2. Tested <span class="g">First Prompt</span></h2>
      <p>Reload MCP tools in ${esc(c.name)}. Run this prompt to check a name, claim it, and set routing.</p>
      ${codeBox(`First prompt for ${c.name}`, c.firstPrompt)}

      <h2>3. ${esc(c.name)} <span class="g">Setup Notes</span></h2>
      <div class="panel warn">
        <ul>
          ${c.gotchas.map((g) => `<li>${esc(g)}</li>`).join('\n          ')}
        </ul>
      </div>

      <h2>4. Available <span class="g">MCP Tools</span> (20 total)</h2>
      <p>${esc(c.name)} gets all 20 tools across account auth, domain claims, DNS records, and edge routing.</p>
      ${renderToolGroups()}
      <div class="btn-row">
        <a class="btn" href="/tools/mcp-config-builder">Test Live MCP Handshake →</a>
        <a class="btn ghost" href="/guides">Browse 45 Host Playbooks</a>
      </div>

      ${renderFaqs(faqs)}

      <h2>Related <span class="g">MCP Clients</span></h2>
      <div class="grid">
        ${relatedCards}
      </div>
    `;

    pages.push({
      path: pagePath,
      priority: '0.8',
      html: renderPage({
        path: pagePath,
        title: `AgentDomains MCP Setup for ${c.name} — Streamable HTTP & stdio`,
        description: `Connect ${c.name} to AgentDomains MCP (${c.transport}). Copy-paste config, first prompt, and troubleshooting notes.`,
        activeNav: 'mcp',
        breadcrumbs,
        jsonLdGraph: [
          breadcrumbSchema(breadcrumbs, pageUrl),
          {
            '@type': 'SoftwareApplication',
            '@id': `${pageUrl}#app`,
            name: `AgentDomains MCP for ${c.name}`,
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'macOS, Linux, Windows',
            url: pageUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
          {
            '@type': 'HowTo',
            '@id': `${pageUrl}#howto`,
            name: `How to connect ${c.name} to AgentDomains MCP`,
            description: c.summary,
            step: [
              {
                '@type': 'HowToStep',
                name: 'Add MCP config',
                text: `Open ${c.configPath} and add https://mcp.agentdomains.co or npx -y agentdomains-mcp.`,
              },
              {
                '@type': 'HowToStep',
                name: 'Authenticate with API key',
                text: 'Pass your adom_ API key or call the signup tool first.',
              },
              {
                '@type': 'HowToStep',
                name: 'Run first prompt',
                text: c.firstPrompt,
              },
            ],
          },
          faqSchema(faqs, pageUrl),
        ],
        bodyHtml,
      }),
    });
  }

  return pages;
}
