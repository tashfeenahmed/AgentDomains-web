import {
  SITE,
  esc,
  renderPage,
  breadcrumbSchema,
  codeBox,
} from '../seo-lib/layout.mjs';
import { USE_CASES } from '../seo-data/use-cases.mjs';

function renderFlowSvg(u) {
  const fqdn = `${u.label}.${u.domain}`;
  const midLabel =
    u.mode === 'record'
      ? 'Authoritative DNS (A Record)'
      : u.mode === 'acme'
        ? 'DNS-01 TXT (_acme-challenge)'
        : 'AgentDomains Edge HTTPS Proxy';
  const rightLabel = u.mode === 'record' || u.mode === 'acme' ? `Origin IP ${u.origin}` : u.origin;

  return `<svg viewBox="0 0 880 180" width="880" height="180" role="img" aria-label="DNS and TLS flow diagram for ${esc(u.name)}: Client to ${esc(fqdn)} to ${esc(rightLabel)}">
  <rect x="8" y="34" width="210" height="106" rx="14" fill="#EFFCF5" stroke="#0A0A0A" stroke-width="3"/>
  <text x="113" y="68" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="16" fill="#0A0A0A">1. AI Agent / Client</text>
  <text x="113" y="94" text-anchor="middle" font-family="Space Mono,monospace" font-size="12" fill="#00A85E">HTTPS / MCP JSON-RPC</text>
  <text x="113" y="116" text-anchor="middle" font-family="Space Mono,monospace" font-size="11" fill="#525252">TLS 1.3 · Port 443</text>

  <line x1="218" y1="87" x2="310" y2="87" stroke="#0A0A0A" stroke-width="3"/>
  <polygon points="310,80 324,87 310,94" fill="#00CC74" stroke="#0A0A0A" stroke-width="2"/>

  <rect x="328" y="24" width="244" height="126" rx="14" fill="#C6F24E" stroke="#0A0A0A" stroke-width="3"/>
  <text x="450" y="56" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="16" fill="#0A0A0A">2. ${esc(fqdn)}</text>
  <text x="450" y="84" text-anchor="middle" font-family="Space Mono,monospace" font-size="11" fill="#0A0A0A">${esc(midLabel)}</text>
  <text x="450" y="108" text-anchor="middle" font-family="Space Mono,monospace" font-size="11" fill="#0A0A0A">Cloudflare Edge · Valid Cert</text>
  <text x="450" y="130" text-anchor="middle" font-family="Space Mono,monospace" font-size="11" fill="#00A85E">200 OK Verified</text>

  <line x1="572" y1="87" x2="646" y2="87" stroke="#0A0A0A" stroke-width="3"/>
  <polygon points="646,80 660,87 646,94" fill="#00CC74" stroke="#0A0A0A" stroke-width="2"/>

  <rect x="664" y="34" width="208" height="106" rx="14" fill="#FFFFFF" stroke="#0A0A0A" stroke-width="3"/>
  <text x="768" y="68" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="16" fill="#0A0A0A">3. Your Origin</text>
  <text x="768" y="94" text-anchor="middle" font-family="Space Mono,monospace" font-size="11" fill="#00A85E">${esc(rightLabel)}</text>
  <text x="768" y="116" text-anchor="middle" font-family="Space Mono,monospace" font-size="11" fill="#525252">HTTP/2 · Raw Body Intact</text>
</svg>`;
}

