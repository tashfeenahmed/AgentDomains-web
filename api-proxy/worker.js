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
// Headers are forwarded verbatim, and that is load-bearing rather than lazy.
// The origin's clientIP() reads CF-Connecting-IP first and falls back to
// X-Forwarded-For, and its audit rows keep the caller's User-Agent, so both
// have to survive the hop. Building a fresh Headers object here and copying
// only what looked necessary is how those quietly become "the Worker" in every
// audit row and every per-IP rate-limit bucket. Don't.

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
