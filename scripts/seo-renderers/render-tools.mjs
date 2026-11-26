import {
  SITE,
  esc,
  renderPage,
  breadcrumbSchema,
  faqSchema,
  renderFaqs,
} from '../seo-lib/layout.mjs';
import { renderSpecStrip } from '../seo-lib/visuals.mjs';

function renderToolFlowSvg(title, leftBox, midBox, rightBox, caption) {
  return `<div class="diagram-box">
  <svg viewBox="0 0 880 156" width="880" height="156" role="img" aria-label="${esc(title)}">
    <defs>
      <marker id="arr-tl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#00CC74" stroke="#0A0A0A" stroke-width="1"/>
      </marker>
    </defs>

    <rect x="16" y="24" width="246" height="106" rx="14" fill="#0A0A0A"/>
    <rect x="10" y="18" width="246" height="106" rx="14" fill="#EFFCF5" stroke="#0A0A0A" stroke-width="2.5"/>
    <rect x="24" y="30" width="74" height="20" rx="5" fill="#C6F24E" stroke="#0A0A0A" stroke-width="1.8"/>
    <text x="61" y="44" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#0A0A0A">${esc(leftBox.tag)}</text>
    <text x="24" y="76" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="16" fill="#0A0A0A">${esc(leftBox.title)}</text>
    <text x="24" y="100" font-family="Space Mono,monospace" font-size="10.5" fill="#00A85E">${esc(leftBox.sub)}</text>

    <line x1="260" y1="71" x2="312" y2="71" stroke="#0A0A0A" stroke-width="3" marker-end="url(#arr-tl)"/>

    <rect x="322" y="24" width="246" height="106" rx="14" fill="#00CC74"/>
    <rect x="316" y="18" width="246" height="106" rx="14" fill="#C6F24E" stroke="#0A0A0A" stroke-width="2.5"/>
    <rect x="330" y="30" width="84" height="20" rx="5" fill="#0A0A0A"/>
    <text x="372" y="44" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#C6F24E">${esc(midBox.tag)}</text>
    <text x="330" y="76" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="16" fill="#0A0A0A">${esc(midBox.title)}</text>
    <text x="330" y="100" font-family="Space Mono,monospace" font-size="10.5" fill="#0A0A0A">${esc(midBox.sub)}</text>

    <line x1="566" y1="71" x2="618" y2="71" stroke="#0A0A0A" stroke-width="3" marker-end="url(#arr-tl)"/>

    <rect x="628" y="24" width="242" height="106" rx="14" fill="#0A0A0A"/>
    <rect x="622" y="18" width="242" height="106" rx="14" fill="#FFFFFF" stroke="#0A0A0A" stroke-width="2.5"/>
    <rect x="636" y="30" width="78" height="20" rx="5" fill="#00CC74" stroke="#0A0A0A" stroke-width="1.8"/>
    <text x="675" y="44" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#0A0A0A">${esc(rightBox.tag)}</text>
    <text x="636" y="76" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="16" fill="#0A0A0A">${esc(rightBox.title)}</text>
    <text x="636" y="100" font-family="Space Mono,monospace" font-size="10.5" fill="#00A85E">${esc(rightBox.sub)}</text>
  </svg>
  <p class="diagram-caption">${esc(caption)}</p>
</div>`;
}

