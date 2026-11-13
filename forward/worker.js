// URL-forwarding Worker for AgentDomains.
//
// This Worker has NO wildcard routes. The API server creates a per-hostname
// Worker route ("<label>.<domain>/*" -> this script) via the Cloudflare API for
// each URL forward, and deletes it when the forward is removed. So the Worker
// only ever runs for hostnames that are genuinely forwards — it can never shadow
// the api./docs. custom-domain Workers or the apex landing pages (an earlier
// wildcard-route attempt did exactly that and was rolled back).
//
// For each request it asks the origin API which URL the host forwards to, then
// issues a 301/302 redirect (optionally preserving the path+query), or — when
// cloaking is enabled — returns an HTML page that frames the target.
//
// The resolve lookup is edge-cached (caches.default) keyed by host so a busy
// forward doesn't hit the origin on every request.

const API = "https://api.agentdomains.co";
const RESOLVE_TTL = 60; // seconds to cache a host's forward config at the edge

// Sentinel for "we could not ask the API" (network error / non-404 failure).
// Distinct from a null result, which is a CONFIRMED 404 from the API. Never
// cached, so the next request asks again immediately.
const UNRESOLVED = Symbol("unresolved");

// Pro visitor stats: one Analytics Engine data point per request that reaches
// a forward or proxy (DNS-only names never touch our edge, so they have none).
// index1 = hostname so the API can query one name cheaply. blob4 marks a page
// view: a GET that asks for HTML from something that is not an obvious bot.
// Never awaited and never throws: stats must not break a visitor's request.
const BOT_UA = /bot|crawl|spider|slurp|curl|wget|python|go-http|httpclient|headless|monitor|uptime/i;
function recordVisit(env, ctx, request, host, kind, status) {
  try {
    if (!env.VISITS) return;
    const ua = request.headers.get("user-agent") || "";
    const page = request.method === "GET" &&
      (request.headers.get("accept") || "").includes("text/html") && !BOT_UA.test(ua);
    env.VISITS.writeDataPoint({
      indexes: [host],
      blobs: [host, kind, (request.cf && request.cf.country) || "", page ? "1" : "0"],
      doubles: [1, status || 0],
    });
  } catch (_) {
    // ignore
  }
  // Daily counters in D1 are what the API reads (Analytics Engine above needs
  // a separate API token to query). Two upserts, after the response is sent.
  try {
    if (!env.VISITS_DB || !ctx) return;
    const ua = request.headers.get("user-agent") || "";
    const page = request.method === "GET" &&
      (request.headers.get("accept") || "").includes("text/html") && !BOT_UA.test(ua);
    const day = new Date().toISOString().slice(0, 10);
    const country = (request.cf && request.cf.country) || "";
    ctx.waitUntil(env.VISITS_DB.batch([
      env.VISITS_DB.prepare(
        "INSERT INTO visits(host, day, requests, page_views) VALUES(?1, ?2, 1, ?3) " +
        "ON CONFLICT(host, day) DO UPDATE SET requests = requests + 1, page_views = page_views + ?3"
      ).bind(host, day, page ? 1 : 0),
      env.VISITS_DB.prepare(
        "INSERT INTO visit_countries(host, day, country, requests) VALUES(?1, ?2, ?3, 1) " +
        "ON CONFLICT(host, day, country) DO UPDATE SET requests = requests + 1"
      ).bind(host, day, country),
    ]).catch(() => {}));
  } catch (_) {
    // ignore
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    const fwd = await resolveForward(host, ctx);
    if (fwd === UNRESOLVED) {
      // The API was unreachable or 5xx'd, so we can't tell whether this host
      // forwards. A retryable 502, never the 404 page: a live forward must not
      // look dead to browsers and crawlers during an API blip.
      return upstreamUnavailable(host);
    }
    if (!fwd) {
      // Confirmed by the API: no forward for this host (e.g. a just-deleted
      // forward whose placeholder lingers). Friendly 404 rather than a CF error.
      return notFound(host);
    }

    // Build the destination.
    let target = fwd.target;
    if (fwd.preserve_path && (url.pathname !== "/" || url.search)) {
      target = appendPath(target, url.pathname, url.search);
    }

    if (fwd.cloak) {
      recordVisit(env, ctx, request, host, "forward", 200);
      return cloakPage(target, host);
    }

    const code = fwd.code === 301 ? 301 : 302;
    recordVisit(env, ctx, request, host, "forward", code);
    return new Response(null, {
      status: code,
      headers: {
        Location: target,
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer-when-downgrade",
        "X-AgentDomains-Forward": host,
      },
    });
  },
};

