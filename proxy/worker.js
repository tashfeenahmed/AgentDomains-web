// Reverse-proxy Worker for AgentDomains.
//
// Lets a subdomain we host (e.g. giganetwork.agentdomains.co) SERVE a backend
// that lives somewhere else, over HTTPS, with our edge certificate — without the
// visitor ever leaving our hostname and without the backend's operator having to
// provision a cert for our name.
//
// Same safety model as agentdns-forward: this Worker has NO routes of its own.
// The API server binds a per-hostname route ("<label>.<domain>/*" -> this
// script) when a reverse-proxy is created and removes it on teardown, so the
// Worker can never run for api./docs./apex.
//
// For each request it looks up the origin host for the incoming hostname, then
// fetches the origin BY ITS OWN NAME (so the origin's vhost + TLS accept it) and
// streams the response back. Redirects that point at the origin host are
// rewritten back to our hostname so the visitor stays put.
//
// Origin lookup order: (1) pinned ORIGINS var, (2) the resolve endpoint on the
// API (edge-cached). The pinned map lets a host be proxied before the API knows
// about it (bootstrap/testing).

const API = "https://api.agentdomains.co";
const RESOLVE_TTL = 60; // seconds to edge-cache a host's origin

// Headers that must not be forwarded verbatim between hops.
const HOP_BY_HOP = new Set([
  "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
  "te", "trailer", "transfer-encoding", "upgrade",
]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    const origin = await resolveOrigin(host, env, ctx);
    if (!origin) {
      return notFound(host);
    }

    // Build the upstream URL: same path+query, but at the origin host over HTTPS.
    // Setting the hostname makes fetch() use the origin for both SNI and the Host
    // header, which is exactly why the origin's vhost accepts the request.
    const upstream = new URL(url.toString());
    upstream.protocol = "https:";
    upstream.hostname = origin;
    upstream.port = "";

    const reqHeaders = new Headers(request.headers);
    reqHeaders.delete("host");
    for (const h of HOP_BY_HOP) reqHeaders.delete(h);
    // Tell the origin who the public caller really is / what host they used.
    reqHeaders.set("X-Forwarded-Host", host);
    reqHeaders.set("X-Forwarded-Proto", "https");

    let resp;
    try {
      resp = await fetch(upstream.toString(), {
        method: request.method,
        headers: reqHeaders,
        body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
        redirect: "manual",
      });
    } catch (e) {
      return badGateway(host, origin, e);
    }

    // Copy the response, rewriting any Location that points at the origin host
    // back to our hostname so redirects keep the visitor on our domain.
    const outHeaders = new Headers(resp.headers);
    for (const h of HOP_BY_HOP) outHeaders.delete(h);
    const loc = outHeaders.get("location");
    if (loc) {
      const rewritten = rewriteHost(loc, origin, host);
      if (rewritten) outHeaders.set("location", rewritten);
    }
    outHeaders.set("X-AgentDomains-Proxy", host);

    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: outHeaders,
    });
  },
};

// resolveOrigin returns the backend hostname for a public host, or null.
async function resolveOrigin(host, env, ctx) {
  // 1) Pinned overrides from the ORIGINS var.
  try {
    const pinned = JSON.parse(env.ORIGINS || "{}");
    if (pinned[host]) return String(pinned[host]).toLowerCase();
  } catch {
    /* ignore malformed var */
  }

  // 2) The resolve endpoint (edge-cached, positive + negative).
  const cacheKey = new Request(
    `https://proxy-cache.agentdomains.internal/${encodeURIComponent(host)}`
  );
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) {
    const body = await cached.json();
    return body.__miss ? null : body.origin;
  }

  let resp;
  try {
    resp = await fetch(
      `${API}/v1/proxy/resolve?host=${encodeURIComponent(host)}`,
      { headers: { Accept: "application/json" } }
    );
  } catch {
    return null; // transient: fail to 404 page rather than error
  }

  if (resp.status === 404) {
    ctx.waitUntil(cache.put(cacheKey, miss()));
    return null;
  }
  if (!resp.ok) return null;

  const body = await resp.json();
  const origin = body && body.origin ? String(body.origin).toLowerCase() : null;
  if (!origin) {
    ctx.waitUntil(cache.put(cacheKey, miss()));
    return null;
  }
  ctx.waitUntil(
    cache.put(
      cacheKey,
      new Response(JSON.stringify({ origin }), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `max-age=${RESOLVE_TTL}`,
        },
      })
    )
  );
  return origin;
}

function miss() {
  return new Response(JSON.stringify({ __miss: true }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `max-age=${RESOLVE_TTL}`,
    },
  });
}

// rewriteHost rewrites an absolute URL's host from `from` to `to`, preserving
// path/query/scheme. Returns null when the URL doesn't point at `from`.
function rewriteHost(loc, from, to) {
  try {
    const u = new URL(loc);
    if (u.hostname.toLowerCase() !== from.toLowerCase()) return null;
    u.hostname = to;
    return u.toString();
  } catch {
    return null; // relative Location: leave as-is (already on our host)
  }
}

function notFound(host) {
  return new Response(page("Nothing here yet", `<code>${esc(host)}</code> isn't proxying anywhere.`), {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function badGateway(host, origin, err) {
  return new Response(
    page("Upstream unavailable",
      `<code>${esc(host)}</code> couldn't reach its backend <code>${esc(origin)}</code>.`),
    { status: 502, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
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
