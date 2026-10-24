// Behavior tests for the forwarding Worker — no wrangler needed:
//   node --test forward/worker.test.mjs
// It runs the real module against stubbed globals (fetch, caches). The
// module reads those lazily inside fetch(), so importing it is safe.
//
// Regression pinned here: when the origin API is DOWN or 5xx, the Worker used
// to answer 404 "isn't forwarding anywhere" — telling browsers and crawlers a
// live forward had died. An unreachable API must be a retryable 502 instead,
// while a real 404 from the API stays a 404.
import assert from "node:assert/strict";
import test from "node:test";

// --- stub the Workers globals the module touches at request time -----------
class MemCache {
  constructor() { this.entries = new Map(); }
  async match(req) { return this.entries.get(req.url); }
  async put(req, res) { this.entries.set(req.url, res.clone()); }
}
globalThis.caches = { default: new MemCache() };

const { default: worker } = await import("./worker.js");

async function call(url, fetchImpl) {
  const realFetch = globalThis.fetch;
  globalThis.fetch = fetchImpl;
  try {
    return await worker.fetch(new Request(url), {}, { waitUntil: () => {} });
  } finally {
    globalThis.fetch = realFetch;
  }
}

test("origin 5xx is a retryable 502, not a 404", async () => {
  const res = await call("https://meow.makes.fyi/hi", async () => new Response("boom", { status: 500 }));
  assert.equal(res.status, 502);
  assert.equal(res.headers.get("cache-control"), "no-store");
  const html = await res.text();
  assert.match(html, /temporary/i);
  assert.doesNotMatch(html, /isn't forwarding/i);
});

test("unreachable origin is a 502 and the failure is not cached", async () => {
  const cache = globalThis.caches.default;
  cache.entries.clear();
  const res = await call("https://meow.makes.fyi/", async () => {
    throw new TypeError("network");
  });
  assert.equal(res.status, 502);
  await new Promise((r) => setImmediate(r));
  assert.equal(cache.entries.size, 0, "a failure answer must never enter the edge cache");
});

test("a confirmed 404 from the API still renders the 404 page", async () => {
  globalThis.caches.default.entries.clear();
  const res = await call("https://gone.makes.fyi/", async () => new Response("{}", { status: 404 }));
  assert.equal(res.status, 404);
  assert.match(await res.text(), /isn't forwarding anywhere/);
});

test("a live forward still redirects 302 with the target", async () => {
  globalThis.caches.default.entries.clear();
  const fwd = { target: "https://example.com/go", code: 302, preserve_path: false, cloak: false };
  const res = await call("https://me.makes.fyi/", async () => new Response(JSON.stringify(fwd), {
    status: 200, headers: { "Content-Type": "application/json" },
  }));
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("location"), "https://example.com/go");
});
