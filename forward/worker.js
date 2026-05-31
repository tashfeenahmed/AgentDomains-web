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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    const fwd = await resolveForward(host, ctx);
    if (!fwd) {
      // Proxied host with no forward configured (e.g. a just-deleted forward
      // whose placeholder lingers). Show a friendly 404 rather than a CF error.
      return notFound(host);
    }

    // Build the destination.
    let target = fwd.target;
    if (fwd.preserve_path && (url.pathname !== "/" || url.search)) {
      target = appendPath(target, url.pathname, url.search);
    }

    if (fwd.cloak) {
      return cloakPage(target, host);
    }

    const code = fwd.code === 301 ? 301 : 302;
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
// Returns null when the host has no forward.
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

  const resp = await fetch(
    `${API}/v1/forward/resolve?host=${encodeURIComponent(host)}`,
    { headers: { Accept: "application/json" } }
  );

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
  if (!resp.ok) return null; // transient origin error: fail open to 404 page

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
