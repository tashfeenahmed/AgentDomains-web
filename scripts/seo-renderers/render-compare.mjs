import {
  SITE,
  esc,
  renderPage,
  breadcrumbSchema,
  faqSchema,
  codeBox,
  renderFaqs,
} from '../seo-lib/layout.mjs';
import { COMPARE_RIVALS } from '../seo-data/compare.mjs';

export function buildComparePages() {
  const pages = [];

  COMPARE_RIVALS.forEach((r, idx) => {
    const pagePath = `/compare/${r.slug}`;
    const pageUrl = `${SITE}${pagePath}`;
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Compare', url: '/compare' },
      { name: `vs ${r.name}`, url: pagePath },
    ];

    const faqs = [
      {
        q: `Does AgentDomains replace ${r.name} for buying a .com domain?`,
        a: `No. AgentDomains provides managed subdomains under agentdomains.co and makes.fyi — not transferable ICANN second-level domains. If you must legally own and transfer a .com brand name, use a registrar like Cloudflare Registrar or Porkbun.`,
      },
      {
        q: `How does pricing compare between AgentDomains and ${r.name}?`,
        a: `AgentDomains starts with a 30-day free trial (10 names, no card) and Pro is $10/yr ($1/mo) for up to 100 names with zero bandwidth bills. ${r.name}: ${r.pricingSummary}.`,
      },
      {
        q: `Can an AI agent switch from ${r.name} to AgentDomains via MCP?`,
        a: `Yes. Connect your agent to https://mcp.agentdomains.co (or npx -y agentdomains-mcp) and use signup, claim_domain, and set_proxy or add_dns_record.`,
      },
    ];

    const related = COMPARE_RIVALS.slice(idx + 1, idx + 5)
      .concat(COMPARE_RIVALS.slice(0, Math.max(0, 4 - (COMPARE_RIVALS.length - 1 - idx))))
      .filter((x) => x.slug !== r.slug)
      .slice(0, 4);

    const bodyHtml = `
      <span class="eyebrow">Cluster 03 · Honest Head-to-Head Comparison</span>
      <h1>AgentDomains vs <span class="g">${esc(r.name)}</span></h1>
      <p class="lede">An honest, citation-backed breakdown of AgentDomains vs ${esc(r.name)} (<code>${esc(r.domain)}</code>) for AI agent deployments, DNS automation, edge HTTPS proxying, and 1-year total cost.</p>
      <div class="meta-strip">
        <span class="pill green">Category: ${esc(r.category)}</span>
        <span class="pill">AgentDomains: Managed Subdomains</span>
        <span class="pill lime">Free 30-Day Trial · Pro $10/yr</span>
      </div>

      <div class="panel warn">
        <strong>Up-front caveat:</strong> AgentDomains issues <strong>managed subdomains</strong> (<code>*.makes.fyi</code> and <code>*.agentdomains.co</code>), <em>not</em> transferable second-level <code>.com</code> registrations and not application hosting. Read the trade-offs below before choosing.
      </div>

      <h2>1. Side-by-Side <span class="g">Feature &amp; Cost Table</span></h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Dimension</th>
              <th>AgentDomains</th>
              <th>${esc(r.name)} (${esc(r.domain)})</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Pricing Model</strong></td>
              <td>30-day free trial (10 names, no card); Pro <strong>$10/yr</strong> or $1/mo (100 names)</td>
              <td>${esc(r.pricingSummary)}</td>
            </tr>
            <tr>
              <td><strong>Writable DNS Records</strong></td>
              <td class="yes">Yes — A, AAAA, CNAME, TXT (+ NS delegation)</td>
              <td>${esc(r.writableDns)}</td>
            </tr>
            <tr>
              <td><strong>Edge HTTPS Reverse Proxy</strong></td>
              <td class="yes">Yes — built-in TLS termination &amp; URL forwarding</td>
              <td>${esc(r.edgeHttpsProxy)}</td>
            </tr>
            <tr>
              <td><strong>ACME DNS-01 Support</strong></td>
              <td class="yes">Yes — dedicated <code>agentdomains txt</code> &amp; <code>add_acme_challenge</code></td>
              <td>${esc(r.acmeDns01)}</td>
            </tr>
            <tr>
              <td><strong>Hosted MCP Server</strong></td>
              <td class="yes">Yes — 20 tools at <code>mcp.agentdomains.co</code> &amp; stdio</td>
              <td>${esc(r.mcpServer)}</td>
            </tr>
            <tr>
              <td><strong>Card-Free Trial / Onboarding</strong></td>
              <td class="yes">Yes — anonymous <code>signup</code>, email confirm only on first claim</td>
              <td>${esc(r.cardFreeTrial)}</td>
            </tr>
            <tr>
              <td><strong>1-Year Cost (10 Names)</strong></td>
              <td><strong>$10/yr</strong> Pro (or $0 for 30-day trial)</td>
              <td>${esc(r.cost10)}</td>
            </tr>
            <tr>
              <td><strong>1-Year Cost (100 Names)</strong></td>
              <td><strong>$10/yr</strong> Pro (all 100 included)</td>
              <td>${esc(r.cost100)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style="font-size:.88rem;color:var(--muted)"><em>Source note: ${esc(r.sourceNote)}</em></p>

      <h2>2. Interactive <span class="g">Project-Count Cost Diff</span></h2>
      <div class="widget" data-cost-slider data-rival-name="${esc(r.name)}" data-rival-model="${esc(r.rivalModel)}" data-rival-unit="${esc(r.rivalUnit)}" data-rival-flat="${esc(r.rivalFlat)}">
        <div class="widget-head">
          <strong>Slide to estimate 1-year cost across projects</strong>
          <span class="pill lime" data-count-out>10 projects</span>
        </div>
        <div class="field" style="margin-bottom:1rem">
          <label for="tco-range">Number of agent projects / hostnames (1 – 100)</label>
          <input id="tco-range" type="range" min="1" max="100" value="10">
        </div>
        <div class="grid two" style="margin:.6rem 0">
          <div class="panel" style="margin:0">
            <div class="kicker">AgentDomains</div>
            <div style="font-family:'Space Mono',monospace;font-weight:700" data-ad-cost></div>
          </div>
          <div class="panel" style="margin:0">
            <div class="kicker">${esc(r.name)} (Est.)</div>
            <div style="font-family:'Space Mono',monospace;font-weight:700" data-rival-cost></div>
          </div>
        </div>
        <div class="status-line" data-diff-out></div>
        <div style="margin-top:.75rem">
          <a class="btn sm ghost" href="/tools/domain-cost-calculator">Open Full Multi-Provider TCO Calculator →</a>
        </div>
      </div>

      <h2>3. Honest Verdict: <span class="g">Which Should You Choose?</span></h2>
      <div class="grid two">
        <div class="panel">
          <h3>Choose ${esc(r.name)} if…</h3>
          <ul>
            ${r.chooseRival.map((item) => `<li>${esc(item)}</li>`).join('\n            ')}
          </ul>
        </div>
        <div class="panel mint">
          <h3>Choose AgentDomains if…</h3>
          <ul>
            ${r.chooseUs.map((item) => `<li>${esc(item)}</li>`).join('\n            ')}
          </ul>
        </div>
      </div>

      <h2>4. Quick <span class="g">Migration CLI Commands</span></h2>
      <p>Try AgentDomains side-by-side with ${esc(r.name)} in 30 seconds — no card required:</p>
      ${codeBox(`Switch a project from ${r.name} to AgentDomains`, r.migrationSteps.join('\n'))}

      <div class="btn-row">
        <a class="btn" href="/compare">Full 11-Provider Matrix →</a>
        <a class="btn ghost" href="/compare/paid-rivals">vs Paid Agent Registrars</a>
        <a class="btn ghost" href="/mcp">Connect MCP Client</a>
      </div>

      ${renderFaqs(faqs)}

      <h2>More <span class="g">Comparisons</span></h2>
      <div class="grid">
        ${related
          .map(
            (x) => `<a class="card" href="/compare/${esc(x.slug)}">
          <span class="kicker">${esc(x.category)}</span>
          <h3>AgentDomains vs ${esc(x.name)}</h3>
          <p>${esc(x.pricingSummary)}</p>
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
        title: `AgentDomains vs ${r.name} (${r.domain}) — Honest Cost, DNS & MCP Comparison`,
        description: `Honest comparison of AgentDomains vs ${r.name}: writable DNS, edge HTTPS proxy, ACME DNS-01, MCP server, and 1-year cost for 10 to 100 projects.`,
        activeNav: 'compare',
        breadcrumbs,
        jsonLdGraph: [
          breadcrumbSchema(breadcrumbs, pageUrl),
          {
            '@type': 'WebPage',
            '@id': `${pageUrl}#webpage`,
            url: pageUrl,
            name: `AgentDomains vs ${r.name}`,
            isPartOf: { '@id': `${SITE}/#website` },
            mainEntity: { '@id': `${pageUrl}#items` },
          },
          {
            '@type': 'ItemList',
            '@id': `${pageUrl}#items`,
            name: `AgentDomains vs ${r.name} comparison`,
            numberOfItems: 2,
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'AgentDomains', url: `${SITE}/` },
              { '@type': 'ListItem', position: 2, name: r.name, url: `https://${r.domain}/` },
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