function renderStepPills(steps) {
  return `<div class="step-pills" role="list" aria-label="Tool steps">
  ${steps
    .map(
      (s, i) => `${i > 0 ? '<span class="step-arrow" aria-hidden="true">→</span>' : ''}
  <span class="step-pill" role="listitem"><span class="num">${String(i + 1).padStart(2, '0')}</span>${esc(s)}</span>`
    )
    .join('')}
</div>`;
}

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
    <p class="lede">Run three free client-side tools in your browser. Build MCP configs, debug live DNS over DoH, and compare domain costs.</p>
    ${renderSpecStrip([
      { icon: 'bolt', label: 'Browser Tools', value: '3 Live Apps', tone: 'green' },
      { icon: 'lock', label: 'Privacy', value: '100% Client-Side' },
      { icon: 'card', label: 'Login Needed', value: 'None', tone: 'lime' },
      { icon: 'globe', label: 'Live Checks', value: 'MCP + 1.1.1.1 + 8.8.8.8' },
    ])}
    ${renderToolFlowSvg(
      'Client-side developer tools overview',
      { tag: 'TOOL 01', title: 'MCP Config Builder', sub: '12+ clients · Live handshake' },
      { tag: 'TOOL 02', title: 'DNS & ACME Checker', sub: '1.1.1.1 + 8.8.8.8 DoH' },
      { tag: 'TOOL 03', title: 'Domain TCO Math', sub: '1–100 projects · SVG chart' },
      'Every tool runs in your browser with direct HTTPS calls and zero backend tracking.'
    )}
    <div class="grid">
      <a class="card" href="/tools/mcp-config-builder">
        <div class="card-top">
          <span class="kicker">Tool 01 · MCP + Handshake</span>
          <span class="card-icon">01</span>
        </div>
        <h3>Universal MCP Config Builder</h3>
        <p>Pick any AI client and generate exact JSON, TOML, YAML, or SDK configs. Run a live <code>initialize</code> handshake test.</p>
        <span class="btn sm" style="align-self:flex-start;margin-top:.6rem">Launch Builder →</span>
      </a>
      <a class="card" href="/tools/dns-ssl-checker">
        <div class="card-top">
          <span class="kicker">Tool 02 · Live DoH Debugger</span>
          <span class="card-icon">02</span>
        </div>
        <h3>DNS Propagation &amp; ACME DNS-01 Checker</h3>
        <p>Query Cloudflare <code>1.1.1.1</code> and Google <code>8.8.8.8</code> together for A, AAAA, CNAME, TXT, NS, and ACME records.</p>
        <span class="btn sm" style="align-self:flex-start;margin-top:.6rem">Launch Debugger →</span>
      </a>
      <a class="card" href="/tools/domain-cost-calculator">
        <div class="card-top">
          <span class="kicker">Tool 03 · Honest TCO Math</span>
          <span class="card-icon">03</span>
        </div>
        <h3>Agent Hostname &amp; Domain TCO Calculator</h3>
        <p>Slide from 1 to 100 projects and compare real yearly costs across 6 providers on a live SVG chart.</p>
        <span class="btn sm" style="align-self:flex-start;margin-top:.6rem">Launch Calculator →</span>
      </a>
    </div>
  `;

  pages.push({
    path: hubPath,
    priority: '0.9',
    html: renderPage({
      path: hubPath,
      title: 'Free MCP, DNS & Domain Tools — AgentDomains',
      description: 'Three free browser tools: Universal MCP Config Builder with live handshake tester, DNS & ACME DNS-01 Debugger, and Domain TCO Calculator.',
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
      q: 'Does the handshake tester send my API key anywhere else?',
      a: 'No. Your browser posts directly to the MCP URL you enter. Nothing goes to any third-party server.',
    },
    {
      q: 'Why does the test work without an API key on mcp.agentdomains.co?',
      a: 'Discovery methods like initialize and tools/list are public on mcp.agentdomains.co. You can inspect all 20 tools before adding a key.',
    },
  ];
  const t1Html = `
    <span class="eyebrow">Free Tool 01 · Live Streamable HTTP Tester</span>
    <h1>Universal <span class="g">MCP Config Builder</span></h1>
    <p class="lede">Build exact Streamable HTTP or stdio configs for 12+ AI clients. Test a live JSON-RPC handshake directly from your browser.</p>
    ${renderSpecStrip([
      { icon: 'plug', label: 'Clients', value: '12+ Formats', tone: 'green' },
      { icon: 'bolt', label: 'Live Test', value: 'initialize + list' },
      { icon: 'lock', label: 'Key Safety', value: 'Browser Only', tone: 'lime' },
      { icon: 'check', label: 'Deeplinks', value: 'Cursor & VS Code' },
    ])}
    ${renderStepPills(['Pick client & transport', 'Copy snippet or 1-click install', 'Run live handshake test'])}
    ${renderToolFlowSvg(
      'MCP Config Builder direct browser handshake flow',
      { tag: 'BROWSER', title: 'Select Client', sub: 'JSON / TOML / YAML / SDK' },
      { tag: 'POST', title: 'JSON-RPC 2.0', sub: 'initialize + tools/list' },
      { tag: 'RESULT', title: 'Verified Tools', sub: 'Latency + 20 tool names' },
      'Your browser sends JSON-RPC directly to the target MCP endpoint over HTTPS.'
    )}

    <div class="widget" id="mcp-builder-app">
      <div class="widget-head">
        <strong>1. Configure Client &amp; Server</strong>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap" id="mcp-deeplinks"></div>
      </div>
      <div class="widget-grid mb-row-4">
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
      </div>
      <div class="widget-grid mb-row-2">
        <div class="field">
          <label for="mb-url">Streamable HTTP Endpoint URL</label>
          <input id="mb-url" type="url" value="https://mcp.agentdomains.co">
        </div>
        <div class="field">
          <label for="mb-token">Bearer Token / API Key (optional)</label>
          <input id="mb-token" type="text" placeholder="adom_... (leave blank for anonymous test)">
        </div>
      </div>
      <div class="widget-grid mb-row-2">
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
      <p style="font-size:.92rem;color:var(--muted)">Send live JSON-RPC <code>initialize</code> and <code>tools/list</code> requests straight from your browser to test CORS and tool discovery.</p>
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
      title: 'Universal MCP Config Builder & Tester — AgentDomains',
      description: 'Build verified MCP configs for Claude Code, Cursor, VS Code, Windsurf, Codex, Zed, and SDKs. Test live Streamable HTTP handshakes.',
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
      a: 'It queries Cloudflare DoH (1.1.1.1) and Google DoH (8.8.8.8) in parallel. Then it compares both answers for sync.',
    },
    {
      q: 'How does the ACME DNS-01 check work?',
      a: 'It queries TXT records at _acme-challenge.<hostname> on both resolvers and highlights active tokens.',
    },
  ];
  const t2Html = `
    <span class="eyebrow">Free Tool 02 · Live Dual-Resolver DoH Debugger</span>
    <h1>DNS Propagation &amp; <span class="g">ACME DNS-01</span> Checker</h1>
    <p class="lede">Check live <code>A</code>, <code>AAAA</code>, <code>CNAME</code>, <code>TXT</code>, <code>NS</code>, and <code>_acme-challenge</code> records across Cloudflare and Google DoH.</p>
    ${renderSpecStrip([
      { icon: 'globe', label: 'Resolvers', value: '1.1.1.1 + 8.8.8.8', tone: 'green' },
      { icon: 'layers', label: 'Record Types', value: '6 Live Checks' },
      { icon: 'lock', label: 'ACME Mode', value: 'TXT Token Match', tone: 'lime' },
      { icon: 'bolt', label: 'Protocol', value: 'Browser DoH' },
    ])}
    ${renderStepPills(['Enter hostname', 'Optional ACME token', 'Compare 1.1.1.1 vs 8.8.8.8'])}
    ${renderToolFlowSvg(
      'Dual-resolver DNS over HTTPS lookup flow',
      { tag: 'INPUT', title: 'Hostname + Token', sub: 'myapp.agentdomains.co' },
      { tag: 'DOH API', title: 'Dual Query', sub: 'Cloudflare + Google' },
      { tag: 'SYNC', title: 'Diff & ACME Pass', sub: 'TTL + token verification' },
      'Queries run in parallel directly from your browser over HTTPS with zero server proxy.'
    )}

    <div class="widget" id="dns-checker-app">
      <form id="dc-form" class="widget-grid" style="align-items:end">
        <div class="field" style="grid-column:span 2">
          <label for="dc-host">Hostname or Subdomain</label>
          <input id="dc-host" type="text" value="agentdomains.co" placeholder="myapp.agentdomains.co">
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
      <strong>Publish an ACME token fast:</strong> Run <code>agentdomains txt &lt;label&gt; &lt;token&gt; --domain agentdomains.co</code> or call <code>add_acme_challenge</code>. Wait 5 seconds and re-run this check.
    </div>

    ${renderFaqs(t2Faqs)}
  `;

  pages.push({
    path: t2Path,
    priority: '0.9',
    html: renderPage({
      path: t2Path,
      title: 'Live DNS & ACME DNS-01 Checker — AgentDomains',
      description: 'Free browser DNS and ACME DNS-01 debugger querying Cloudflare 1.1.1.1 and Google 8.8.8.8 DoH for A, AAAA, CNAME, TXT, NS, and ACME records.',
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
      q: 'Why does this tool sometimes suggest Cloudflare Registrar or Porkbun?',
      a: 'AgentDomains provides managed subdomains, not transferable .com domains. If you need full TLD ownership, buy from a real registrar.',
    },
    {
      q: 'What pricing numbers power the live chart?',
      a: 'AgentDomains Pro is $10/yr (100 names). Cloudflare is $10.44/yr per .com, Porkbun $11.08/yr, Namecheap $15.88/yr renewal, ngrok $96/yr base, and x402 $59/yr + $25/domain.',
    },
  ];
  const t3Html = `
    <span class="eyebrow">Free Tool 03 · Transparent Multi-Provider TCO</span>
    <h1>Agent Hostname &amp; <span class="g">Domain TCO</span> Calculator</h1>
    <p class="lede">Estimate real costs across 1 to 100 agent projects. See an honest verdict telling you when to buy a real <code>.com</code> instead.</p>
    ${renderSpecStrip([
      { icon: 'tag', label: 'Scale', value: '1–100 Projects', tone: 'green' },
      { icon: 'layers', label: 'Providers', value: '6 Compared' },
      { icon: 'bolt', label: 'Output', value: 'Live SVG Chart', tone: 'lime' },
      { icon: 'check', label: 'Verdict', value: 'Honest Fit Check' },
    ])}
    ${renderStepPills(['Set project count', 'Check required features', 'Inspect live SVG chart'])}
    ${renderToolFlowSvg(
      'Multi-provider domain cost calculator flow',
      { tag: 'SLIDER', title: '1–100 Projects', sub: '30 days · 1 yr · 3 yrs' },
      { tag: 'RULES', title: 'Feature Fit', sub: '.com TLD · Proxy · MCP' },
      { tag: 'CHART', title: 'Live SVG Math', sub: '6 providers side-by-side' },
      'Adjust the slider and checkboxes below to update the SVG cost chart and verdict live.'
    )}

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
      title: 'Agent Domain Cost (TCO) Calculator — AgentDomains',
      description: 'Compare 30-day, 1-year, and 3-year costs across AgentDomains, Cloudflare, Porkbun, Namecheap, ngrok, and x402 with a live SVG chart.',
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
