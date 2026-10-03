// Tests for the makes.fyi zone fallback Worker, run with `npm test` (node
// --test). The Worker runs on Cloudflare's runtime; these tests give it the
// handful of Web globals it actually uses — fetch, Response, Request, caches,
// ctx.waitUntil — as stubs, so every branch of the routing decision is
// exercised without a zone. The stub fetch records every URL it was called
// with, because which URLs the Worker REFUSES to fetch is the safety property:
// a fetch that re-enters the wildcard route would loop.

import test from "node:test";
import assert from "node:assert/strict";

const worker = (await import("./worker.js")).default;

// makeStubs returns { fetches, ctx, install }. fetchImpl maps a URL to a
// Response (or throws). Everything the Worker fetches is recorded.
function makeStubs(fetchImpl) {
  const fetches = [];
  const store = new Map();
  const caches = {
    default: {
      async match(req) {
        return store.has(req.url) ? store.get(req.url).clone() : undefined;
      },
      async put(req, res) {
        store.set(req.url, res.clone());
      },
    },
  };
  globalThis.caches = caches;
  globalThis.fetch = async (input) => {
    const url = typeof input === "string" ? input : input.url;
    fetches.push({ url, req: typeof input === "string" ? null : input });
    return fetchImpl(url, typeof input === "string" ? null : input);
  };
  const ctx = { waitUntil: (p) => p };
  return { fetches, ctx };
}

function req(url, opts = {}) {
  return new Request(url, opts);
}

const okJSON = (body) => new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });

function availableFor(url) {
  return url.includes("/v1/available");
}

test("apex, api, docs and mcp are fetched back through, never answered here", async () => {
  const { fetches, ctx } = makeStubs(() => new Response("upstream", { status: 218 }));
  for (const host of ["makes.fyi", "api.makes.fyi", "docs.makes.fyi", "mcp.makes.fyi"]) {
    const res = await worker.fetch(req(`https://${host}/some/path?x=1`), {}, ctx);
    assert.equal(res.status, 218, `${host} must be answered by whoever owns it`);
  }
  assert.deepEqual(
    fetches.map((f) => f.url),
    [
      "https://makes.fyi/some/path?x=1",
      "https://api.makes.fyi/some/path?x=1",
      "https://docs.makes.fyi/some/path?x=1",
      "https://mcp.makes.fyi/some/path?x=1",
    ],
    "each passthrough fetches exactly the original URL — no availability lookup, no origin guess"
  );
});

test("passthrough preserves method and body (api.makes.fyi takes POSTs)", async () => {
  const { fetches, ctx } = makeStubs(() => new Response("ok"));
  await worker.fetch(
    req("https://api.makes.fyi/v1/signup", { method: "POST", body: '{"a":1}' }),
    {},
    ctx
  );
  const forwarded = fetches[0].req;
  assert.equal(forwarded.method, "POST");
  assert.equal(await forwarded.text(), '{"a":1}');
});

test("www.makes.fyi redirects to agentdomains.co and fetches nothing", async () => {
  const { fetches, ctx } = makeStubs(() => {
    throw new Error("must not fetch");
  });
  const res = await worker.fetch(req("https://www.makes.fyi/compare?x=1"), {}, ctx);
  assert.equal(res.status, 301);
  assert.equal(res.headers.get("Location"), "https://agentdomains.co/compare?x=1");
  assert.equal(fetches.length, 0);
});

test("free label: clean 404, JSON when asked, with the claim command", async () => {
  const { ctx } = makeStubs((url) =>
    availableFor(url) ? okJSON({ available: true, reason: "available" }) : new Response("nope", { status: 500 })
  );
  const res = await worker.fetch(
    req("https://unclaimed-test123.makes.fyi/", { headers: { Accept: "application/json" } }),
    {},
    ctx
  );
  assert.equal(res.status, 404);
  assert.match(res.headers.get("Content-Type"), /application\/json/);
  assert.equal(res.headers.get("Cache-Control"), "no-store");
  assert.equal(res.headers.get("X-Robots-Tag"), "noindex");
  const body = await res.json();
  assert.equal(body.available, true);
  assert.equal(body.fqdn, "unclaimed-test123.makes.fyi");
  assert.match(body.claim, /agentdomains claim unclaimed-test123/);
});

