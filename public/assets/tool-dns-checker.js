/* Tool 02: Live DNS Propagation & ACME DNS-01 Checker via Cloudflare & Google DoH */
(function(){
  const form = document.getElementById('dc-form');
  const hostIn = document.getElementById('dc-host');
  const expIn = document.getElementById('dc-expected');
  const runBtn = document.getElementById('dc-run');
  const statusEl = document.getElementById('dc-status');
  const summaryEl = document.getElementById('dc-summary');
  const resultsEl = document.getElementById('dc-results');
  if (!form) return;

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  async function queryCF(name, type){
    const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`, {
      headers: { Accept: 'application/dns-json' },
    });
    return r.json();
  }

  async function queryGoogle(name, type){
    const r = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`);
    return r.json();
  }

  function extract(resp){
    if (!resp || !Array.isArray(resp.Answer)) return [];
    return resp.Answer.map((a) => ({ data: String(a.data || '').replace(/^"|"$/g, ''), ttl: a.TTL, type: a.type }));
  }

  function sameSet(a, b){
    const sa = a.map((x) => x.data.toLowerCase()).sort().join('|');
    const sb = b.map((x) => x.data.toLowerCase()).sort().join('|');
    return sa === sb;
  }

  async function runCheck(){
    const host = (hostIn.value || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!host || !host.includes('.')) {
      statusEl.className = 'status-line status-err';
      statusEl.textContent = 'Enter a valid hostname (e.g. myapp.makes.fyi or agentdomains.co).';
      return;
    }
    const expected = (expIn.value || '').trim();
    runBtn.disabled = true;
    statusEl.className = 'status-line status-dim';
    statusEl.textContent = `Querying Cloudflare (1.1.1.1) and Google (8.8.8.8) DoH for ${host}…`;
    summaryEl.innerHTML = '';
    resultsEl.innerHTML = '';

    const checks = [
      { label: 'A (IPv4)', name: host, type: 'A' },
      { label: 'AAAA (IPv6)', name: host, type: 'AAAA' },
      { label: 'CNAME (Alias)', name: host, type: 'CNAME' },
      { label: 'TXT (Verification / SPF)', name: host, type: 'TXT' },
      { label: 'NS (Delegation)', name: host, type: 'NS' },
      { label: 'ACME DNS-01 (_acme-challenge)', name: `_acme-challenge.${host}`, type: 'TXT', isAcme: true },
    ];

    try {
      const rows = await Promise.all(
        checks.map(async (c) => {
          const [cf, gg] = await Promise.all([
            queryCF(c.name, c.type).catch(() => null),
            queryGoogle(c.name, c.type).catch(() => null),
          ]);
          const cfAns = extract(cf);
          const ggAns = extract(gg);
          return { ...c, cf, gg, cfAns, ggAns, synced: sameSet(cfAns, ggAns) };
        })
      );

      const hasRouting = rows.some((r) => ['A', 'AAAA', 'CNAME'].includes(r.type) && (r.cfAns.length || r.ggAns.length));
      const allSynced = rows.every((r) => r.synced);
      const acmeRow = rows.find((r) => r.isAcme);
      const acmeValues = [...new Set([...acmeRow.cfAns, ...acmeRow.ggAns].map((x) => x.data))];
      const acmePass = expected
        ? acmeRow.cfAns.some((x) => x.data === expected) && acmeRow.ggAns.some((x) => x.data === expected)
        : acmeValues.length > 0;

      summaryEl.innerHTML = `
        <div class="panel ${hasRouting ? 'mint' : 'warn'}" style="margin:0">
          <div class="kicker">DNS Routing &amp; Propagation</div>
          <h3 style="margin:.25rem 0">${hasRouting ? 'PASS — Host Resolves' : 'NO A/AAAA/CNAME FOUND'}</h3>
          <p style="margin:0;font-size:.9rem">${allSynced ? '1.1.1.1 and 8.8.8.8 answers match across all checked types.' : 'Resolver mismatch detected — TTL propagation still in progress.'}</p>
        </div>
        <div class="panel ${acmePass ? 'mint' : ''}" style="margin:0">
          <div class="kicker">ACME DNS-01 (_acme-challenge.${esc(host)})</div>
          <h3 style="margin:.25rem 0">${acmePass ? 'PASS — Challenge TXT Live' : (expected ? 'FAIL — Expected Token Not Found Yet' : 'NO ACTIVE _acme-challenge TXT')}</h3>
          <p style="margin:0;font-size:.9rem">${acmeValues.length ? 'Visible TXT: ' + esc(acmeValues.join(', ')) : 'Normal when no Let’s Encrypt DNS-01 issuance is currently running.'}</p>
        </div>
      `;

      resultsEl.innerHTML = rows
        .map((r) => {
          const hasAny = r.cfAns.length || r.ggAns.length;
          const badge = !hasAny
            ? '<span class="badge checking">NONE</span>'
            : r.synced
              ? '<span class="badge free">SYNCED ✓</span>'
              : '<span class="badge taken">PROPAGATING</span>';
          const fmt = (list) =>
            list.length
              ? list.map((x) => `<code>${esc(x.data)}</code> <span style="opacity:.65">(TTL ${esc(x.ttl)}s)</span>`).join('<br>')
              : '<span style="opacity:.6">No records (NODATA/NXDOMAIN)</span>';
          return `<div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem">
              <span class="kicker">${esc(r.type)}</span>
              ${badge}
            </div>
            <h3>${esc(r.label)}</h3>
            <p style="font-size:.82rem"><strong>1.1.1.1 (Cloudflare):</strong><br>${fmt(r.cfAns)}</p>
            <p style="font-size:.82rem"><strong>8.8.8.8 (Google):</strong><br>${fmt(r.ggAns)}</p>
          </div>`;
        })
        .join('');

      statusEl.className = 'status-line status-ok';
      statusEl.textContent = `Completed 12 live DoH queries for ${host} across Cloudflare 1.1.1.1 and Google 8.8.8.8.`;
    } catch (err) {
      statusEl.className = 'status-line status-err';
      statusEl.textContent = `DoH lookup failed: ${err.message}`;
    } finally {
      runBtn.disabled = false;
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    try { if (window.umami && typeof window.umami.track === 'function') window.umami.track('tool_dns_check'); } catch (ex) {}
    runCheck();
  });
  document.querySelectorAll('[data-dc-sample]').forEach((btn) => {
    btn.addEventListener('click', () => {
      hostIn.value = btn.dataset.dcSample;
      runCheck();
    });
  });

  runCheck();
})();
