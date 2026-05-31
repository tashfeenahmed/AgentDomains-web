// Reverse-proxy Worker for api.makes.fyi -> AgentDNS origin (Oracle VM).
//
// Why a Worker instead of a proxied DNS record? The zone's SSL/TLS mode is
// "Full", so Cloudflare's normal proxy would try to reach the origin on :443,
// but the origin serves plain HTTP on :80. This Worker presents valid edge TLS
// on api.makes.fyi and forwards to the origin over HTTP.
//
// We fetch a DNS-only hostname (origin.makes.fyi), NOT the raw IP: Workers
// refuse direct-IP fetches (Cloudflare error 1003). origin.makes.fyi is a
// grey-clouded A record pointing straight at the Oracle box.
//
// Headers are forwarded verbatim, so the origin still sees CF-Connecting-IP
// (added at the edge) for rate-limiting and audit.

const ORIGIN = "http://origin.makes.fyi";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const init = {
      method: request.method,
      headers: request.headers,
      redirect: "manual",
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
    }
    return fetch(ORIGIN + url.pathname + url.search, init);
  },
};
