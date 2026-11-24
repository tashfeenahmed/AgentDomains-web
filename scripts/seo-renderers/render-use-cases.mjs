import {
  SITE,
  esc,
  renderPage,
  breadcrumbSchema,
  codeBox,
} from '../seo-lib/layout.mjs';
import { renderSpecStrip, renderFilterPills, trunc } from '../seo-lib/visuals.mjs';
import { USE_CASES } from '../seo-data/use-cases.mjs';

function renderSequenceSvg(u) {
  const fqdn = `${u.label}.${u.domain}`;
  const step3Name =
    u.mode === 'record'
      ? '3. add_dns_record (A)'
      : u.mode === 'acme'
        ? '3. add_acme_challenge (TXT)'
        : '3. set_proxy (HTTPS Edge)';
  const originTxt = trunc(u.mode === 'record' || u.mode === 'acme' ? `IP ${u.origin}` : u.origin, 22);

  return `<div class="diagram-box">
  <svg viewBox="0 0 880 285" width="880" height="285" role="img" aria-label="3-stage MCP sequence diagram for ${esc(u.name)}: AI Agent to AgentDomains to ${esc(u.origin)}">
    <defs>
      <marker id="seq-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#00CC74" stroke="#0A0A0A" stroke-width="1"/>
      </marker>
    </defs>

    <!-- Lifelines -->
    <line x1="140" y1="74" x2="140" y2="270" stroke="#0A0A0A" stroke-width="2.5" stroke-dasharray="6 5"/>
    <line x1="440" y1="74" x2="440" y2="270" stroke="#00CC74" stroke-width="2.5" stroke-dasharray="6 5"/>
    <line x1="740" y1="74" x2="740" y2="270" stroke="#0A0A0A" stroke-width="2.5" stroke-dasharray="6 5"/>

    <!-- Actor 1 -->
    <rect x="40" y="16" width="208" height="58" rx="12" fill="#0A0A0A"/>
    <rect x="36" y="12" width="208" height="58" rx="12" fill="#EFFCF5" stroke="#0A0A0A" stroke-width="2.5"/>
    <text x="140" y="38" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="15" fill="#0A0A0A">1. AI Agent / CI</text>
    <text x="140" y="57" text-anchor="middle" font-family="Space Mono,monospace" font-size="10" fill="#00A85E">MCP Client or CLI</text>

    <!-- Actor 2 -->
    <rect x="330" y="16" width="228" height="58" rx="12" fill="#00CC74"/>
    <rect x="326" y="12" width="228" height="58" rx="12" fill="#C6F24E" stroke="#0A0A0A" stroke-width="2.5"/>
    <text x="440" y="38" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="15" fill="#0A0A0A">2. AgentDomains Edge</text>
    <text x="440" y="57" text-anchor="middle" font-family="Space Mono,monospace" font-size="10" fill="#0A0A0A">${esc(trunc(fqdn, 28))}</text>

    <!-- Actor 3 -->
    <rect x="640" y="16" width="208" height="58" rx="12" fill="#0A0A0A"/>
    <rect x="636" y="12" width="208" height="58" rx="12" fill="#FFFFFF" stroke="#0A0A0A" stroke-width="2.5"/>
    <text x="740" y="38" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="15" fill="#0A0A0A">3. Your Origin</text>
    <text x="740" y="57" text-anchor="middle" font-family="Space Mono,monospace" font-size="10" fill="#00A85E">${esc(originTxt)}</text>

    <!-- Step 1 -->
    <line x1="146" y1="108" x2="430" y2="108" stroke="#0A0A0A" stroke-width="2.5" marker-end="url(#seq-arr)"/>
    <rect x="174" y="88" width="232" height="22" rx="6" fill="#FFFFFF" stroke="#0A0A0A" stroke-width="1.8"/>
    <text x="290" y="103" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10.5" fill="#0A0A0A">1. check_availability → free</text>

    <!-- Step 2 -->
    <line x1="146" y1="154" x2="430" y2="154" stroke="#0A0A0A" stroke-width="2.5" marker-end="url(#seq-arr)"/>
    <rect x="174" y="134" width="232" height="22" rx="6" fill="#EFFCF5" stroke="#0A0A0A" stroke-width="1.8"/>
    <text x="290" y="149" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10.5" fill="#0A0A0A">2. claim_domain → claimed</text>

    <!-- Step 3 -->
    <line x1="146" y1="200" x2="430" y2="200" stroke="#0A0A0A" stroke-width="2.5" marker-end="url(#seq-arr)"/>
    <rect x="174" y="180" width="232" height="22" rx="6" fill="#C6F24E" stroke="#0A0A0A" stroke-width="1.8"/>
    <text x="290" y="195" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10.5" fill="#0A0A0A">${esc(step3Name)}</text>

    <!-- Step 4: Live Traffic -->
    <line x1="446" y1="224" x2="730" y2="224" stroke="#0A0A0A" stroke-width="2.5" marker-end="url(#seq-arr)"/>
    <rect x="484" y="204" width="212" height="22" rx="6" fill="#FFFFFF" stroke="#0A0A0A" stroke-width="1.8"/>
    <text x="590" y="219" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10.5" fill="#0A0A0A">Forward HTTPS / DNS traffic</text>

    <line x1="734" y1="256" x2="150" y2="256" stroke="#00A85E" stroke-width="2.5" stroke-dasharray="5 3" marker-end="url(#seq-arr)"/>
    <rect x="330" y="242" width="220" height="22" rx="6" fill="#00CC74" stroke="#0A0A0A" stroke-width="1.8"/>
    <text x="440" y="257" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="10.5" fill="#0A0A0A">4. HTTP/2 200 OK · Valid TLS</text>
  </svg>
  <p class="diagram-caption">3-stage sequence: AI agent claims ${esc(fqdn)}, maps it to ${esc(u.origin)}, and verifies HTTPS 200 OK.</p>
</div>`;
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
    <p class="lede">Copy-paste MCP tool transcripts, sequence diagrams, and CI teardown scripts for webhooks, OAuth, PR previews, bots, and A2A agents.</p>
    ${renderSpecStrip([
      { icon: 'layers', label: 'Blueprints', value: `${USE_CASES.length} Workflows`, tone: 'green' },
      { icon: 'plug', label: 'Transcript', value: '4 MCP Steps' },
      { icon: 'lock', label: 'Edge TLS', value: 'Automatic', tone: 'lime' },
      { icon: 'terminal', label: 'CI Cleanup', value: 'GitHub Action' },
    ])}
    ${renderSequenceSvg(USE_CASES[0])}
    <div class="hub-search">
      <input type="text" placeholder="Filter 30 workflows (e.g. stripe, oauth, pr, mcp, discord, voice)…" data-filter-input="usecases-grid" aria-label="Filter workflow blueprints">
      <span class="pill" id="usecases-grid-count">${USE_CASES.length} shown</span>
    </div>
    ${renderFilterPills('usecases-grid', USE_CASES.map((u) => u.badge))}
    <div class="grid" id="usecases-grid">
      ${USE_CASES.map(
        (u, i) => `<a class="card" href="/use-cases/${esc(u.slug)}" data-cat="${esc(u.badge.toLowerCase())}" data-search="${esc((u.name + ' ' + u.slug + ' ' + u.badge + ' ' + u.summary).toLowerCase())}">
        <div class="card-top">
          <span class="kicker">${esc(u.badge)}</span>
          <span class="card-icon">${String(i + 1).padStart(2, '0')}</span>
        </div>
        <h3>${esc(u.name)}</h3>
        <p>${esc(u.summary)}</p>
        <span class="pill green" style="align-self:flex-start;margin-top:auto">${esc(u.label)}.${esc(u.domain)}</span>
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
      description: 'Copy-paste MCP tool transcripts, sequence diagrams, and CI teardown jobs for PR previews, Stripe webhooks, OAuth, bots, and remote MCP.',
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
      ${renderSpecStrip([
        { icon: 'globe', label: 'Example Host', value: trunc(fqdn, 22), tone: 'green' },
        { icon: 'plug', label: 'MCP Flow', value: '4 Tool Steps' },
        { icon: 'lock', label: 'HTTPS Mode', value: u.mode === 'record' ? 'A Record + TLS' : u.mode === 'acme' ? 'ACME DNS-01' : 'Edge Proxy', tone: 'lime' },
        { icon: 'terminal', label: 'Teardown', value: 'GitHub Action' },
      ])}

      <div class="panel accent">
        <p style="margin:0">${esc(u.whyMatters)}</p>
      </div>

      <h2>1. 3-Stage <span class="g">Sequence Diagram</span></h2>
      ${renderSequenceSvg(u)}

      <h2>2. 4-Step <span class="g">MCP Tool-Call Transcript</span></h2>
      <p>Your agent sends these exact calls to <code>https://mcp.agentdomains.co</code> or local stdio.</p>
      <div class="transcript">
        <div class="step-card">
          <div><span class="step-num">STEP 1</span><strong>check_availability</strong></div>
          <div class="io-pills">
            <span class="io-pill req">REQ → check_availability("${esc(u.label)}")</span>
            <span class="io-pill res">RES ← available: true</span>
          </div>
          ${codeBox('MCP Call → check_availability', JSON.stringify({ tool: 'check_availability', arguments: { label: u.label, domain: u.domain } }, null, 2) + '\n// Response:\n' + JSON.stringify({ fqdn, available: true, reason: 'available' }, null, 2))}
        </div>
        <div class="step-card">
          <div><span class="step-num">STEP 2</span><strong>claim_domain</strong></div>
          <div class="io-pills">
            <span class="io-pill req">REQ → claim_domain("${esc(u.label)}")</span>
            <span class="io-pill res">RES ← status: "claimed"</span>
          </div>
          ${codeBox('MCP Call → claim_domain', JSON.stringify({ tool: 'claim_domain', arguments: { label: u.label, domain: u.domain, email: 'ops@example.com' } }, null, 2) + '\n// Response:\n' + JSON.stringify({ fqdn, status: 'claimed', confirm_within_days: 30 }, null, 2))}
        </div>
        <div class="step-card">
          <div><span class="step-num">STEP 3</span><strong>${esc(step3Tool.name)}</strong></div>
          <div class="io-pills">
            <span class="io-pill req">REQ → ${esc(step3Tool.name)}("${esc(u.origin)}")</span>
            <span class="io-pill res">RES ← ok: true</span>
          </div>
          ${codeBox(`MCP Call → ${step3Tool.name}`, JSON.stringify({ tool: step3Tool.name, arguments: step3Tool.args }, null, 2) + '\n// Response:\n' + JSON.stringify(step3Tool.resp, null, 2))}
        </div>
        <div class="step-card">
          <div><span class="step-num">STEP 4</span><strong>Verify Live HTTPS (200 OK)</strong></div>
          <div class="io-pills">
            <span class="io-pill req">REQ → HEAD https://${esc(fqdn)}</span>
            <span class="io-pill res">RES ← HTTP/2 200 OK</span>
          </div>
          ${codeBox('Verify live HTTPS response', `curl -fsSI https://${fqdn}\n# HTTP/2 200\n# content-type: application/json\n# strict-transport-security: max-age=31536000`)}
        </div>
      </div>

      <h2>3. Clean <span class="g">Teardown (GitHub Action &amp; CLI)</span></h2>
      <p>${esc(u.teardownNote)} Delete the DNS mapping before you destroy your cloud server to block dangling takeovers.</p>
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
        description: `${u.summary} Includes a 4-step MCP transcript, sequence diagram, and CI teardown job.`,
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
              { '@type': 'HowToStep', name: 'Verify HTTPS 200 OK', text: `Check that https://${fqdn} returns 200 OK.` },
            ],
          },
        ],
        bodyHtml,
      }),
    });
  });

  return pages;
}
