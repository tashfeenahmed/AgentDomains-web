/* AgentDomains shared interactive helpers for Programmatic SEO pages */
(function(){
  const API = 'https://api.agentdomains.co';

  function copyText(text, btn){
    const done = () => {
      if (!btn) return;
      const orig = btn.dataset.orig || btn.textContent;
      btn.dataset.orig = orig;
      btn.textContent = 'COPIED ✓';
      setTimeout(() => { btn.textContent = orig; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      done();
    }
  }

  // Copy buttons for any .copy-btn[data-copy] or sibling <pre>
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    let text = btn.dataset.copy;
    if (!text && btn.dataset.target) {
      const el = document.getElementById(btn.dataset.target);
      if (el) text = el.textContent;
    }
    if (!text) {
      const box = btn.closest('.code-box');
      const pre = box && box.querySelector('pre');
      if (pre) text = pre.textContent;
    }
    if (text) copyText(text.trim(), btn);
  });

  // Tab switchers
  document.querySelectorAll('[data-tabs]').forEach((group) => {
    const btns = group.querySelectorAll('.tab-btn');
    const panes = group.querySelectorAll('.tab-pane');
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.tab;
        btns.forEach((b) => b.classList.toggle('active', b === btn));
        panes.forEach((p) => p.classList.toggle('active', p.dataset.pane === id));
      });
    });
  });

  // Hub card live filter
  document.querySelectorAll('[data-filter-input]').forEach((input) => {
    const gridId = input.dataset.filterInput;
    const grid = document.getElementById(gridId);
    if (!grid) return;
    const items = Array.from(grid.querySelectorAll('[data-search]'));
    const countEl = document.getElementById(gridId + '-count');
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      items.forEach((el) => {
        const match = !q || el.dataset.search.includes(q);
        el.style.display = match ? '' : 'none';
        if (match) shown++;
      });
      if (countEl) countEl.textContent = shown + ' shown';
    });
  });

  // Cluster 2: Interactive "Generate My CLI Command" widget + live availability check
  document.querySelectorAll('[data-cli-gen]').forEach((widget) => {
    const mode = widget.dataset.mode || 'proxy';
    const labelIn = widget.querySelector('[data-field="label"]');
    const domainIn = widget.querySelector('[data-field="domain"]');
    const originIn = widget.querySelector('[data-field="origin"]');
    const emailIn = widget.querySelector('[data-field="email"]');
    const outEl = widget.querySelector('[data-cli-out]');
    const checkBtn = widget.querySelector('[data-check-btn]');
    const statusEl = widget.querySelector('[data-avail-status]');

    function cleanLabel(v){
      return (v || 'my-app').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '').slice(0, 63) || 'my-app';
    }

    function renderCmd(){
      const label = cleanLabel(labelIn.value);
      const domain = domainIn.value;
      const origin = (originIn.value || '').trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '') || (mode === 'record' ? '203.0.113.10' : 'myapp.up.railway.app');
      const email = (emailIn && emailIn.value.trim()) || 'you@example.com';
      const dflag = domain === 'makes.fyi' ? '' : ' --domain ' + domain;
      let step3;
      if (mode === 'record') {
        step3 = `agentdomains record ${label} --type A --content ${origin}${dflag}`;
      } else if (mode === 'forward') {
        const url = originIn.value.trim().startsWith('http') ? originIn.value.trim() : 'https://' + origin;
        step3 = `agentdomains forward ${label} ${url}${dflag}`;
      } else {
        step3 = `agentdomains proxy ${label} ${origin}${dflag}`;
      }
      outEl.textContent = [
        '# 1. Create an anonymous account (no card, 30-day free trial)',
        'agentdomains signup',
        '',
        `# 2. Claim ${label}.${domain}`,
        `agentdomains claim ${label} --email ${email}${dflag}`,
        '',
        `# 3. Connect your origin (${mode === 'record' ? 'DNS A record' : mode === 'forward' ? 'HTTPS redirect' : 'Edge HTTPS reverse proxy'})`,
        step3
      ].join('\n');
    }

    async function checkAvail(){
      const label = cleanLabel(labelIn.value);
      const domain = domainIn.value;
      statusEl.className = 'status-line status-dim';
      statusEl.textContent = `Checking ${label}.${domain}…`;
      try {
        const r = await fetch(`${API}/v1/available?label=${encodeURIComponent(label)}&domain=${encodeURIComponent(domain)}`);
        const d = await r.json();
        if (d.reason === 'available') {
          statusEl.className = 'status-line status-ok';
          statusEl.textContent = `AVAILABLE: ${d.fqdn} is free right now.`;
        } else if (d.reason === 'taken') {
          statusEl.className = 'status-line status-err';
          statusEl.textContent = `TAKEN: ${d.fqdn} is already claimed — try another label.`;
        } else {
          statusEl.className = 'status-line status-err';
          statusEl.textContent = d.detail || 'Invalid label — use lowercase letters, digits, and hyphens.';
        }
      } catch (e) {
        statusEl.className = 'status-line status-dim';
        statusEl.textContent = 'Could not reach api.agentdomains.co from this browser.';
      }
    }

    [labelIn, domainIn, originIn, emailIn].filter(Boolean).forEach((el) => {
      el.addEventListener('input', renderCmd);
      el.addEventListener('change', renderCmd);
    });
    if (checkBtn) checkBtn.addEventListener('click', checkAvail);
    renderCmd();
  });

  // Cluster 3: Interactive project-count TCO diff slider
  document.querySelectorAll('[data-cost-slider]').forEach((widget) => {
    const slider = widget.querySelector('input[type="range"]');
    const countOut = widget.querySelector('[data-count-out]');
    const adOut = widget.querySelector('[data-ad-cost]');
    const rivalOut = widget.querySelector('[data-rival-cost]');
    const diffOut = widget.querySelector('[data-diff-out]');
    const unitCost = Number(widget.dataset.rivalUnit || 0);
    const flatCost = Number(widget.dataset.rivalFlat || 0);
    const rivalName = widget.dataset.rivalName || 'Rival';
    const rivalModel = widget.dataset.rivalModel || 'per-domain';

    function update(){
      const n = Number(slider.value);
      countOut.textContent = n + (n === 1 ? ' project' : ' projects');
      // AgentDomains: $0 for 30-day trial (<=10 names), $10/yr Pro covers up to 100 names
      const adYear = n <= 10 ? 10 : Math.ceil(n / 100) * 10;
      let rivalYear;
      if (rivalModel === 'flat-seat') {
        rivalYear = flatCost + unitCost * n;
      } else if (rivalModel === 'free') {
        rivalYear = 0;
      } else {
        rivalYear = flatCost + unitCost * n;
      }
      adOut.textContent = `$${adYear.toFixed(2)} / yr (or $0 for 30-day trial${n <= 10 ? '' : ' up to 10 names'})`;
      rivalOut.textContent = rivalModel === 'free'
        ? '$0.00 / yr (free tier — check feature limits above)'
        : `$${rivalYear.toFixed(2)} / yr`;
      const delta = rivalYear - adYear;
      if (delta > 0) {
        diffOut.textContent = `AgentDomains Pro saves ~$${delta.toFixed(2)}/year vs ${rivalName} for ${n} hostnames.`;
        diffOut.className = 'status-line status-ok';
      } else if (delta < 0) {
        diffOut.textContent = `${rivalName} is ~$${Math.abs(delta).toFixed(2)}/year cheaper in raw fees — compare DNS, proxy, and MCP features above.`;
        diffOut.className = 'status-line status-dim';
      } else {
        diffOut.textContent = `Roughly equal annual cost — pick based on managed subdomain vs ${rivalName} trade-offs.`;
        diffOut.className = 'status-line status-dim';
      }
    }
    slider.addEventListener('input', update);
    update();
  });

  // Cluster 5: Interactive client-side DNS record syntax validator
  document.querySelectorAll('[data-dns-validator]').forEach((widget) => {
    const typeSel = widget.querySelector('[data-dns-type]');
    const hostIn = widget.querySelector('[data-dns-host]');
    const valIn = widget.querySelector('[data-dns-val]');
    const resEl = widget.querySelector('[data-dns-result]');
    const cliEl = widget.querySelector('[data-dns-cli]');

    const ipv4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
    const ipv6 = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    const fqdn = /^(?=.{1,253}$)([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}\.?$/;
    const subHost = /^(@|[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*)$/;

    function validate(){
      const t = typeSel.value;
      const h = (hostIn.value || '@').trim();
      const v = (valIn.value || '').trim();
      let ok = true;
      let msg = '';

      if (!subHost.test(h)) {
        ok = false;
        msg = 'Host sub-label must be @ or valid DNS labels (letters, digits, hyphens, underscores).';
      } else if (!v) {
        ok = false;
        msg = 'Enter a record value to validate.';
      } else if (t === 'A' && !ipv4.test(v)) {
        ok = false;
        msg = 'Invalid IPv4 address for A record (expected e.g. 203.0.113.10).';
      } else if (t === 'AAAA' && !ipv6.test(v)) {
        ok = false;
        msg = 'Invalid IPv6 address for AAAA record (expected e.g. 2001:db8::1).';
      } else if ((t === 'CNAME' || t === 'NS') && !fqdn.test(v)) {
        ok = false;
        msg = `Invalid target hostname for ${t} record (expected a domain like app.fly.dev, without https://).`;
      } else if (t === 'TXT' && v.length > 255) {
        ok = false;
        msg = `TXT value is ${v.length} chars; single DNS character-string limit is 255 bytes.`;
      } else {
        msg = `VALID ${t} record (${h === '@' ? 'apex of subdomain' : h} → ${v}).`;
      }

      resEl.className = 'status-line ' + (ok ? 'status-ok' : 'status-err');
      resEl.textContent = msg;

      if (cliEl) {
        const hostFlag = h && h !== '@' ? ` --host ${h}` : '';
        if (t === 'NS') {
          cliEl.textContent = `agentdomains ns myapp ${v} ns2.example.net`;
        } else if (t === 'TXT' && h === '_acme-challenge') {
          cliEl.textContent = `agentdomains txt myapp "${v}"`;
        } else {
          cliEl.textContent = `agentdomains record myapp --type ${t} --content "${v}"${hostFlag}`;
        }
      }
    }

    [typeSel, hostIn, valIn].filter(Boolean).forEach((el) => {
      el.addEventListener('input', validate);
      el.addEventListener('change', validate);
    });
    validate();
  });

  // Cluster 6: Live subdomain availability hub checker
  document.querySelectorAll('[data-names-hub]').forEach((hub) => {
    const domainSel = hub.querySelector('[data-names-domain]');
    const customIn = hub.querySelector('[data-names-custom]');
    const customBtn = hub.querySelector('[data-names-custom-btn]');
    const customOut = hub.querySelector('[data-names-custom-out]');
    const checkAllBtn = hub.querySelector('[data-names-check-all]');
    const cards = Array.from(hub.querySelectorAll('.name-card'));

    function currentDomain(){ return domainSel ? domainSel.value : 'makes.fyi'; }

    function updateSuffixes(){
      const dom = currentDomain();
      const dflag = dom === 'makes.fyi' ? '' : ' --domain ' + dom;
      cards.forEach((card) => {
        const lbl = card.dataset.label;
        card.querySelector('.name-fqdn').textContent = `${lbl}.${dom}`;
        const cbtn = card.querySelector('.copy-btn');
        if (cbtn) cbtn.dataset.copy = `agentdomains claim ${lbl} --email you@example.com${dflag}`;
        const badge = card.querySelector('.badge');
        if (badge) {
          badge.className = 'badge checking';
          badge.textContent = 'click check';
        }
      });
    }

    async function checkOne(card){
      const lbl = card.dataset.label;
      const dom = currentDomain();
      const badge = card.querySelector('.badge');
      badge.className = 'badge checking';
      badge.textContent = 'checking…';
      try {
        const r = await fetch(`${API}/v1/available?label=${encodeURIComponent(lbl)}&domain=${encodeURIComponent(dom)}`);
        const d = await r.json();
        if (d.reason === 'available') {
          badge.className = 'badge free';
          badge.textContent = 'available';
        } else if (d.reason === 'taken') {
          badge.className = 'badge taken';
          badge.textContent = 'taken';
        } else {
          badge.className = 'badge taken';
          badge.textContent = 'unavailable';
        }
      } catch (e) {
        badge.className = 'badge checking';
        badge.textContent = 'offline';
      }
    }

    cards.forEach((card) => {
      const btn = card.querySelector('[data-check-one]');
      if (btn) btn.addEventListener('click', () => checkOne(card));
    });

    if (checkAllBtn) {
      checkAllBtn.addEventListener('click', async () => {
        checkAllBtn.disabled = true;
        checkAllBtn.textContent = 'Checking live availability…';
        for (let i = 0; i < cards.length; i += 4) {
          await Promise.all(cards.slice(i, i + 4).map(checkOne));
        }
        checkAllBtn.disabled = false;
        checkAllBtn.textContent = 'Re-check all names live';
      });
    }

    if (domainSel) domainSel.addEventListener('change', updateSuffixes);

    async function checkCustom(){
      const raw = (customIn.value || '').trim().toLowerCase();
      if (!raw) { customOut.textContent = ''; return; }
      const dom = currentDomain();
      const dflag = dom === 'makes.fyi' ? '' : ' --domain ' + dom;
      customOut.className = 'status-line status-dim';
      customOut.textContent = `Checking ${raw}.${dom}…`;
      try {
        const r = await fetch(`${API}/v1/available?label=${encodeURIComponent(raw)}&domain=${encodeURIComponent(dom)}`);
        const d = await r.json();
        if (d.reason === 'available') {
          customOut.className = 'status-line status-ok';
          customOut.innerHTML = `AVAILABLE: <b>${d.fqdn}</b> — run <code>agentdomains claim ${raw} --email you@example.com${dflag}</code>`;
        } else if (d.reason === 'taken') {
          customOut.className = 'status-line status-err';
          customOut.textContent = `TAKEN: ${d.fqdn} is already claimed.`;
        } else {
          customOut.className = 'status-line status-err';
          customOut.textContent = d.detail || 'Invalid label format.';
        }
      } catch (e) {
        customOut.className = 'status-line status-dim';
        customOut.textContent = 'Could not reach api.agentdomains.co.';
      }
    }

    if (customBtn) customBtn.addEventListener('click', checkCustom);
    if (customIn) customIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); checkCustom(); } });

    updateSuffixes();
    // Auto-check first 6 cards politely on load so visitors immediately see live status
    Promise.all(cards.slice(0, 6).map(checkOne));
  });
})();
