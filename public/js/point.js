// Shared by the homepage (after a browser claim) and /manage: point one name at
// a URL (forward), a server IP (A or AAAA record) or an app host (reverse proxy).
//
// The API keeps a forward, a proxy and the name's own address records apart:
// setting a forward or proxy replaces the A/AAAA/CNAME records itself, but a
// forward refuses while a proxy exists (and the other way round), and a record
// refuses while either exists. So this reads the name first and clears what is
// in the way, then makes the one change asked for.
//
// `api(method, path, key, body)` is the page's own fetch wrapper: it resolves
// with the JSON body and throws an Error carrying the API's `error` text.
(function (root) {
  'use strict';

  const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

  // 'A' for an IPv4 address, 'AAAA' for IPv6, '' for anything else.
  function ipType(v) {
    v = String(v || '').trim();
    if (IPV4.test(v)) return 'A';
    if (v.indexOf(':') >= 0 && /^[0-9a-f:.]+$/i.test(v) && v.split('::').length <= 2) {
      try { new URL('http://[' + v + ']/'); return 'AAAA'; } catch (e) { return ''; }
    }
    return '';
  }

  // A bare host or URL for the proxy origin: the API accepts either, but a
  // pasted URL with a path is trimmed to its host so the message stays clear.
  function cleanHost(v) {
    v = String(v || '').trim();
    if (/^https?:\/\//i.test(v)) { try { return new URL(v).host; } catch (e) { return v; } }
    return v.replace(/\/.*$/, '');
  }

  function base(label) { return '/v1/subdomains/' + encodeURIComponent(label); }
  function q(domain) { return '?domain=' + encodeURIComponent(domain); }

  // mode: 'url' | 'ip' | 'host'. Resolves with a short line of plain text that
  // says what the name now does.
  async function pointName(api, key, label, domain, mode, value) {
    value = String(value || '').trim();
    const path = base(label), dq = q(domain);
    const sd = await api('GET', path + dq, key);
    const fqdn = sd.fqdn || (label + '.' + domain);

    if (mode === 'url') {
      if (!value) throw new Error('paste the URL to send visitors to');
      const target = /^https?:\/\//i.test(value) ? value : 'https://' + value;
      if (sd.proxy) await api('DELETE', path + '/proxy' + dq, key);
      const f = await api('PUT', path + '/forward' + dq, key, { target, domain });
      return fqdn + ' now forwards to ' + ((f.forward && f.forward.target) || target);
    }

    if (mode === 'host') {
      const origin = cleanHost(value);
      if (!origin) throw new Error('type the host your app runs on, like myapp.fly.dev');
      if (sd.forward) await api('DELETE', path + '/forward' + dq, key);
      const p = await api('PUT', path + '/proxy' + dq, key, { origin, domain });
      return fqdn + ' now serves ' + ((p.proxy && p.proxy.origin) || origin) + ' over HTTPS';
    }

    if (mode === 'ip') {
      const type = ipType(value);
      if (!type) throw new Error("that doesn't look like an IP address, like 203.0.113.10");
      if (sd.forward) await api('DELETE', path + '/forward' + dq, key);
      if (sd.proxy) await api('DELETE', path + '/proxy' + dq, key);
      // the name's own address records are replaced, so it points at one server
      const old = (sd.records || []).filter(r => r.name === fqdn && /^(A|AAAA|CNAME)$/.test(r.type));
      if (old.some(r => r.type === type && r.content === value)) return fqdn + ' already points at ' + value;
      let rec;
      try {
        rec = await api('POST', path + '/records' + dq, key, { type, content: value });
      } catch (e) {
        if (!old.length) throw e;
        // a CNAME (or a clash) can block the new record: clear the old ones, then try once more
        for (const r of old) await api('DELETE', path + '/records/' + encodeURIComponent(r.id) + dq, key);
        old.length = 0;
        rec = await api('POST', path + '/records' + dq, key, { type, content: value });
      }
      for (const r of old) {
        if (r.id !== rec.id) await api('DELETE', path + '/records/' + encodeURIComponent(r.id) + dq, key);
      }
      return fqdn + ' now points at ' + value + ' (' + type + ' record)';
    }

    throw new Error('pick what to point it at');
  }

  // The three-choice form, shared markup. Pages style .pick / .claim-row /
  // .mini-btn / .claim-err / .fine. `uid` keeps radio groups apart when a page
  // has many forms.
  const MODES = {
    url: { label: 'A URL', ph: 'https://your-site.example.com', btn: 'FORWARD IT →', hint: 'Visitors go to this address.' },
    ip: { label: 'A server IP', ph: '203.0.113.10', btn: 'POINT IT →', hint: 'Your server, by IP. IPv4 or IPv6.' },
    host: { label: 'An app host', ph: 'myapp.fly.dev', btn: 'PROXY IT →', hint: 'Your app, served at this name over HTTPS.' }
  };
  let seq = 0;
  function formHTML(start) {
    const uid = 'pt' + (++seq);
    start = MODES[start] ? start : 'url';
    const opts = Object.keys(MODES).map(m =>
      '<label><input type="radio" name="' + uid + '" value="' + m + '"' + (m === start ? ' checked' : '') + '>' + MODES[m].label + '</label>').join('');
    return '<form class="point-form" novalidate>' +
      '<div class="pick" role="radiogroup" aria-label="point it at">' + opts + '</div>' +
      '<div class="claim-row">' +
      '<input type="text" name="value" placeholder="' + MODES[start].ph + '" aria-label="' + MODES[start].label + '" autocomplete="off" autocapitalize="off" spellcheck="false">' +
      '<button class="mini-btn ghost" type="submit">' + MODES[start].btn + '</button>' +
      '</div>' +
      '<p class="fine point-hint">' + MODES[start].hint + '</p>' +
      '<div class="claim-err" role="alert"></div>' +
      '<div class="point-ok"></div>' +
      '</form>';
  }

  // run(mode, value) does the work and resolves with a line of text to show.
  function wireForm(form, run) {
    const input = form.querySelector('input[name=value]');
    const btn = form.querySelector('button[type=submit]');
    const err = form.querySelector('.claim-err');
    const ok = form.querySelector('.point-ok');
    const hint = form.querySelector('.point-hint');
    const mode = () => (form.querySelector('.pick input:checked') || {}).value || 'url';
    form.querySelectorAll('.pick input').forEach(r => r.addEventListener('change', () => {
      const m = MODES[mode()];
      input.placeholder = m.ph; input.setAttribute('aria-label', m.label);
      btn.textContent = m.btn; hint.textContent = m.hint; err.textContent = '';
      input.focus();
    }));
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const m = mode(), v = input.value.trim();
      err.textContent = ''; ok.textContent = '';
      if (!v) { err.textContent = 'type ' + MODES[m].label.toLowerCase() + ' first, like ' + MODES[m].ph; input.focus(); return; }
      if (m === 'ip' && !ipType(v)) { err.textContent = "that doesn't look like an IP address, like 203.0.113.10"; input.focus(); return; }
      btn.disabled = true; input.disabled = true; btn.textContent = 'SAVING…';
      try {
        const msg = await run(m, v);
        ok.innerHTML = '<p class="fine"><span class="ok"></span></p>';
        ok.querySelector('.ok').textContent = '✓ ' + msg + '. Give it a minute to go live.';
      } catch (ex) {
        err.textContent = ex.message;
      }
      btn.disabled = false; input.disabled = false; btn.textContent = MODES[mode()].btn;
    });
  }

  root.ADPoint = { ipType, cleanHost, pointName, formHTML, wireForm };
})(window);
