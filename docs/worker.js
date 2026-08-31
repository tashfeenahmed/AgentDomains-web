// The docs Worker: it serves the documentation, and it retires docs.makes.fyi.
//
// Same rule as the apex Worker one directory up — the docs live at exactly one
// address now, so docs.makes.fyi permanently redirects to the same path on
// docs.agentdomains.co and docs.agentdomains.co itself falls through to the
// static assets. `run_worker_first: true` in wrangler.jsonc is what lets this
// script see a request for "/" at all; without it the asset server would answer
// it first and the redirect would never fire.

const REDIRECT_HOST = "docs.makes.fyi";
const CANONICAL_HOST = "docs.agentdomains.co";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === REDIRECT_HOST) {
      const target = new URL(url);
      target.protocol = "https:";
      target.hostname = CANONICAL_HOST;
      target.port = "";
      return Response.redirect(target.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
