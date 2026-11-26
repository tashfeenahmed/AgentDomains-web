// Shared HTML layout, meta tags, JSON-LD, navigation, and escaping helpers
export const SITE = 'https://agentdomains.co';
export const LASTMOD = '2026-11-26';

export function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escInline(str) {
  return esc(str).replace(/`([^`]+)`/g, '<code>$1</code>');
}

export function stripTicks(str) {
  return String(str ?? '').replace(/`([^`]+)`/g, '$1');
}

export function clampDesc(str, max = 158) {
  const clean = stripTicks(str).replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

export function fitTitle(preferred, shorter, max = 60) {
  const p = stripTicks(preferred).replace(/\s+/g, ' ').trim();
  if (p.length <= max) return p;
  const s = stripTicks(shorter).replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  return s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

export function breadcrumbSchema(items, pageUrl) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url.startsWith('http') ? it.url : `${SITE}${it.url}`,
    })),
  };
}

export function faqSchema(faqs, pageUrl) {
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: stripTicks(f.q),
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripTicks(f.a),
      },
    })),
  };
}

export function codeBox(label, code, id = '') {
  const preId = id ? ` id="${esc(id)}"` : '';
  return `<div class="code-box">
  <div class="code-head">
    <span>${esc(label)}</span>
    <button type="button" class="copy-btn"${id ? ` data-target="${esc(id)}"` : ''}>COPY</button>
  </div>
  <pre${preId}><code>${esc(code)}</code></pre>
</div>`;
}

export function renderFaqs(faqs) {
  return `<section aria-labelledby="faq-heading">
  <h2 id="faq-heading">Frequently asked <span class="g">questions</span></h2>
  <div class="faq-list">
    ${faqs.map((f) => `<div class="faq-item"><h3>${escInline(f.q)}</h3><p>${escInline(f.a)}</p></div>`).join('\n    ')}
  </div>
</section>`;
}