// resolveForward fetches (and edge-caches) the forward config for a host.
// Returns null when the API confirms the host has no forward, and UNRESOLVED
// when the API could not be asked.
async function resolveForward(host, ctx) {
  const cacheKey = new Request(
    `https://forward-cache.agentdomains.internal/${encodeURIComponent(host)}`
  );
  const cache = caches.default;

  let cached = await cache.match(cacheKey);
  if (cached) {
    const body = await cached.json();
    return body.__miss ? null : body;
  }

  let resp;
  try {
    resp = await fetch(
      `${API}/v1/forward/resolve?host=${encodeURIComponent(host)}`,
      { headers: { Accept: "application/json" } }
    );
  } catch {
    // Origin unreachable (timeout, DNS, TLS): we do not know whether this host
    // forwards anywhere. Say so instead of guessing "no forward" (a cached-
    // forever-looking 404 that crawlers index). Not cached; next request asks.
    return UNRESOLVED;
  }

  if (resp.status === 404) {
    // Cache the negative result briefly too, so unknown hosts don't hammer origin.
    ctx.waitUntil(
      cache.put(
        cacheKey,
        new Response(JSON.stringify({ __miss: true }), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": `max-age=${RESOLVE_TTL}`,
          },
        })
      )
    );
    return null;
  }
  if (!resp.ok) return UNRESOLVED; // transient origin error: NOT a missing forward

  const fwd = await resp.json();
  ctx.waitUntil(
    cache.put(
      cacheKey,
      new Response(JSON.stringify(fwd), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `max-age=${RESOLVE_TTL}`,
        },
      })
    )
  );
  return fwd;
}

// appendPath joins the incoming request's path+query onto the target URL,
// preserving any path the target itself already has.
function appendPath(target, pathname, search) {
  try {
    const t = new URL(target);
    // Join base path and incoming path without doubling slashes.
    const basePath = t.pathname.replace(/\/$/, "");
    const addPath = pathname === "/" ? "" : pathname;
    t.pathname = (basePath + addPath) || "/";
    // Incoming query wins; if none, keep the target's own query.
    if (search) t.search = search;
    return t.toString();
  } catch {
    return target + pathname + search;
  }
}

function notFound(host) {
  return new Response(page("Nothing here yet", `<code>${esc(host)}</code> isn't forwarding anywhere.`), {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

// A 502, not a 404: the forward may well exist — we just couldn't ask. Keep it
// explicitly no-store so no intermediary remembers the failure, and say
// "temporarily" so nobody treats the name as dead.
function upstreamUnavailable(host) {
  return new Response(
    page("Check unavailable", `We couldn't reach the forwarding service to look up <code>${esc(host)}</code>. This is temporary — try again in a moment.`),
    {
      status: 502,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    }
  );
}

// cloakPage keeps the AgentDomains host in the address bar and frames the target.
function cloakPage(target, host) {
  const t = esc(target);
  const html = `<!doctype html><html><head><meta charset="utf-8">
<title>${esc(host)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>html,body,iframe{margin:0;padding:0;height:100%;width:100%;border:0;overflow:hidden}</style>
</head><body>
<iframe src="${t}" allow="fullscreen" referrerpolicy="no-referrer-when-downgrade"></iframe>
</body></html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function page(title, body) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>body{font-family:system-ui,sans-serif;max-width:32rem;margin:6rem auto;padding:0 1rem;color:#111}
h1{font-size:1.4rem}code{background:#f3f3f3;padding:.1rem .3rem;border-radius:.3rem}
p.brand{color:#888;margin-top:2rem}</style></head>
<body><h1>${esc(title)}</h1><p>${body}</p>
<p class="brand">AgentDomains · agentdomains.co</p></body></html>`;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
