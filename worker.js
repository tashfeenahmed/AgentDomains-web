// The apex Worker: it serves the landing pages, and it retires makes.fyi.
//
// agentdomains.co is the brand. makes.fyi was the original name and is still a
// live suffix for claimed subdomains (shop.makes.fyi and friends keep working —
// those hostnames are served by the forward/proxy Workers, never by this one),
// but the *site* now lives at one address. So a request to the makes.fyi apex is
// a permanent redirect to the same path on agentdomains.co, and everything else
// falls through to the static assets exactly as before.
//
// `run_worker_first: true` in wrangler.jsonc is what makes this possible: without
// it the asset server answers "/" and "/pricing" from disk and this script never
// runs, because a matching asset always wins. With it, every request enters here
// first and reaches the assets through env.ASSETS.fetch() — which still applies
// the html_handling: drop-trailing-slash rule, so /compare answers 200 as it did.

const REDIRECT_HOSTS = new Set(["makes.fyi", "www.makes.fyi"]);
const CANONICAL_HOST = "agentdomains.co";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (REDIRECT_HOSTS.has(url.hostname)) {
      const target = new URL(url);
      target.protocol = "https:";
      target.hostname = CANONICAL_HOST;
      // Drop any explicit :80 the http request carried, so the redirect names
      // https://agentdomains.co/... and not https://agentdomains.co:80/...
      target.port = "";
      return Response.redirect(target.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
