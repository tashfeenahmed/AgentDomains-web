import {
  SITE,
  esc,
  renderPage,
  breadcrumbSchema,
  faqSchema,
  codeBox,
  renderFaqs,
} from '../seo-lib/layout.mjs';
import { MCP_CLIENTS } from '../seo-data/mcp-clients.mjs';

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
      q: 'What is the difference between hosted Streamable HTTP and local stdio MCP?',
      a: 'Hosted Streamable HTTP (https://mcp.agentdomains.co) requires zero Node.js install and works from cloud agents, editors, and serverless runtimes. Local stdio (npx -y agentdomains-mcp) runs on your machine and can automatically reuse ~/.agentdomains/config.json from the Go CLI.',
    },
    {
      q: 'Can my AI agent connect before I have an API key?',
      a: 'Yes. Connect to https://mcp.agentdomains.co without an Authorization header, call the signup tool to receive an adom_ key immediately, and pass that key as api_key on subsequent calls.',
    },
    {
      q: 'How many MCP tools does AgentDomains expose?',
      a: 'Both transports expose the exact same 20 tools covering check_availability, signup, claim_domain, DNS records (A, AAAA, CNAME, TXT), add_acme_challenge, set_forward, set_proxy, delegate_nameservers, get_visits, and billing.',
    },
  ];

  const hubHtml = `
    <span class="eyebrow">Cluster 01 · 25 MCP Client Integrations</span>
    <h1>AgentDomains <span class="g">MCP Setup</span> Guides</h1>
    <p class="lede">Connect any AI coding agent, IDE, or agent framework to our 20-tool Model Context Protocol server at <code>https://mcp.agentdomains.co</code> (Streamable HTTP) or <code>npx -y agentdomains-mcp</code> (stdio).</p>
    <div class="meta-strip">
      <span class="pill green">20 MCP tools</span>
      <span class="pill">Stateless Streamable HTTP</span>
      <span class="pill">Zero-card 30-day trial</span>
      <span class="pill lime">Pro $10/yr · 100 names</span>
    </div>
    <div class="btn-row">
      <a class="btn" href="/tools/mcp-config-builder">Open Universal MCP Config Builder →</a>
      <a class="btn ghost" href="https://docs.agentdomains.co/mcp">Read Full MCP Tool Reference</a>
    </div>
    <div class="hub-search">
      <input type="text" placeholder="Filter 25 MCP clients (e.g. cursor, claude, langchain, n8n)…" data-filter-input="mcp-grid" aria-label="Filter MCP clients">
      <span class="pill" id="mcp-grid-count">${MCP_CLIENTS.length} shown</span>
    </div>
    <div class="grid" id="mcp-grid">
      ${MCP_CLIENTS.map(
        (c) => `<a class="card" href="/mcp/${esc(c.slug)}" data-search="${esc((c.name + ' ' + c.slug + ' ' + c.category + ' ' + c.transport).toLowerCase())}">
        <span class="kicker">${esc(c.category)}</span>
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.summary)}</p>
        <span class="pill" style="align-self:flex-start;margin-top:auto">${esc(c.transport)}</span>
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
        q: `Does ${c.name} work with hosted https://mcp.agentdomains.co or stdio?`,
        a: `${c.name} supports ${c.transport}. We recommend hosted Streamable HTTP (https://mcp.agentdomains.co) whenever supported because it requires zero local Node.js runtime, or npx -y agentdomains-mcp for local stdio setups.`,
      },
      {
        q: `Where does ${c.name} store its MCP configuration?`,
        a: `${c.configPath}. Keep your adom_ API key in an environment variable or user-scoped config rather than committing it to Git.`,
      },
      {
        q: `How much does it cost to claim domains from ${c.name}?`,
        a: 'Every new account includes a 30-day free trial with up to 10 names (no credit card required). Pro is $10/year or $1/month for up to 100 names with visitor stats and priority support.',
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
      <div class="meta-strip">
        <span class="pill green">Transport: ${esc(c.transport)}</span>
        <span class="pill">Endpoint: https://mcp.agentdomains.co</span>
        <span class="pill lime">20 Tools · No Card Trial</span>
      </div>

      <div class="panel accent">
        <strong>Verified config location:</strong> <code>${esc(c.configPath)}</code>
        ${
          c.deeplink
            ? `<div class="btn-row" style="margin:.85rem 0 0"><a class="btn" href="${esc(c.deeplink.href)}">${esc(c.deeplink.label)} →</a><a class="btn ghost" href="/tools/mcp-config-builder">Customize in Builder</a></div>`
            : `<div class="btn-row" style="margin:.85rem 0 0"><a class="btn" href="/tools/mcp-config-builder">Customize &amp; Test Live Handshake →</a></div>`
        }
      </div>

      <h2>1. Install &amp; <span class="g">Configure</span> ${esc(c.name)}</h2>
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
      <p>Once ${esc(c.name)} reloads its MCP tools, run this prompt to verify end-to-end availability check, claiming, and routing:</p>
      ${codeBox(`First prompt for ${c.name}`, c.firstPrompt)}

      <h2>3. ${esc(c.name)}-Specific <span class="g">Gotchas</span></h2>
      <div class="panel warn">
        <ul>
          ${c.gotchas.map((g) => `<li>${esc(g)}</li>`).join('\n          ')}
        </ul>
      </div>

      <h2>4. Available <span class="g">MCP Tools</span> (20 total)</h2>
      <p>Once connected, ${esc(c.name)} can invoke <code>check_availability</code>, <code>signup</code>, <code>whoami</code>, <code>attach_email</code>, <code>claim_domain</code>, <code>list_domains</code>, <code>get_domain</code>, <code>get_visits</code>, <code>delete_domain</code>, <code>add_dns_record</code>, <code>delete_record</code>, <code>add_acme_challenge</code>, <code>set_forward</code>, <code>remove_forward</code>, <code>set_proxy</code>, <code>remove_proxy</code>, <code>delegate_nameservers</code>, <code>delete_account</code>, <code>upgrade_to_pro</code>, and <code>manage_billing</code>.</p>
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
        description: `Connect ${c.name} to AgentDomains MCP (${c.transport}). Verified ${c.configPath} snippet, first prompt, and troubleshooting.`,
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
                name: 'Add AgentDomains MCP configuration',
                text: `Add https://mcp.agentdomains.co or npx -y agentdomains-mcp in ${c.configPath}.`,
              },
              {
                '@type': 'HowToStep',
                name: 'Authenticate with your API key',
                text: 'Pass Authorization: Bearer adom_... or call the signup tool on your first turn.',
              },
              {
                '@type': 'HowToStep',
                name: 'Run your first domain prompt',
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
