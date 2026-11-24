import {
  SITE,
  esc,
  renderPage,
  breadcrumbSchema,
  faqSchema,
  codeBox,
  renderFaqs,
} from '../seo-lib/layout.mjs';
import { renderSpecStrip, trunc } from '../seo-lib/visuals.mjs';
import { COMPARE_RIVALS } from '../seo-data/compare.mjs';

function capBadge(val) {
  const s = String(val ?? '').trim();
  const low = s.toLowerCase();
  if (low.startsWith('no') || low.startsWith('none') || low.startsWith('blocked') || low.startsWith('not ')) {
    return `<div class="cap-cell"><span class="cap-badge cap-no" aria-hidden="true">✕</span><span>${esc(s)}</span></div>`;
  }
  if (low.startsWith('yes')) {
    return `<div class="cap-cell"><span class="cap-badge cap-yes" aria-hidden="true">✓</span><span>${esc(s)}</span></div>`;
  }
  return `<div class="cap-cell"><span class="cap-badge cap-mid" aria-hidden="true">~</span><span>${esc(s)}</span></div>`;
}

function renderCostBarSvg(r) {
  const ad10 = 10;
  let rival10 = 0;
  let rivalLabel = '$0/yr (free tier — see caps)';
  if (r.rivalModel === 'free') {
    rival10 = 0;
    rivalLabel = trunc(r.cost10, 34);
  } else {
    rival10 = Math.round((Number(r.rivalFlat || 0) + Number(r.rivalUnit || 0) * 10) * 100) / 100;
    rivalLabel = `$${rival10.toFixed(0)}/yr est. (10 names)`;
  }

  const maxVal = Math.max(ad10, rival10, 50);
  const maxBarW = 410;
  const adW = Math.max(24, Math.round((ad10 / maxVal) * maxBarW));
  const rivW = rival10 === 0 ? 18 : Math.max(24, Math.round((rival10 / maxVal) * maxBarW));
  const rivFill = rival10 === 0 ? '#E5E7EB' : '#FEE2E2';
  const rivStroke = rival10 === 0 ? '#0A0A0A' : '#991B1B';

  return `<div class="diagram-box">
  <svg viewBox="0 0 880 185" width="880" height="185" role="img" aria-label="1-year cost bar chart for 10 hostnames: AgentDomains $10/yr versus ${esc(r.name)}">
    <text x="20" y="30" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="16" fill="#0A0A0A">1-Year Cost Comparison (10 Agent Hostnames)</text>
    <rect x="646" y="12" width="214" height="24" rx="6" fill="#EFFCF5" stroke="#0A0A0A" stroke-width="2"/>
    <text x="753" y="28" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10" fill="#007A43">30-DAY TRIAL: $0 (NO CARD)</text>

    <!-- Row 1: AgentDomains -->
    <text x="20" y="82" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="15" fill="#0A0A0A">AgentDomains Pro</text>
    <text x="20" y="99" font-family="Space Mono,monospace" font-size="10" fill="#00A85E">Covers up to 100 names</text>
    <rect x="204" y="64" width="${adW}" height="34" rx="8" fill="#0A0A0A"/>
    <rect x="200" y="60" width="${adW}" height="34" rx="8" fill="#00CC74" stroke="#0A0A0A" stroke-width="2.5"/>
    <text x="${214 + adW}" y="82" font-family="Space Mono,monospace" font-weight="700" font-size="13" fill="#0A0A0A">$10/yr (10 or 100 names)</text>

    <!-- Row 2: Rival -->
    <text x="20" y="142" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="15" fill="#0A0A0A">${esc(trunc(r.name, 19))}</text>
    <text x="20" y="159" font-family="Space Mono,monospace" font-size="10" fill="#525252">${esc(trunc(r.domain, 22))}</text>
    <rect x="204" y="124" width="${rivW}" height="34" rx="8" fill="#0A0A0A"/>
    <rect x="200" y="120" width="${rivW}" height="34" rx="8" fill="${rivFill}" stroke="${rivStroke}" stroke-width="2.5"/>
    <text x="${214 + rivW}" y="142" font-family="Space Mono,monospace" font-weight="700" font-size="12" fill="#0A0A0A">${esc(rivalLabel)}</text>
  </svg>
  <p class="diagram-caption">Estimated 1-year fee for 10 hostnames. AgentDomains Pro includes up to 100 managed subdomains for $10/yr total.</p>
</div>`;
}

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
        a: 'No. AgentDomains provides managed subdomains under makes.fyi and agentdomains.co. Buy a transferable .com at Cloudflare Registrar or Porkbun.',
      },
      {
        q: `How does pricing compare between AgentDomains and ${r.name}?`,
        a: `AgentDomains offers a 30-day free trial (10 names, no card) and $10/yr Pro (100 names). ${r.name}: ${r.cost10}.`,
      },
      {
        q: `Can an AI agent switch from ${r.name} to AgentDomains via MCP?`,
        a: 'Yes. Connect to https://mcp.agentdomains.co and call signup, claim_domain, and set_proxy or add_dns_record.',
      },
    ];

    const related = COMPARE_RIVALS.slice(idx + 1, idx + 5)
      .concat(COMPARE_RIVALS.slice(0, Math.max(0, 4 - (COMPARE_RIVALS.length - 1 - idx))))
      .filter((x) => x.slug !== r.slug)
      .slice(0, 4);

    const bodyHtml = `
      <span class="eyebrow">Cluster 03 · Honest Head-to-Head Comparison</span>
      <h1>AgentDomains vs <span class="g">${esc(r.name)}</span></h1>
      <p class="lede">Compare AgentDomains and ${esc(r.name)} (<code>${esc(r.domain)}</code>) on DNS control, HTTPS proxy, MCP tools, and 1-year cost.</p>
      ${renderSpecStrip([
        { icon: 'tag', label: 'AgentDomains Pro', value: '$10/yr (100 names)', tone: 'green' },
        { icon: 'globe', label: r.name + ' (10)', value: trunc(r.cost10, 20) },
        { icon: 'plug', label: 'Category', value: trunc(r.category, 20), tone: 'lime' },
        { icon: 'card', label: 'Trial Card', value: 'None Needed' },
      ])}

      ${renderCostBarSvg(r)}

      <div class="panel warn">
        <strong>Clear scope note:</strong> AgentDomains gives <strong>managed subdomains</strong> (<code>*.makes.fyi</code> and <code>*.agentdomains.co</code>). It does not sell transferable <code>.com</code> domains or app hosting.
      </div>

      <h2>1. Side-by-Side <span class="g">Capability Matrix</span></h2>
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
              <td><div class="cap-cell"><span class="cap-badge cap-yes" aria-hidden="true">✓</span><span>30-day free trial (10 names); Pro <strong>$10/yr</strong> (100 names)</span></div></td>
              <td>${esc(r.pricingSummary)}</td>
            </tr>
            <tr>
              <td><strong>Writable DNS Records</strong></td>
              <td class="yes"><div class="cap-cell"><span class="cap-badge cap-yes" aria-hidden="true">✓</span><span>A, AAAA, CNAME, TXT, and NS delegation</span></div></td>
              <td>${capBadge(r.writableDns)}</td>
            </tr>
            <tr>
              <td><strong>Edge HTTPS Reverse Proxy</strong></td>
              <td class="yes"><div class="cap-cell"><span class="cap-badge cap-yes" aria-hidden="true">✓</span><span>Built-in edge HTTPS and URL forwarding</span></div></td>
              <td>${capBadge(r.edgeHttpsProxy)}</td>
            </tr>
            <tr>
              <td><strong>ACME DNS-01 Support</strong></td>
              <td class="yes"><div class="cap-cell"><span class="cap-badge cap-yes" aria-hidden="true">✓</span><span>Dedicated <code>agentdomains txt</code> and <code>add_acme_challenge</code></span></div></td>
              <td>${capBadge(r.acmeDns01)}</td>
            </tr>
            <tr>
              <td><strong>Hosted MCP Server</strong></td>
              <td class="yes"><div class="cap-cell"><span class="cap-badge cap-yes" aria-hidden="true">✓</span><span>20 tools at <code>mcp.agentdomains.co</code> and stdio</span></div></td>
              <td>${capBadge(r.mcpServer)}</td>
            </tr>
            <tr>
              <td><strong>Card-Free Trial</strong></td>
              <td class="yes"><div class="cap-cell"><span class="cap-badge cap-yes" aria-hidden="true">✓</span><span>Instant <code>signup</code>; email confirm on first claim</span></div></td>
              <td>${capBadge(r.cardFreeTrial)}</td>
            </tr>
            <tr>
              <td><strong>1-Year Cost (10 Names)</strong></td>
              <td><strong>$10/yr</strong> Pro (or $0 for 30-day trial)</td>
              <td>${esc(r.cost10)}</td>
            </tr>
            <tr>
              <td><strong>1-Year Cost (100 Names)</strong></td>
              <td><strong>$10/yr</strong> Pro (all 100 names included)</td>
              <td>${esc(r.cost100)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style="font-size:.88rem;color:var(--muted)"><em>Source: ${esc(r.sourceNote)}</em></p>

      <h2>2. Interactive <span class="g">Project-Count Cost Diff</span></h2>
      <p>Slide from 1 to 100 projects to compare yearly fees between AgentDomains and ${esc(r.name)}.</p>
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

      <h2>3. Honest Verdict: <span class="g">Which Should You Pick?</span></h2>
      <div class="decision-grid">
        <div class="decision-card">
          <div class="decision-card-head">
            <h3>Pick ${esc(r.name)} if…</h3>
            <span class="badge checking">ALTERNATIVE</span>
          </div>
          <ul>
            ${r.chooseRival.map((item) => `<li>${esc(item)}</li>`).join('\n            ')}
          </ul>
        </div>
        <div class="decision-card recommended">
          <div class="decision-card-head">
            <h3>Pick AgentDomains if…</h3>
            <span class="badge free">AGENT-FIRST</span>
          </div>
          <ul>
            ${r.chooseUs.map((item) => `<li>${esc(item)}</li>`).join('\n            ')}
          </ul>
        </div>
      </div>

      <h2>4. Quick <span class="g">Migration CLI Commands</span></h2>
      <p>Test AgentDomains next to ${esc(r.name)} in 30 seconds with no credit card.</p>
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
        description: `Honest comparison of AgentDomains vs ${r.name}: writable DNS, edge HTTPS proxy, ACME DNS-01, MCP server, and 1-year cost.`,
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
