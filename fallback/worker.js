// Zone-fallback Worker for makes.fyi.
//
// Before this Worker, an unclaimed name like `nope.makes.fyi` did not answer
// at all: the zone had no record for it, DNS returned NXDOMAIN, and a probe
// reported HTTP 000 — indistinguishable from our infrastructure being down,
// and the reason the zone's 4xx signature was unreadable. With a proxied
// wildcard record (`* AAAA 100::`, added once at Cloudflare — see README.md,
// "The fallback Worker") and the `*.makes.fyi/*` route declared in
// wrangler.jsonc, every name that resolves to the edge without anything
// configured for it gets a clean, deliberate 404: free names are announced as
// free with the claim command attached, claimed-but-dark names are identified
// as claimed, and nothing ever answers with a dead connection again.
//
// THE WILDCARD IS SAFE ONLY BECAUSE OF THE HANDBACKS BELOW — read this before
// touching either half. A zone route takes precedence over a Custom Domain on
// the same hostname (documented Cloudflare behaviour, and the reason an
// earlier wildcard-route attempt on this zone took api. and docs. down and was
// rolled back). This Worker is allowed to hold the wildcard only because it
// hands every hostname that predates it back to whoever served it. The
// asymmetry it exploits: `fetch()` from a Worker DOES invoke a same-zone
// Custom Domain, but does NOT re-enter a same-zone Route — so the passthrough
// below lands exactly on the Worker that owned the hostname before.
//
// What reaches this Worker once the wildcard record + route exist:
//   - the apex makes.fyi is matched by `*.makes.fyi/*` on this zone (measured:
//     an earlier wildcard route here shadowed the apex landing page), so the
//     apex is fetched back through to its Custom Domain — the shadowing route
//     changes nothing for it either.
//   - api./docs./mcp.makes.fyi -> fetched through to their Custom-Domain
//     Workers; the shadowing route changes nothing for them.
//   - www.makes.fyi            -> 301 to agentdomains.co, the same retirement
//     the apex Worker performs for makes.fyi itself (www has no Custom Domain;
//     fetching it would land back on the wildcard record).
//   - forward/proxy hostnames never arrive: their exact per-hostname routes
//     win on route specificity.
//   - names pointing at someone else's server never arrive: their own
//     (DNS-only) exact records answer, so the request never touches our edge.
//   - what DOES arrive is every name with no exact record of its own — an
//     unclaimed name, a claimed-but-recordless one, a TXT-only name, a
//     sub-label of any of these — which is precisely the population this
//     Worker is for. A request that got this far has, by construction, no
//     DNS record of its own to serve it, so there is nothing to fetch
//     through to; the answer is always made here.

const API = "https://api.agentdomains.co";
const DOMAIN = "makes.fyi";
const CANONICAL_HOST = "agentdomains.co";
const RESOLVE_TTL = 60; // seconds to edge-cache a host's claim state
const UNKNOWN_TTL = 5; // ... and re-ask sooner when the answer was "unknown"

// Hostnames whose pre-existing handler must keep answering exactly as before.
// The apex is in here because a wildcard route on this zone has been observed
// to shadow it (see README's "two Workers with no routes" for that rollback);
// fetching `https://makes.fyi/...` invokes its Custom Domain, which still does
// the makes.fyi -> agentdomains.co redirect. api./docs./mcp. likewise get
// fetched back to their own Custom-Domain Workers.
const PASSTHROUGH = new Set([DOMAIN, `api.${DOMAIN}`, `docs.${DOMAIN}`, `mcp.${DOMAIN}`]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const accept = request.headers.get("Accept") || "";

    if (PASSTHROUGH.has(host)) {
      // Method, headers and body verbatim: api.makes.fyi takes POSTs from the
      // CLI and mcp. forwards JSON-RPC. `new Request(url, request)` copies all
      // three, and the same-zone fetch invokes the Custom Domain behind it.
      return fetch(new Request(url.toString(), request));
    }

    if (host === `www.${DOMAIN}`) {
      const target = new URL(url);
      target.protocol = "https:";
      target.hostname = CANONICAL_HOST;
      target.port = "";
      return Response.redirect(target.toString(), 301);
    }

    const suffix = `.${DOMAIN}`;
    const label = host.endsWith(suffix) ? host.slice(0, -suffix.length) : "";

    // A sub-label (www.shop.makes.fyi — the route's * spans dots) is its own
    // name; the availability API only knows whole labels, so there is no free
    // claim to advertise, only the fact that nothing is configured here.
    if (label === "" || label.includes(".")) {
      return darkPage(host, accept, "Nothing here yet",
        `<p><code>${esc(host)}</code> has nothing configured at this name.</p>`, false);
    }

    switch (await claimState(host, label, ctx)) {
      case "free":
        return notFoundPage(host, label, accept);
      case "reserved":
        return darkPage(host, accept, "This name is reserved",
          `<p><code>${esc(host)}</code> is a reserved name and is not available for claim.</p>`, false);
      case "taken":
        // Claimed, yet its request reached the fallback — so the name has no
        // record of its own. Say claimed-but-dark; never call it free.
        return darkPage(host, accept, "Claimed, not serving",
          `<p><code>${esc(host)}</code> is claimed, but nothing is answering at this hostname yet. Point it at a server (<a href="https://docs.agentdomains.co">docs.agentdomains.co</a>) or release it with <code>agentdomains delete</code>.</p>`, true);
      default:
        // "unknown": the availability API was unreachable or unhappy. Guessing
        // either way could advertise away somebody's name or call a live name
        // free, so answer honestly that we could not check. 503, not 502 —
        // the edge replaces 502 bodies with its own HTML page.
        return new Response(
          JSON.stringify({
            error: `cannot check whether ${host} is claimed right now`,
            upstream: "agentdomains-api",
            retry: true,
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          }
        );
    }
  },
};

