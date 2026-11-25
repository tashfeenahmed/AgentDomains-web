// Only the route categories and action names defined here are sent to the monitoring services.
(() => {
  if (!["agentdomains.co", "www.agentdomains.co", "docs.agentdomains.co"].includes(location.hostname) || navigator.doNotTrack === '1' ||
      navigator.globalPrivacyControl || navigator.webdriver || !globalThis.crypto?.getRandomValues) return;

  const routes = new Set(["api", "docs", "accounts", "agents", "commands", "compare", "delegation", "forwarding", "install", "mcp", "names", "pricing", "proxy", "quickstart", "records", "ssl"]);
  const actions = new Set(["browser_claim_done","browser_point_done", "pricing_cta", "signup_click", "store_click"]);
  const randomId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), n => n.toString(16).padStart(2, '0')).join('');
  const session = randomId();
  let lastPath;
  let errors = 0;

  function route() {
    const segments = location.pathname.split('/').filter(Boolean);
    const first = (segments[0] || '').replace(/\.html$/, '');
    if (!first) return '/';
    if (!routes.has(first)) return '/other';
    return '/' + first + (segments.length > 1 ? '/detail' : '');
  }

  function track(name) {
    const properties = { __deviceId: session, __path: location.origin + route(), platform: 'web' };
    void fetch('https://analytics.neu.so/api/track', {
      method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true,
      headers: { 'Content-Type': 'application/json', 'openpanel-client-id': 'ab30947b-44e2-43f3-946f-43023f395f4d' },
      body: JSON.stringify({ type: 'track', payload: { name, properties } }),
    }).catch(() => {});
  }

  function pageview() {
    if (lastPath === location.pathname) return;
    lastPath = location.pathname;
    track('screen_view');
  }

  function action(name) {
    if (actions.has(name)) track(name);
  }

  function report(error, source, line, column) {
    if (errors >= 5) return;
    errors += 1;
    const type = ['TypeError', 'RangeError', 'SyntaxError', 'ReferenceError'].includes(error?.name) ? error.name : 'Error';
    let filename = 'website';
    if (source) {
      try {
        const url = new URL(source, location.origin);
        const file = url.pathname.split('/').pop();
        if (url.origin === location.origin && /^[a-z\d_.-]+\.js$/i.test(file)) filename = file;
      } catch { /* Errors from inline scripts can lack a source. */ }
    }
    const eventId = randomId();
    const event = {
      event_id: eventId, timestamp: Date.now() / 1000, environment: 'production',
      platform: 'javascript', level: 'error', tags: { page: route() },
      exception: { values: [{ type, value: 'Website exception', stacktrace: {
        frames: [{ filename, lineno: line || undefined, colno: column || undefined, in_app: true }],
      } }] },
    };
    const envelope = [{ event_id: eventId }, { type: 'event' }, event].map(item => JSON.stringify(item)).join('\n');
    void fetch('https://errors.neu.so/api/18/envelope/?sentry_key=78b2c43c7a844583907d7b45cec87021&sentry_version=7', {
      method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true,
      headers: { 'Content-Type': 'text/plain' }, body: envelope,
    }).catch(() => {});
  }

  window.addEventListener('error', e => {
    if (e.message === 'Script error.' && !e.filename) return;
    report(e.error, e.filename, e.lineno, e.colno);
  });
  window.addEventListener('unhandledrejection', e => report(e.reason));
  window.addEventListener('monitoring:route', pageview);
  window.addEventListener('monitoring:action', e => action(e.detail));
  document.addEventListener('click', e => {
    const link = e.target?.closest?.('[data-umami-event], a[href]');
    if (!link) return;
    const named = link.dataset.umamiEvent;
    if (actions.has(named)) return action(named);
    if (!link.href) return;
    let url;
    try { url = new URL(link.href, location.origin); } catch { return; }
    if (['apps.apple.com', 'play.google.com'].includes(url.hostname)) return action('store_click');
    if (!["agentdomains.co", "www.agentdomains.co", "docs.agentdomains.co"].includes(url.hostname)) return;
    const step = url.pathname.split('/').filter(Boolean)[0];
    if (['signup', 'register'].includes(step)) action('signup_click');
    if (step === 'pricing') action('pricing_cta');
  }, true);
  for (const method of ['pushState', 'replaceState']) {
    const original = history[method];
    history[method] = function (...args) {
      const result = original.apply(this, args);
      pageview();
      return result;
    };
  }
  window.addEventListener('popstate', pageview);
  pageview();
})();
