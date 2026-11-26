/* Tool 03: Agent Hostname & Domain TCO Calculator with live SVG bar chart */
(function(){
  const projIn = document.getElementById('cc-projects');
  const projVal = document.getElementById('cc-projects-val');
  const lifeSel = document.getElementById('cc-lifespan');
  const needTld = document.getElementById('cc-need-tld');
  const needProxy = document.getElementById('cc-need-proxy');
  const needMcp = document.getElementById('cc-need-mcp');
  const needAcme = document.getElementById('cc-need-acme');
  const verdictEl = document.getElementById('cc-verdict');
  const chartBox = document.getElementById('cc-chart-box');
  const tbody = document.getElementById('cc-table-body');
  if (!projIn) return;

  function render(){
    const n = Number(projIn.value);
    const life = lifeSel.value;
    const years = life === 'trial' ? 1 : (life === '3yr' ? 3 : 1);
    const isTrial = life === 'trial';
    const wantTld = needTld.checked;
    const wantProxy = needProxy.checked;
    const wantMcp = needMcp.checked;
    const wantAcme = needAcme.checked;

    projVal.textContent = n + (n === 1 ? ' project' : ' projects');

    // Transparent provider math
    const adCost = isTrial && n <= 10 ? 0 : Math.ceil(n / 100) * 10 * years;
    const cfCost = n * 10.44 * years;
    const porkbunCost = n * 11.08 * years;
    const namecheapCost = n * (years === 1 ? 11.28 : 11.28 + 15.88 * (years - 1));
    const ngrokCost = isTrial ? (n <= 1 ? 0 : 20) : (n <= 1 ? 96 * years : (96 + Math.max(0, n - 1) * 12) * years);
    const x402Cost = (59 + n * 25) * years;

    const rows = [
      {
        name: 'AgentDomains',
        cost: adCost,
        type: 'Managed Subdomains',
        color: '#00CC74',
        note: wantTld
          ? 'Not a .com registrar — cannot transfer out.'
          : (isTrial && n <= 10 ? '$0 on 30-day card-free trial (up to 10 names).' : `$10/yr Pro covers up to 100 names + edge HTTPS proxy + 20-tool MCP.`),
      },
      {
        name: 'Cloudflare Registrar',
        cost: cfCost,
        type: 'ICANN TLD Registrar',
        color: '#F59E0B',
        note: 'At-cost .com (~$10.44/yr each), full DNS + proxy, card required.',
      },
      {
        name: 'Porkbun',
        cost: porkbunCost,
        type: 'ICANN TLD Registrar',
        color: '#EC4899',
        note: 'Great registrar (~$11.08/yr .com), full DNS API; no built-in reverse proxy.',
      },
      {
        name: 'Namecheap',
        cost: namecheapCost,
        type: 'ICANN TLD Registrar',
        color: '#6366F1',
        note: 'Retail .com renewals (~$15.88/yr); DNS API requires account minimum + IP whitelist.',
      },
      {
        name: 'ngrok',
        cost: ngrokCost,
        type: 'Local Tunnel Gateway',
        color: '#0EA5E9',
        note: 'Best for localhost behind NAT; no writable DNS or ACME DNS-01.',
      },
      {
        name: 'x402 Crypto Registrar',
        cost: x402Cost,
        type: 'Autonomous USDC Registrar',
        color: '#64748B',
        note: 'Reference agentdomain.app ($59/yr Starter + ~$25 USDC/domain); no human card needed.',
      },
    ];

    // Honest architectural verdict
    if (wantTld) {
      verdictEl.className = 'panel warn';
      verdictEl.innerHTML = `<strong>Honest Verdict: Buy real domains at Cloudflare Registrar (~$${cfCost.toFixed(2)}) or Porkbun (~$${porkbunCost.toFixed(2)}).</strong><br>
        Because you checked <em>Must own transferable .com</em>, AgentDomains is <strong>not</strong> the right fit for your primary brand — we issue managed subdomains (<code>*.makes.fyi</code> / <code>*.agentdomains.co</code>), not registrable TLDs. Use AgentDomains only for your throwaway staging, previews, and webhooks!`;
    } else {
      const saveVsCf = Math.max(0, cfCost - adCost);
      verdictEl.className = 'panel mint';
      const extras = [];
      if (wantProxy) extras.push('built-in edge HTTPS proxy');
      if (wantMcp) extras.push('hosted 20-tool MCP server');
      if (wantAcme) extras.push('ACME DNS-01 automation');
      verdictEl.innerHTML = `<strong>Best Fit: AgentDomains ($${adCost.toFixed(2)} total) — save ~$${saveVsCf.toFixed(2)} vs buying ${n} .com domains.</strong><br>
        For ${n} ${isTrial ? '30-day sprint' : years + '-year'} agent hostnames${extras.length ? ' with ' + extras.join(', ') : ''}, managed subdomains remove per-domain registrar fees while keeping full DNS control.
        <div class="btn-row" style="margin:.85rem 0 0">
          <a class="btn sm" href="/#domain-input" data-umami-event="claim_from_seo" data-umami-event-location="tool-tco-verdict">Claim 10 names free (30 days) →</a>
          <a class="btn sm ghost" href="/pricing" data-umami-event="pricing_cta" data-umami-event-location="tool-tco-verdict">Go Pro ($10/yr)</a>
        </div>`;
    }

    // Live SVG Horizontal Bar Chart
    const maxCost = Math.max(...rows.map((r) => r.cost), 10);
    const barW = 470;
    const rowH = 44;
    const svgH = rows.length * rowH + 34;

    const bars = rows
      .map((r, i) => {
        const y = 20 + i * rowH;
        const w = Math.max(6, Math.round((r.cost / maxCost) * barW));
        return `<g>
          <text x="165" y="${y + 20}" text-anchor="end" font-family="Plus Jakarta Sans,sans-serif" font-weight="700" font-size="13" fill="#0A0A0A">${r.name}</text>
          <rect x="178" y="${y + 4}" width="${w}" height="24" rx="6" fill="${r.color}" stroke="#0A0A0A" stroke-width="2"/>
          <text x="${186 + w}" y="${y + 21}" font-family="Space Mono,monospace" font-weight="700" font-size="12" fill="#0A0A0A">$${r.cost.toFixed(2)}</text>
        </g>`;
      })
      .join('');

    chartBox.innerHTML = `<svg viewBox="0 0 760 ${svgH}" width="760" height="${svgH}" role="img" aria-label="Estimated domain cost comparison bar chart across 6 providers">
      ${bars}
    </svg>`;

    tbody.innerHTML = rows
      .map(
        (r) => `<tr>
        <td><strong>${r.name}</strong></td>
        <td style="font-family:'Space Mono',monospace;font-weight:700">$${r.cost.toFixed(2)}</td>
        <td>${r.type}</td>
        <td>${r.note}</td>
      </tr>`
      )
      .join('');
  }

  let tracked = false;
  [projIn, lifeSel, needTld, needProxy, needMcp, needAcme].forEach((el) => {
    const onChange = () => {
      render();
      if (!tracked) {
        tracked = true;
        try { if (window.umami && typeof window.umami.track === 'function') window.umami.track('tool_cost_calc_used', { projects: Number(projIn.value) }); } catch (e) {}
      }
    };
    el.addEventListener('input', onChange);
    el.addEventListener('change', onChange);
  });
  render();
})();