// claimState asks the origin API whether the label is taken, edge-cached per
// host the way the forward Worker caches its resolve, so a probe storm on one
// name costs the origin one lookup a minute. "unknown" means no definite
// answer — the origin was unreachable, unhappy, or rate-limited us.
async function claimState(host, label, ctx) {
  const cacheKey = new Request(
    `https://fallback-cache.agentdomains.internal/${encodeURIComponent(host)}`
  );
  const cached = await caches.default.match(cacheKey);
  if (cached) return (await cached.json()).state;

  let state = "unknown";
  try {
    const resp = await fetch(
      `${API}/v1/available?label=${encodeURIComponent(label)}&domain=${DOMAIN}`,
      { headers: { Accept: "application/json" } }
    );
    if (resp.ok) {
      const body = await resp.json();
      // reason separates "taken" from "invalid" (a reserved label); both are
      // definite answers, and neither means the name is free.
      if (body.reason === "taken") state = "taken";
      else if (body.available === true) state = "free";
      else state = "reserved";
    }
  } catch {
    /* stay unknown */
  }

  const ttl = state === "unknown" ? UNKNOWN_TTL : RESOLVE_TTL;
  ctx.waitUntil(
    caches.default.put(
      cacheKey,
      new Response(JSON.stringify({ state }), {
        headers: { "Content-Type": "application/json", "Cache-Control": `max-age=${ttl}` },
      })
    )
  );
  return state;
}

// notFoundPage is the answer an unclaimed name should give: 404 with the
// hostname echoed back — JSON for a client that asked with Accept, a short
// page for a browser — so "nobody has taken this name" is visibly different
// from "the service is down". HTTP 000 proved nothing; a 404 proves the zone
// is configured and the name is free, claim command and all.
function notFoundPage(host, label, accept) {
  if (wantsJSON(accept)) {
    return jsonResponse({
      error: `${host} is not claimed`,
      fqdn: host,
      available: true,
      claim: `agentdomains claim ${label} --email you@example.com`,
      docs: "https://docs.agentdomains.co",
    });
  }
  return htmlPage(
    "Nothing claimed here",
    `<p><code>${esc(host)}</code> is not claimed yet — the name is free. Take it with one command:</p>
<pre>agentdomains claim ${esc(label)} --email you@example.com</pre>
<p>Full docs: <a href="https://agentdomains.co">agentdomains.co</a>.</p>`
  );
}

// darkPage answers for a hostname that exists (claimed or reserved) but
// serves nothing — a 404 that never calls the name free.
function darkPage(host, accept, title, bodyHtml, claimed) {
  if (wantsJSON(accept)) {
    return jsonResponse({
      error: claimed ? `${host} is claimed but not serving` : `${host} serves nothing`,
      fqdn: host,
      available: false,
      docs: "https://docs.agentdomains.co",
    });
  }
  return htmlPage(title, bodyHtml);
}

function wantsJSON(accept) {
  return accept.toLowerCase().includes("application/json");
}

function jsonResponse(payload) {
  return new Response(JSON.stringify(payload), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

function htmlPage(title, bodyHtml) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<style>body{font-family:system-ui,sans-serif;max-width:32rem;margin:6rem auto;padding:0 1rem;color:#111}
h1{font-size:1.4rem}code,pre{background:#f3f3f3;padding:.1rem .3rem;border-radius:.3rem}
pre{padding:.6rem;overflow:auto}p.brand{color:#888;margin-top:2rem}</style></head>
<body><h1>${esc(title)}</h1>${bodyHtml}
<p class="brand">AgentDomains · agentdomains.co</p></body></html>`;
  return new Response(html, {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