export function renderPage({
  path,
  title,
  description,
  activeNav = '',
  breadcrumbs = [],
  jsonLdGraph = [],
  bodyHtml = '',
  extraScripts = [],
  ogType = 'article',
  ctaPrefill = '',
}) {
  const canonical = path === '/' ? `${SITE}/` : `${SITE}${path}`;
  const desc = clampDesc(description, 158);
  const fullGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: 'AgentDomains',
        url: `${SITE}/`,
        logo: { '@type': 'ImageObject', url: `${SITE}/logo.svg` },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: `${SITE}/`,
        name: 'AgentDomains',
        publisher: { '@id': `${SITE}/#organization` },
      },
      ...jsonLdGraph,
    ],
  };

  // Escape </script> safely inside JSON-LD
  const jsonLdStr = JSON.stringify(fullGraph, null, 2).replace(/<\/script/gi, '<\\/script');

  const navItems = [
    { href: 'https://docs.agentdomains.co', label: 'Docs', key: 'docs', secondary: true },
    { href: '/tools', label: 'Tools', key: 'tools', secondary: true },
    { href: '/pricing', label: 'Pricing', key: 'pricing', secondary: false },
    { href: '/manage', label: 'Manage', key: 'manage', secondary: true },
  ];

  const ctaHref = ctaPrefill
    ? `/?q=${encodeURIComponent(ctaPrefill)}&domain=agentdomains.co#domain-input`
    : '/#domain-input';

  const bcHtml = breadcrumbs.length
    ? `<nav class="breadcrumbs" aria-label="Breadcrumb">${breadcrumbs
        .map((b, i) =>
          i === breadcrumbs.length - 1
            ? `<span aria-current="page">${esc(b.name)}</span>`
            : `<a href="${esc(b.url)}">${esc(b.name)}</a><span aria-hidden="true">/</span>`
        )
        .join('')}</nav>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="${esc(ogType)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:site_name" content="AgentDomains">
<meta property="og:image" content="${SITE}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="AgentDomains: real domains for AI agents. Free for 30 days, then $1/month.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}/og.png">
<meta name="twitter:image:alt" content="AgentDomains: real domains for AI agents. Free for 30 days, then $1/month.">
<script type="application/ld+json">
${jsonLdStr}
</script>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='1' y='1' width='30' height='30' rx='8' fill='%230A0A0A'/><path d='M9 10 L16 16 L9 22' fill='none' stroke='%2300CC74' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'/><rect x='17.5' y='19.8' width='7.6' height='3.2' rx='1.6' fill='%2300CC74'/></svg>">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/seo.css">
<script defer src="https://analytics.planintel.ie/script.js" data-website-id="102f4202-1f39-4df0-809e-f5509df99085" data-domains="agentdomains.co,www.agentdomains.co,makes.fyi,www.makes.fyi"></script>
<script defer src="/monitoring.js"></script>
</head>
<body>
<div class="dot-grid"></div>
<nav class="site-nav">
  <div class="nav-inner">
    <a class="logo" href="/">agent<span class="dot">·</span>domains</a>
    <div class="nav-links">
      ${navItems
        .map(
          (n) =>
            `<a${n.secondary ? ' class="nav-secondary"' : ''} href="${n.href}"${activeNav === n.key ? ' aria-current="page"' : ''}${n.key === 'pricing' ? ' data-umami-event="pricing_cta" data-umami-event-location="seo-nav"' : ''}>${n.label}</a>`
        )
        .join('\n      ')}
      <details class="nav-more">
        <summary aria-label="More navigation">Menu</summary>
        <div class="nav-more-panel">
          <a href="https://docs.agentdomains.co">Docs</a>
          <a href="/tools">Free Tools</a>
          <a href="/mcp">MCP Guides</a>
          <a href="/guides">Host Playbooks</a>
          <a href="/compare">Compare</a>
          <a href="/manage">Manage Names</a>
        </div>
      </details>
      <a class="nav-cta" href="${ctaHref}" data-umami-event="signup_click" data-umami-event-location="seo-nav">Claim free</a>
    </div>
  </div>
</nav>
<main>
  ${bcHtml}
  ${bodyHtml}
  <section class="cta-band" aria-label="Claim an agent domain">
    <div class="cta-band-copy">
      <span class="eyebrow">30 Days Free · No Card Required</span>
      <h2>Claim your <span class="g">agent domain</span> now</h2>
      <p>Start with 10 free HTTPS domains under <code>agentdomains.co</code> or <code>makes.fyi</code> for 30 days. Upgrade to Pro for $10/year to keep up to 100 names with visitor stats.</p>
    </div>
    <div class="cta-band-actions">
      <a class="btn" href="${ctaHref}" data-umami-event="seo_cta_claim" data-umami-event-location="${esc(path)}">Claim in Browser →</a>
      <a class="btn ghost" href="/pricing" data-umami-event="pricing_cta" data-umami-event-location="${esc(path)}">See Pricing ($10/yr)</a>
    </div>
  </section>
</main>
<footer class="site-footer">
  <div class="footer-inner">
    <div class="foot-brand-col">
      <p class="foot-brand">Real domains<br>for the sites<br><span class="g">agents build.</span></p>
      <p class="foot-mono">© 2026 AGENTDOMAINS.CO // MAKES.FYI · FSL-1.1<br>Free 30-day trial (10 names, no card) · Pro $10/yr or $1/mo</p>
    </div>
    <div class="foot-col">
      <h4>Product &amp; Docs</h4>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/pricing" data-umami-event="pricing_cta" data-umami-event-location="footer">Pricing</a></li>
        <li><a href="/manage">Manage Names</a></li>
        <li><a href="/#limits">Limits &amp; Policy</a></li>
        <li><a href="https://docs.agentdomains.co">Documentation</a></li>
        <li><a href="https://docs.agentdomains.co/quickstart">Quickstart</a></li>
        <li><a href="https://docs.agentdomains.co/mcp">MCP Reference</a></li>
        <li><a href="https://docs.agentdomains.co/api">HTTP API</a></li>
      </ul>
    </div>
    <div class="foot-col">
      <h4>Guides &amp; Reference</h4>
      <ul>
        <li><a href="/mcp">All MCP Setup Guides</a></li>
        <li><a href="/mcp/cursor">Cursor MCP Setup</a></li>
        <li><a href="/mcp/claude-code">Claude Code MCP</a></li>
        <li><a href="/guides">Host Playbooks</a></li>
        <li><a href="/guides/hetzner-vps">Hetzner VPS Guide</a></li>
        <li><a href="/use-cases">Agent Workflows</a></li>
        <li><a href="/dns">DNS &amp; SSL Reference</a></li>
        <li><a href="/dns/acme-dns-01-challenge">ACME DNS-01 Guide</a></li>
      </ul>
    </div>
    <div class="foot-col">
      <h4>Free Tools &amp; Names</h4>
      <ul>
        <li><a href="/tools">All Free Tools</a></li>
        <li><a href="/tools/mcp-config-builder">MCP Config Builder</a></li>
        <li><a href="/tools/dns-ssl-checker">DNS &amp; ACME Checker</a></li>
        <li><a href="/tools/domain-cost-calculator">Domain TCO Calculator</a></li>
        <li><a href="/names">Live Subdomain Ideas</a></li>
        <li><a href="/names/ai-agents">AI Agent Names</a></li>
        <li><a href="/names/mcp-servers">MCP Server Names</a></li>
        <li><a href="/names/saas-demos">SaaS Demo Names</a></li>
      </ul>
    </div>
    <div class="foot-col">
      <h4>Compare &amp; Source</h4>
      <ul>
        <li><a href="/compare">Compare All Rivals</a></li>
        <li><a href="/compare/paid-rivals">Paid AI-Domain Rivals</a></li>
        <li><a href="/compare/ngrok">vs ngrok</a></li>
        <li><a href="/compare/cloudflare-tunnel">vs Cloudflare Tunnel</a></li>
        <li><a href="/compare/duckdns">vs DuckDNS</a></li>
        <li><a href="/compare/porkbun-mcp">vs Porkbun MCP</a></li>
        <li><a href="https://github.com/tashfeenahmed/AgentDomains">GitHub CLI</a></li>
        <li><a href="https://github.com/tashfeenahmed/AgentDomains-mcp">GitHub MCP</a></li>
        <li><a href="https://github.com/tashfeenahmed/AgentDomains-skill">Agent Skill</a></li>
      </ul>
    </div>
  </div>
</footer>
<script src="/assets/seo.js"></script>
${extraScripts.map((src) => `<script src="${esc(src)}"></script>`).join('\n')}
</body>
</html>
`;
}
