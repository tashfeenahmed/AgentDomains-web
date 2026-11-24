import {
  SITE,
  renderPage,
  breadcrumbSchema,
  faqSchema,
  renderFaqs,
} from '../seo-lib/layout.mjs';

export function buildToolPages() {
  const pages = [];

  // Hub: /tools
  const hubPath = '/tools';
  const hubUrl = `${SITE}${hubPath}`;
  const hubBreadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Free Developer Tools', url: hubPath },
  ];

  const hubHtml = `
    <span class="eyebrow">Free Interactive Browser Utilities · Zero Login</span>
    <h1>Free <span class="g">Agent &amp; DNS</span> Developer Tools</h1>
    <p class="lede">Three 100% client-side tools built for engineers shipping AI agents: generate &amp; live-test MCP configs, debug DNS propagation &amp; ACME DNS-01 challenges over DoH, and calculate honest domain TCO across providers.</p>
    <div class="grid">
      <a class="card" href="/tools/mcp-config-builder">
        <span class="kicker">Tool 01 · MCP + Live Handshake</span>
        <h3>Universal MCP Config Builder</h3>
        <p>Pick any AI client + AgentDomains or a custom MCP endpoint to generate exact JSON/TOML/YAML/SDK configs, Cursor/VS Code 1-click deeplinks, and run a live browser Streamable HTTP <code>initialize</code> handshake test.</p>
        <span class="btn sm" style="align-self:flex-start;margin-top:.6rem">Launch Builder →</span>
      </a>
      <a class="card" href="/tools/dns-ssl-checker">
        <span class="kicker">Tool 02 · Live DoH Debugger</span>
        <h3>DNS Propagation &amp; ACME DNS-01 Checker</h3>
        <p>Query live CORS-enabled Cloudflare (<code>1.1.1.1</code>) and Google (<code>8.8.8.8</code>) DNS-over-HTTPS resolvers simultaneously for <code>A</code>, <code>AAAA</code>, <code>CNAME</code>, <code>TXT</code>, <code>NS</code>, and <code>_acme-challenge</code> records.</p>
        <span class="btn sm" style="align-self:flex-start;margin-top:.6rem">Launch Debugger →</span>
      </a>
      <a class="card" href="/tools/domain-cost-calculator">
        <span class="kicker">Tool 03 · Honest TCO Math</span>
        <h3>Agent Hostname &amp; Domain TCO Calculator</h3>
        <p>Slide from 1 to 100 projects, choose lifespan &amp; required features, and view a live SVG cost comparison chart across AgentDomains, Porkbun, Cloudflare Registrar, Namecheap, ngrok, and x402 registrars.</p>
        <span class="btn sm" style="align-self:flex-start;margin-top:.6rem">Launch Calculator →</span>
      </a>
    </div>
  `;

  pages.push({
    path: hubPath,
    priority: '0.9',
    html: renderPage({
      path: hubPath,
      title: 'Free MCP, DNS & Domain Cost Tools for AI Agents — AgentDomains',
      description: 'Three free browser tools: Universal MCP Config Builder with live handshake tester, DNS & ACME DNS-01 DoH Debugger, and Domain TCO Calculator.',
      activeNav: 'tools',
      breadcrumbs: hubBreadcrumbs,
      ogType: 'website',
      jsonLdGraph: [
        breadcrumbSchema(hubBreadcrumbs, hubUrl),
        {
          '@type': 'CollectionPage',
          '@id': `${hubUrl}#page`,
          url: hubUrl,
          name: 'AgentDomains Free Developer Tools',
          isPartOf: { '@id': `${SITE}/#website` },
        },
      ],
      bodyHtml: hubHtml,
    }),
  });

  // Tool 1: /tools/mcp-config-builder
  const t1Path = '/tools/mcp-config-builder';
  const t1Url = `${SITE}${t1Path}`;
  const t1Bc = [
    { name: 'Home', url: '/' },
    { name: 'Free Tools', url: '/tools' },
    { name: 'Universal MCP Config Builder', url: t1Path },
  ];
  const t1Faqs = [
    {
      q: 'Does the live Streamable HTTP handshake tester send my API key anywhere else?',
      a: 'No. The browser sends the JSON-RPC POST directly to the MCP URL you enter (default https://mcp.agentdomains.co). Nothing is logged or sent to any third-party backend.',
    },
    {
      q: 'Why does the handshake tester work without an API key on mcp.agentdomains.co?',
      a: 'MCP initialize and tools/list are public protocol discovery calls on mcp.agentdomains.co (along with check_availability and signup), so you can verify connectivity and inspect all 20 tools before entering a key.',
    },
  ];
  const t1Html = `
    <span class="eyebrow">Free Tool 01 · Live Streamable HTTP Tester</span>
    <h1>Universal <span class="g">MCP Config Builder</span></h1>
    <p class="lede">Generate verified Streamable HTTP and stdio configs for 12+ AI clients, create 1-click Cursor &amp; VS Code install deeplinks, and test a live JSON-RPC <code>initialize</code> + <code>tools/list</code> handshake right from your browser.</p>

    <div class="widget" id="mcp-builder-app">
      <div class="widget-head">
        <strong>1. Configure Client &amp; Server</strong>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap" id="mcp-deeplinks"></div>
      </div>
      <div class="widget-grid">
        <div class="field">
          <label for="mb-client">Target MCP Client</label>
          <select id="mb-client">
            <option value="claude-code">Claude Code (.mcp.json / CLI)</option>
            <option value="cursor">Cursor (~/.cursor/mcp.json)</option>
            <option value="vscode">VS Code (.vscode/mcp.json)</option>
            <option value="windsurf">Windsurf (mcp_config.json)</option>
            <option value="claude-desktop">Claude Desktop (claude_desktop_config.json)</option>
            <option value="codex-cli">OpenAI Codex CLI (~/.codex/config.toml)</option>
            <option value="zed">Zed (settings.json context_servers)</option>
            <option value="goose">Goose (~/.config/goose/config.yaml)</option>
            <option value="opencode">OpenCode (opencode.json)</option>
            <option value="openai-agents">OpenAI Agents SDK (Python)</option>
            <option value="langchain">LangChain MCP Adapters (Python)</option>
            <option value="vercel-ai">Vercel AI SDK (TypeScript)</option>
          </select>
        </div>
        <div class="field">
          <label for="mb-transport">Transport Mode</label>
          <select id="mb-transport">
            <option value="http">Streamable HTTP (Recommended)</option>
            <option value="stdio">Local stdio (npx)</option>
          </select>
        </div>
        <div class="field">
          <label for="mb-preset">MCP Server Preset</label>
          <select id="mb-preset">
            <option value="agentdomains">AgentDomains (mcp.agentdomains.co)</option>
            <option value="custom">Custom MCP Server</option>
          </select>
        </div>
        <div class="field">
          <label for="mb-name">Server Name Key</label>
          <input id="mb-name" type="text" value="agentdomains">
        </div>
        <div class="field">
          <label for="mb-url">Streamable HTTP Endpoint URL</label>
          <input id="mb-url" type="url" value="https://mcp.agentdomains.co">
        </div>
        <div class="field">
          <label for="mb-token">Bearer Token / API Key (optional)</label>
          <input id="mb-token" type="text" placeholder="adom_... (leave blank for anonymous test)">
        </div>
        <div class="field">
          <label for="mb-pkg">stdio npx Package (if stdio)</label>
          <input id="mb-pkg" type="text" value="agentdomains-mcp">
        </div>
        <div class="field">
          <label for="mb-env">stdio Env Var Name</label>
          <input id="mb-env" type="text" value="AGENTDOMAINS_API_KEY">
        </div>
      </div>

      <div class="status-line status-dim" id="mb-path-hint"></div>
      <div class="code-box">
        <div class="code-head">
          <span id="mb-out-label">Generated MCP Configuration</span>
          <button type="button" class="copy-btn" data-target="mb-out">COPY CONFIG</button>
        </div>
        <pre id="mb-out"></pre>
      </div>
    </div>

    <div class="widget" style="background:#fff">
      <div class="widget-head">
        <strong>2. Live Browser Streamable HTTP Handshake Tester</strong>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <button type="button" class="btn sm" id="mb-test-init">Run initialize + tools/list →</button>
        </div>
      </div>
      <p style="font-size:.92rem;color:var(--muted)">Sends real JSON-RPC 2.0 <code>initialize</code> and <code>tools/list</code> POST requests directly from your browser to the endpoint above (works with any CORS-enabled Streamable HTTP server including <code>https://mcp.agentdomains.co</code>).</p>
      <div class="status-line status-dim" id="mb-test-status">Ready to test handshake.</div>
      <div class="code-box" style="margin:.5rem 0 0">
        <div class="code-head">
          <span>Live JSON-RPC Handshake Output</span>
          <button type="button" class="copy-btn" data-target="mb-test-out">COPY LOG</button>
        </div>
        <pre id="mb-test-out">// Click "Run initialize + tools/list" to test your MCP server live.</pre>
      </div>
    </div>

    ${renderFaqs(t1Faqs)}
  `;

  pages.push({
    path: t1Path,
    priority: '0.9',
    html: renderPage({
      path: t1Path,
      title: 'Universal MCP Config Builder & Live Streamable HTTP Tester — AgentDomains',
      description: 'Generate verified MCP configs for Claude Code, Cursor, VS Code, Windsurf, Codex, Zed, and Python/TS SDKs plus test live Streamable HTTP initialize handshakes.',
      activeNav: 'tools',
      breadcrumbs: t1Bc,
      extraScripts: ['/assets/tool-mcp-builder.js'],
      jsonLdGraph: [
        breadcrumbSchema(t1Bc, t1Url),
        {
          '@type': 'WebApplication',
          '@id': `${t1Url}#webapp`,
          name: 'Universal MCP Config Builder',
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Any (Browser)',
          url: t1Url,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        faqSchema(t1Faqs, t1Url),
      ],
      bodyHtml: t1Html,
    }),
  });

  // Tool 2: /tools/dns-ssl-checker
  const t2Path = '/tools/dns-ssl-checker';
  const t2Url = `${SITE}${t2Path}`;
  const t2Bc = [
    { name: 'Home', url: '/' },
    { name: 'Free Tools', url: '/tools' },
    { name: 'DNS Propagation & ACME DNS-01 Debugger', url: t2Path },
  ];
  const t2Faqs = [
    {
      q: 'Which public resolvers does this DNS checker query?',
      a: 'It queries Cloudflare DoH (https://cloudflare-dns.com/dns-query) and Google Public DNS DoH (https://dns.google/resolve) directly from your browser in parallel and compares their answers for propagation consistency.',
    },
    {
      q: 'How does the ACME DNS-01 check work?',
      a: 'It automatically queries TXT records at _acme-challenge.<hostname> on both Cloudflare and Google resolvers and highlights whether an active ACME verification token is visible globally.',
    },
  ];
  const t2Html = `
    <span class="eyebrow">Free Tool 02 · Live Dual-Resolver DoH Debugger</span>
    <h1>DNS Propagation &amp; <span class="g">ACME DNS-01</span> Checker</h1>
    <p class="lede">Inspect live <code>A</code>, <code>AAAA</code>, <code>CNAME</code>, <code>TXT</code>, <code>NS</code>, and <code>_acme-challenge</code> records across Cloudflare (<code>1.1.1.1</code>) and Google (<code>8.8.8.8</code>) simultaneously using CORS-enabled DNS-over-HTTPS.</p>

    <div class="widget" id="dns-checker-app">
      <form id="dc-form" class="widget-grid" style="align-items:end">
        <div class="field" style="grid-column:span 2">
          <label for="dc-host">Hostname or Subdomain</label>
          <input id="dc-host" type="text" value="agentdomains.co" placeholder="myapp.makes.fyi">
        </div>
        <div class="field">
          <label for="dc-expected">Optional Expected ACME TXT Token</label>
          <input id="dc-expected" type="text" placeholder="Optional exact token match check">
        </div>
        <div class="field">
          <button type="submit" class="btn" style="width:100%;justify-content:center" id="dc-run">Run Live DoH Check →</button>
        </div>
      </form>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.6rem">
        <button type="button" class="copy-btn" style="background:#fff" data-dc-sample="agentdomains.co">Try agentdomains.co</button>
        <button type="button" class="copy-btn" style="background:#fff" data-dc-sample="mcp.agentdomains.co">Try mcp.agentdomains.co</button>
        <button type="button" class="copy-btn" style="background:#fff" data-dc-sample="makes.fyi">Try makes.fyi</button>
      </div>
      <div class="status-line status-dim" id="dc-status">Enter any domain or subdomain and click Run Live DoH Check.</div>
    </div>

    <div id="dc-summary" class="grid two"></div>
    <div id="dc-results" class="grid"></div>

    <div class="panel accent" style="margin-top:1.5rem">
      <strong>Need to publish an ACME DNS-01 challenge?</strong> With AgentDomains run <code>agentdomains txt &lt;label&gt; &lt;token&gt;</code> or invoke the <code>add_acme_challenge</code> MCP tool, wait 5 seconds, and re-run this debugger to confirm both 1.1.1.1 and 8.8.8.8 match.
    </div>

    ${renderFaqs(t2Faqs)}
  `;

  pages.push({
    path: t2Path,
    priority: '0.9',
    html: renderPage({
      path: t2Path,
      title: 'Live DNS Propagation & ACME DNS-01 Checker (1.1.1.1 + 8.8.8.8 DoH) — AgentDomains',
      description: 'Free browser DNS and ACME DNS-01 debugger querying Cloudflare 1.1.1.1 and Google 8.8.8.8 DoH for A, AAAA, CNAME, TXT, NS, and _acme-challenge records.',
      activeNav: 'tools',
      breadcrumbs: t2Bc,
      extraScripts: ['/assets/tool-dns-checker.js'],
      jsonLdGraph: [
        breadcrumbSchema(t2Bc, t2Url),
        {
          '@type': 'WebApplication',
          '@id': `${t2Url}#webapp`,
          name: 'DNS Propagation & ACME DNS-01 Checker',
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Any (Browser)',
          url: t2Url,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        faqSchema(t2Faqs, t2Url),
      ],
      bodyHtml: t2Html,
    }),
  });

  // Tool 3: /tools/domain-cost-calculator
  const t3Path = '/tools/domain-cost-calculator';
  const t3Url = `${SITE}${t3Path}`;
  const t3Bc = [
    { name: 'Home', url: '/' },
    { name: 'Free Tools', url: '/tools' },
    { name: 'Agent Hostname & Domain TCO Calculator', url: t3Path },
  ];
  const t3Faqs = [
    {
      q: 'Why does the calculator sometimes recommend Porkbun or Cloudflare Registrar instead of AgentDomains?',
      a: 'Because AgentDomains is a managed subdomain service (*.makes.fyi and *.agentdomains.co), not a registrar. Whenever you check "Need transferable .com ownership", the calculator honestly recommends Cloudflare Registrar or Porkbun.',
    },
    {
      q: 'What pricing assumptions are used in the chart?',
      a: 'AgentDomains: $0 for 30-day trial (up to 10 names) or $10/yr Pro (up to 100 names). Cloudflare Registrar: ~$10.44/yr per .com. Porkbun: ~$11.08/yr per .com. Namecheap: ~$15.88/yr renewal per .com. ngrok: $96/yr base Personal seat + paid tier scaling. x402 Crypto Registrar (agentdomain.app reference): $59/yr Starter + ~$25/domain.',
    },
  ];
  const t3Html = `
    <span class="eyebrow">Free Tool 03 · Transparent Multi-Provider TCO</span>
    <h1>Agent Hostname &amp; <span class="g">Domain TCO</span> Calculator</h1>
    <p class="lede">Estimate real total cost across 1 to 100 AI agent projects, demos, and staging URLs — with an honest architectural recommendation that tells you when to buy a real <code>.com</code> at Cloudflare Registrar or Porkbun instead.</p>

    <div class="widget" id="cost-calc-app">
      <div class="widget-grid">
        <div class="field">
          <label for="cc-projects">Number of Projects / Hostnames: <span id="cc-projects-val" class="pill lime">12</span></label>
          <input id="cc-projects" type="range" min="1" max="100" value="12">
        </div>
        <div class="field">
          <label for="cc-lifespan">Project Lifespan</label>
          <select id="cc-lifespan">
            <option value="trial">30-Day Sprint / Hackathon</option>
            <option value="1yr" selected>1 Year (Ongoing Prototypes)</option>
            <option value="3yr">3 Years (Long-Lived Portfolio)</option>
          </select>
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:1rem;margin:.8rem 0 1.2rem">
        <label style="display:flex;align-items:center;gap:.45rem;font-weight:600;cursor:pointer">
          <input type="checkbox" id="cc-need-tld"> Must own transferable <code>.com</code> (brand / WHOIS / transfer-out)
        </label>
        <label style="display:flex;align-items:center;gap:.45rem;font-weight:600;cursor:pointer">
          <input type="checkbox" id="cc-need-proxy" checked> Need built-in edge HTTPS reverse proxy
        </label>
        <label style="display:flex;align-items:center;gap:.45rem;font-weight:600;cursor:pointer">
          <input type="checkbox" id="cc-need-mcp" checked> Need hosted MCP server for AI agents
        </label>
        <label style="display:flex;align-items:center;gap:.45rem;font-weight:600;cursor:pointer">
          <input type="checkbox" id="cc-need-acme"> Need ACME DNS-01 TXT automation
        </label>
      </div>

      <div class="panel" id="cc-verdict" style="margin:1rem 0"></div>

      <div class="diagram-box" id="cc-chart-box" style="margin:1rem 0 0"></div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Estimated Total Cost</th>
            <th>Type</th>
            <th>Key Fit Note</th>
          </tr>
        </thead>
        <tbody id="cc-table-body"></tbody>
      </table>
    </div>

    <div class="btn-row">
      <a class="btn" href="/compare">Read Full Sourced Comparison →</a>
      <a class="btn ghost" href="/pricing">View AgentDomains Pricing</a>
    </div>

    ${renderFaqs(t3Faqs)}
  `;

  pages.push({
    path: t3Path,
    priority: '0.9',
    html: renderPage({
      path: t3Path,
      title: 'Agent Hostname & Domain TCO Calculator (1–100 Projects) — AgentDomains',
      description: 'Compare 30-day, 1-year, and 3-year costs across AgentDomains, Cloudflare Registrar, Porkbun, Namecheap, ngrok, and x402 registrars with a live SVG chart.',
      activeNav: 'tools',
      breadcrumbs: t3Bc,
      extraScripts: ['/assets/tool-cost-calc.js'],
      jsonLdGraph: [
        breadcrumbSchema(t3Bc, t3Url),
        {
          '@type': 'WebApplication',
          '@id': `${t3Url}#webapp`,
          name: 'Agent Hostname & Domain TCO Calculator',
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Any (Browser)',
          url: t3Url,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        faqSchema(t3Faqs, t3Url),
      ],
      bodyHtml: t3Html,
    }),
  });

  return pages;
}