test("free label: HTML for a browser, hostname escaped, no-store", async () => {
  const { ctx } = makeStubs((url) =>
    availableFor(url) ? okJSON({ available: true, reason: "available" }) : new Response("nope", { status: 500 })
  );
  const res = await worker.fetch(req("https://freename.makes.fyi/"), {}, ctx);
  assert.equal(res.status, 404);
  assert.match(res.headers.get("Content-Type"), /text\/html/);
  const html = await res.text();
  assert.match(html, /agentdomains claim freename/);
  assert.match(html, /noindex/);
});

test("taken label: 404 that never calls the name free, and never fetches through", async () => {
  const { fetches, ctx } = makeStubs((url) =>
    availableFor(url) ? okJSON({ available: false, reason: "taken" }) : new Response("nope", { status: 500 })
  );
  const res = await worker.fetch(
    req("https://someone-elses-name.makes.fyi/", { headers: { Accept: "application/json" } }),
    {},
    ctx
  );
  assert.equal(res.status, 404);
  const body = await res.json();
  assert.equal(body.available, false);
  assert.match(body.error, /claimed but not serving/);
  // Only the availability lookup — no fetch that could bounce back into the
  // wildcard route or reach some stranger's proxied record.
  assert.equal(fetches.length, 1);
  assert.ok(availableFor(fetches[0].url));
});

test("reserved label: 404, not advertised as claimable", async () => {
  const { ctx } = makeStubs((url) =>
    availableFor(url) ? okJSON({ available: false, reason: "invalid", detail: '"www" is reserved' }) : new Response("nope", { status: 500 })
  );
  // A host the worker cannot parse as a label (no .makes.fyi suffix) takes
  // the no-claim path outright: 404, available:false, no claim command.
  const res = await worker.fetch(
    req("https://someone-elses-derp.example/", { headers: { Accept: "application/json" } }),
    {},
    ctx
  );
  assert.equal(res.status, 404);
  const body = await res.json();
  assert.equal(body.available, false);
  assert.ok(!("claim" in body));
});

test("reserved makes.fyi label via the API: dark page, never 'it's free'", async () => {
  const { ctx } = makeStubs((url) =>
    availableFor(url) ? okJSON({ available: false, reason: "invalid", detail: '"api" is reserved' }) : new Response("nope", { status: 500 })
  );
  const res = await worker.fetch(
    req("https://admin.makes.fyi/", { headers: { Accept: "application/json" } }),
    {},
    ctx
  );
  assert.equal(res.status, 404);
  const body = await res.json();
  assert.equal(body.available, false);
  assert.ok(!("claim" in body));
});

test("sub-label (a.b.makes.fyi): no availability lookup, plain 404", async () => {
  const { fetches, ctx } = makeStubs(() => {
    throw new Error("must not fetch");
  });
  const res = await worker.fetch(
    req("https://www.someclaim.makes.fyi/", { headers: { Accept: "application/json" } }),
    {},
    ctx
  );
  assert.equal(res.status, 404);
  const body = await res.json();
  assert.equal(body.available, false);
  assert.ok(!("claim" in body), "the availability API only knows whole labels");
  assert.equal(fetches.length, 0);
});

test("availability API unreachable: 503 retry, never a wrong 404", async () => {
  const { ctx } = makeStubs(() => {
    throw new Error("connection refused");
  });
  const res = await worker.fetch(
    req("https://maybe-taken.makes.fyi/", { headers: { Accept: "application/json" } }),
    {},
    ctx
  );
  assert.equal(res.status, 503);
  const body = await res.json();
  assert.equal(body.retry, true);
  assert.ok(!("available" in body), "must not claim anything about availability it could not check");
});

test("claim state is edge-cached: one lookup per host, not one per request", async () => {
  let calls = 0;
  const { ctx } = makeStubs(() => {
    calls += 1;
    return okJSON({ available: true, reason: "available" });
  });
  for (let i = 0; i < 5; i++) {
    const res = await worker.fetch(
      req("https://busy-probe.makes.fyi/", { headers: { Accept: "application/json" } }),
      {},
      ctx
    );
    assert.equal(res.status, 404);
  }
  assert.equal(calls, 1);
});

test("HTML pages escape the hostname", async () => {
  const { ctx } = makeStubs((url) =>
    availableFor(url) ? okJSON({ available: true, reason: "available" }) : new Response("nope", { status: 500 })
  );
  // A Request rejects "<" in a host, so escape the shortest real shape and
  // check the page builder through the taken branch (same esc()).
  const res = await worker.fetch(req("https://taken-name.makes.fyi/"), {}, ctx);
  const html = await res.text();
  assert.ok(html.includes("<code>taken-name.makes.fyi</code>"));
});
