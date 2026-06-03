// Reverse-proxy Worker for api.makes.fyi -> AgentDomains origin.
//
// Why a Worker instead of a proxied DNS record? The zone's SSL/TLS mode is
// "Full", so Cloudflare's normal proxy would try to reach the origin on :443,
// but the origin serves plain HTTP on :80. This Worker presents valid edge TLS
// on api.makes.fyi and forwards to the origin over HTTP.
//
// The origin URL lives in the ORIGIN Worker secret (wrangler secret put ORIGIN)
// so the repo never names the origin host. It must be a hostname, NOT a raw IP:
// Workers refuse direct-IP fetches (Cloudflare error 1003).
//
// Headers are forwarded verbatim, so the origin still sees CF-Connecting-IP
// (added at the edge) for rate-limiting and audit.

export default {
  async fetch(request, env) {
    if (!env.ORIGIN) {
      return new Response("origin not configured", { status: 500 });
    }
    const url = new URL(request.url);
    const init = {
      method: request.method,
      headers: request.headers,
      redirect: "manual",
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
    }
    return fetch(env.ORIGIN + url.pathname + url.search, init);
  },
};