export function buildUseCasePages() {
  const pages = [];

  // Hub: /use-cases
  const hubPath = '/use-cases';
  const hubUrl = `${SITE}${hubPath}`;
  const hubBreadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Agent Workflow Blueprints', url: hubPath },
  ];

  const hubHtml = `
    <span class="eyebrow">Cluster 04 · 30 Agent &amp; Vibe-Coding Blueprints</span>
    <h1>Agent Workflow <span class="g">Blueprints</span></h1>
    <p class="lede">End-to-end MCP tool transcripts, DNS/TLS flow diagrams, and GitHub Actions teardown scripts for webhooks, OAuth callbacks, PR previews, voice bots, and A2A agent endpoints.</p>
    <div class="hub-search">
      <input type="text" placeholder="Filter 30 workflows (e.g. stripe, oauth, pr, mcp, discord, voice)…" data-filter-input="usecases-grid" aria-label="Filter workflow blueprints">
      <span class="pill" id="usecases-grid-count">${USE_CASES.length} shown</span>
    </div>
    <div class="grid" id="usecases-grid">
      ${USE_CASES.map(
        (u) => `<a class="card" href="/use-cases/${esc(u.slug)}" data-search="${esc((u.name + ' ' + u.slug + ' ' + u.badge + ' ' + u.summary).toLowerCase())}">
        <span class="kicker">${esc(u.badge)}</span>
        <h3>${esc(u.name)}</h3>
        <p>${esc(u.summary)}</p>
      </a>`
      ).join('\n      ')}
    </div>
  `;

  pages.push({
    path: hubPath,
    priority: '0.9',
    html: renderPage({
      path: hubPath,
      title: 'AgentDomains Workflow Blueprints: 30 AI Agent, Webhook & Vibe-Coding Flows',
      description: 'Copy-paste MCP tool transcripts, SVG DNS/TLS diagrams, and CI teardown jobs for PR previews, Stripe webhooks, OAuth callbacks, bots, and remote MCP servers.',
      activeNav: 'use-cases',
      breadcrumbs: hubBreadcrumbs,
      ogType: 'website',
      jsonLdGraph: [
        breadcrumbSchema(hubBreadcrumbs, hubUrl),
        {
          '@type': 'CollectionPage',
          '@id': `${hubUrl}#page`,
          url: hubUrl,
          name: 'AgentDomains Workflow Blueprints',
          isPartOf: { '@id': `${SITE}/#website` },
        },
      ],
      bodyHtml: hubHtml,
    }),
  });

  // 30 blueprint pages
  USE_CASES.forEach((u, idx) => {
    const pagePath = `/use-cases/${u.slug}`;
    const pageUrl = `${SITE}${pagePath}`;
    const fqdn = `${u.label}.${u.domain}`;
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Workflow Blueprints', url: '/use-cases' },
      { name: u.name, url: pagePath },
    ];

    const step3Tool =
      u.mode === 'record'
        ? {
            name: 'add_dns_record',
            args: { label: u.label, domain: u.domain, type: 'A', content: u.origin },
            resp: { ok: true, id: 'rec_01j8x', fqdn, type: 'A', content: u.origin },
          }
        : u.mode === 'acme'
          ? {
              name: 'add_acme_challenge',
              args: { label: u.label, domain: u.domain, value: 'k9Lm2_acme_challenge_token' },
              resp: { ok: true, id: 'rec_acme1', host: `_acme-challenge.${fqdn}`, type: 'TXT' },
            }
          : {
              name: 'set_proxy',
              args: { label: u.label, domain: u.domain, origin: u.origin },
              resp: { ok: true, fqdn, origin: u.origin, https: `https://${fqdn}` },
            };

    const dflag = u.domain === 'makes.fyi' ? '' : ` --domain ${u.domain}`;
    const teardownGha = `name: Teardown ${u.label}
on:
  workflow_dispatch:
  pull_request:
    types: [closed]
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Delete AgentDomains hostname before destroying compute
        env:
          AGENTDOMAINS_API_KEY: \${{ secrets.AGENTDOMAINS_API_KEY }}
        run: |
          curl -fsSL -X DELETE \\
            -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
            "https://api.agentdomains.co/v1/subdomains/${u.label}${u.domain === 'makes.fyi' ? '' : '?domain=' + u.domain}"
      # Or with the Go CLI:
      # agentdomains delete ${u.label}${dflag}`;

    const related = USE_CASES.slice(idx + 1, idx + 5)
      .concat(USE_CASES.slice(0, Math.max(0, 4 - (USE_CASES.length - 1 - idx))))
      .filter((x) => x.slug !== u.slug)
      .slice(0, 4);

    const bodyHtml = `
      <span class="eyebrow">${esc(u.badge)} · Workflow Blueprint</span>
      <h1>${esc(u.name)} with <span class="g">AgentDomains</span></h1>
      <p class="lede">${esc(u.summary)}</p>
      <div class="meta-strip">
        <span class="pill green">Example Host: ${esc(fqdn)}</span>
        <span class="pill">4-Step MCP Transcript</span>
        <span class="pill lime">CI Teardown Included</span>
      </div>

      <div class="panel accent">
        <p style="margin:0">${esc(u.whyMatters)}</p>
      </div>

      <h2>1. DNS &amp; TLS <span class="g">Request Flow</span></h2>
      <div class="diagram-box">
        ${renderFlowSvg(u)}
      </div>

      <h2>2. 4-Step <span class="g">MCP Tool-Call Transcript</span></h2>
      <p>Here is the exact sequence an agent executes against <code>https://mcp.agentdomains.co</code> (or local stdio <code>npx -y agentdomains-mcp</code>):</p>
      <div class="transcript">
        <div class="step-card">
          <div><span class="step-num">STEP 1</span><strong>check_availability</strong></div>
          ${codeBox('MCP Call → check_availability', JSON.stringify({ tool: 'check_availability', arguments: { label: u.label, domain: u.domain } }, null, 2) + '\n// Response:\n' + JSON.stringify({ fqdn, available: true, reason: 'available' }, null, 2))}
        </div>
        <div class="step-card">
          <div><span class="step-num">STEP 2</span><strong>claim_domain</strong></div>
          ${codeBox('MCP Call → claim_domain', JSON.stringify({ tool: 'claim_domain', arguments: { label: u.label, domain: u.domain, email: 'ops@example.com' } }, null, 2) + '\n// Response:\n' + JSON.stringify({ fqdn, status: 'claimed', confirm_within_days: 30 }, null, 2))}
        </div>
        <div class="step-card">
          <div><span class="step-num">STEP 3</span><strong>${esc(step3Tool.name)}</strong></div>
          ${codeBox(`MCP Call → ${step3Tool.name}`, JSON.stringify({ tool: step3Tool.name, arguments: step3Tool.args }, null, 2) + '\n// Response:\n' + JSON.stringify(step3Tool.resp, null, 2))}
        </div>
        <div class="step-card">
          <div><span class="step-num">STEP 4</span><strong>Live Verification (200 OK)</strong></div>
          ${codeBox('Verify live HTTPS response', `curl -fsSI https://${fqdn}\n# HTTP/2 200\n# content-type: application/json\n# strict-transport-security: max-age=31536000`)}
        </div>
      </div>

      <h2>3. Clean <span class="g">Teardown (GitHub Action &amp; CLI)</span></h2>
      <p>${esc(u.teardownNote)} Always delete the DNS/proxy mapping before deleting your upstream cloud resource to prevent dangling subdomain takeovers.</p>
      ${codeBox('.github/workflows/teardown-domain.yml', teardownGha)}

      <div class="btn-row">
        <a class="btn" href="/mcp">Configure Your MCP Client →</a>
        <a class="btn ghost" href="/tools/dns-ssl-checker">Check Live DNS &amp; ACME</a>
      </div>

      <h2>More <span class="g">Workflow Blueprints</span></h2>
      <div class="grid">
        ${related
          .map(
            (r) => `<a class="card" href="/use-cases/${esc(r.slug)}">
          <span class="kicker">${esc(r.badge)}</span>
          <h3>${esc(r.name)}</h3>
          <p>${esc(r.summary)}</p>
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
        title: `${u.name} — AgentDomains MCP Workflow Blueprint`,
        description: `${u.summary} Includes a 4-step MCP tool transcript, DNS/TLS diagram, and GitHub Actions teardown script.`,
        activeNav: 'use-cases',
        breadcrumbs,
        jsonLdGraph: [
          breadcrumbSchema(breadcrumbs, pageUrl),
          {
            '@type': 'TechArticle',
            '@id': `${pageUrl}#article`,
            headline: `${u.name} with AgentDomains`,
            description: u.summary,
            url: pageUrl,
            author: { '@id': `${SITE}/#organization` },
            publisher: { '@id': `${SITE}/#organization` },
          },
          {
            '@type': 'HowTo',
            '@id': `${pageUrl}#howto`,
            name: `How to automate ${u.name} using AgentDomains MCP`,
            step: [
              { '@type': 'HowToStep', name: 'Check availability', text: `Call check_availability for ${fqdn}.` },
              { '@type': 'HowToStep', name: 'Claim domain', text: `Call claim_domain for ${fqdn}.` },
              { '@type': 'HowToStep', name: 'Configure routing', text: `Call ${step3Tool.name} pointing to ${u.origin}.` },
              { '@type': 'HowToStep', name: 'Verify HTTPS 200 OK', text: `Verify https://${fqdn} responds with 200 OK over TLS.` },
            ],
          },
        ],
        bodyHtml,
      }),
    });
  });

  return pages;
}
