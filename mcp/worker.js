// MCP server for AgentDomains at mcp.agentdomains.co — the hosted counterpart
// to the `npx -y agentdomains-mcp` stdio server.
//
// Implements MCP Streamable HTTP, stateless: every JSON-RPC request arrives as
// a POST and is answered inline as JSON. No sessions, no SSE stream, so there
// is nothing to keep warm between calls and any client that speaks plain
// Streamable HTTP works. GET is answered 405 (we never open a server stream).
//
// Dependency-free on purpose. The MCP SDK pulls in Node built-ins that do not
// belong in a Worker, and the wire protocol we need here is small enough that
// hand-rolling initialize / tools/list / tools/call is the more robust choice.
//
// Auth is pure passthrough: the caller's `Authorization: Bearer adom_…` header
// is forwarded to the API untouched. This Worker never stores, inspects, or
// logs a key. CF-Connecting-IP is forwarded explicitly because /v1/signup is
// rate-limited per IP at the origin — without it every signup on earth would
// share this Worker's identity.

const DEFAULT_API_BASE = "https://api.agentdomains.co";
const PROTOCOL_VERSION = "2024-11-05";
const SERVER_INFO = { name: "agentdomains", version: "0.1.1" };

// What the origin sees in User-Agent for every call this Worker makes on a
// caller's behalf, so audit rows can tell hosted-MCP traffic apart from the CLI
// and from the stdio server. Derived from SERVER_INFO so the two never drift.
const HOSTED_USER_AGENT = `agentdomains-mcp-hosted/${SERVER_INFO.version}`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id",
  "Access-Control-Max-Age": "86400",
};

// ---------- tool definitions (kept in step with agentdomains-mcp) ----------

const domainProp = {
  domain: {
    type: "string",
    description:
      "Which domain to act under: 'makes.fyi' (the default) or 'agentdomains.co'. " +
      "The same label can exist under each, so pass this whenever you are not using the default.",
  },
};

const labelProp = {
  label: {
    type: "string",
    description: "The subdomain label, without the domain suffix (e.g. 'myapp' for myapp.makes.fyi).",
  },
};

/** /v1/subdomains/<label>[<suffix>][?domain=…] — mirrors resourcePath in the Go CLI. */
function resourcePath(label, suffix = "", domain) {
  let p = `/v1/subdomains/${encodeURIComponent(label)}${suffix}`;
  if (domain) p += `?domain=${encodeURIComponent(domain)}`;
  return p;
}

const TOOLS = [
  {
    name: "check_availability",
    description:
      "Check whether a subdomain label is free before claiming it. Requires no API key. " +
      "Returns { label, domain, fqdn, available, reason } where reason is 'available', 'taken', or " +
      "'invalid' (with a 'detail' explaining why the label is not usable).",
    inputSchema: { type: "object", properties: { ...labelProp, ...domainProp }, required: ["label"] },
    plan: (a) => {
      const q = new URLSearchParams({ label: String(a.label ?? "") });
      if (a.domain) q.set("domain", String(a.domain));
      return { method: "GET", path: `/v1/available?${q.toString()}` };
    },
  },
  {
    name: "signup",
    description:
      "Create a new AgentDomains account and get an API key. Requires no existing key. " +
      "IMPORTANT: the returned api_key is shown ONCE and is never retrievable again — you must store it " +
      "immediately (save it to ~/.agentdomains/config.json or set AGENTDOMAINS_API_KEY) or the account is lost. " +
      "The account is provisional: attach and confirm an email within 30 days (see the attach_email tool) or " +
      "it is deleted along with its domains. This endpoint is rate-limited per IP address.",
    inputSchema: { type: "object", properties: {} },
    plan: () => ({ method: "POST", path: "/v1/signup" }),
  },
  {
    name: "whoami",
    description:
      "Show the current account: id, state, attached email and whether it is verified, domains used, and which " +
      "domains are available to claim under. When quotas are disabled the response omits 'quota' and says " +
      "unlimited:true; 'max_subdomains' is the separate hard cap on how many names one account may hold at once.",
    inputSchema: { type: "object", properties: {} },
    plan: () => ({ method: "GET", path: "/v1/whoami" }),
  },
  {
    name: "attach_email",
    description:
      "Attach an email address to the account and send it a verification link. A human must click that link " +
      "within 30 days or the provisional account and its domains are deleted. Use this right after signup.",
    inputSchema: {
      type: "object",
      properties: {
        email: { type: "string", description: "The email address to attach and send the verification link to." },
      },
      required: ["email"],
    },
    plan: (a) => ({ method: "POST", path: "/v1/account/email", body: { email: a.email } }),
  },
  {
    name: "claim_domain",
    description:
      "Register a subdomain (label.makes.fyi or label.agentdomains.co) on this account, optionally creating its " +
      "first DNS record in the same call. An email is required the first time an account registers a name — pass " +
      "'email' here or call attach_email first; the name is reaped if that email is not confirmed within 30 days. " +
      "Returns the fqdn and, when a record was requested, the created record. The claim and its first record " +
      "succeed or fail together: if the record is malformed (400) or the provider refuses it (503) the label is " +
      "NOT claimed, so fix the record and call again. Re-claiming a name this account already holds answers " +
      "409 with owned:true — that means carry on using it, not pick another label.",
    inputSchema: {
      type: "object",
      properties: {
        ...labelProp,
        ...domainProp,
        email: {
          type: "string",
          description:
            "Required on the account's first registration if no email is attached yet. Sends a confirmation link.",
        },
        type: { type: "string", description: "Optional DNS record to create immediately: A, AAAA, CNAME, or TXT." },
        content: {
          type: "string",
          description: "Value for that record (an IP for A/AAAA, a hostname for CNAME, text for TXT).",
        },
        host: {
          type: "string",
          description: "Optional extra sub-label for the record (e.g. 'www' gives www.myapp.makes.fyi).",
        },
      },
      required: ["label"],
    },
    plan: (a) => {
      const body = { label: a.label };
      if (a.domain) body.domain = a.domain;
      if (a.email) body.email = a.email;
      if (a.type) {
        body.type = a.type;
        body.content = a.content ?? "";
        body.host = a.host ?? "";
      }
      return { method: "POST", path: "/v1/subdomains", body };
    },
  },
  {
    name: "list_domains",
    description:
      "List every subdomain on this account, with each one's DNS records and whether it is forwarding, " +
      "proxying, or delegated to external nameservers.",
    inputSchema: { type: "object", properties: {} },
    plan: () => ({ method: "GET", path: "/v1/subdomains" }),
  },
  {
    name: "get_domain",
    description:
      "Show one subdomain in full: its fqdn, DNS records, forward or proxy configuration, and delegation state.",
    inputSchema: { type: "object", properties: { ...labelProp, ...domainProp }, required: ["label"] },
    plan: (a) => ({ method: "GET", path: resourcePath(a.label, "", a.domain) }),
  },
  {
    name: "delete_domain",
    description:
      "DESTRUCTIVE AND IRREVERSIBLE: permanently delete a subdomain and every DNS record, forward, and proxy " +
      "attached to it. The hostname stops resolving immediately and the label is released for anyone else to " +
      "claim. There is no undo and no recovery. Only call this when the user has explicitly asked for this " +
      "specific name to be deleted.",
    inputSchema: { type: "object", properties: { ...labelProp, ...domainProp }, required: ["label"] },
    plan: (a) => ({ method: "DELETE", path: resourcePath(a.label, "", a.domain) }),
  },
  {
    name: "add_dns_record",
    description:
      "Add a DNS record to a subdomain you already own. Use type A or AAAA to point at an IP address, CNAME to " +
      "point at another hostname, or TXT for verification strings. Adding a record does not replace existing " +
      "ones; use delete_record to remove a single one. Refused with a 409 while the label carries a forward or " +
      "a proxy (they own the hostname) — call remove_forward or remove_proxy first, or add the record on a " +
      "sub-label via 'host', which is a different hostname and unaffected.",
    inputSchema: {
      type: "object",
      properties: {
        ...labelProp,
        type: { type: "string", description: "Record type: A, AAAA, CNAME, or TXT." },
        content: {
          type: "string",
          description: "Record value: an IP for A/AAAA, a hostname for CNAME, the string for TXT.",
        },
        host: {
          type: "string",
          description:
            "Optional extra sub-label under the name (e.g. 'www' creates www.myapp.makes.fyi). Omit for the name itself.",
        },
        ...domainProp,
      },
      required: ["label", "type", "content"],
    },
    plan: (a) => ({
      method: "POST",
      path: resourcePath(a.label, "/records", a.domain),
      body: { type: a.type, content: a.content, host: a.host ?? "" },
    }),
  },
  {
    name: "delete_record",
    description:
      "DESTRUCTIVE: permanently remove ONE DNS record from a subdomain, keeping the name and every other record. " +
      "Use this to undo a single record — a wrong IP, a spent ACME challenge — instead of delete_domain, which " +
      "takes the whole name. The record_id is the 'id' field shown by get_domain (and returned by claim_domain " +
      "and add_dns_record); it is not the record's name or content. The hostname stops resolving through that " +
      "record immediately and there is no undo.",
    inputSchema: {
      type: "object",
      properties: {
        ...labelProp,
        record_id: {
          type: "string",
          description: "The record's 'id' as reported by get_domain — not its name, type, or content.",
        },
        ...domainProp,
      },
      required: ["label", "record_id"],
    },
    plan: (a) => ({
      method: "DELETE",
      path: resourcePath(a.label, `/records/${encodeURIComponent(String(a.record_id))}`, a.domain),
    }),
  },
  {
    name: "add_acme_challenge",
    description:
      "Publish a Let's Encrypt DNS-01 challenge: creates a TXT record at _acme-challenge.<label>.<domain> with " +
      "the token your ACME client printed. Use this to get a certificate without exposing port 80 (for example " +
      "for a wildcard cert, or a host behind NAT). DNS propagates within seconds, then tell your ACME client to " +
      "continue. For a normal public web server, HTTP-01 validation needs no DNS record at all.",
    inputSchema: {
      type: "object",
      properties: {
        ...labelProp,
        value: {
          type: "string",
          description: "The challenge token from your ACME client, published verbatim as the TXT value.",
        },
        ...domainProp,
      },
      required: ["label", "value"],
    },
    plan: (a) => ({
      method: "POST",
      path: resourcePath(a.label, "/records", a.domain),
      body: { type: "TXT", content: a.value, host: "_acme-challenge" },
    }),
  },
  {
    name: "set_forward",
    description:
      "Forward (HTTP-redirect) a subdomain to another URL. Claims the label first if you do not own it yet, in " +
      "which case an email may be required exactly as for claim_domain. Defaults to a 302 temporary redirect that " +
      "preserves the request path and query. HTTPS at the edge is handled for you. " +
      "A forward TAKES OVER the hostname: any A/AAAA/CNAME record on the label itself is deleted as part of this " +
      "call and returned in 'replaced_records' — report those to the user, since the name no longer points where " +
      "it did. Records on a sub-label (www.myapp.makes.fyi) and TXT records are untouched. If the forward fails " +
      "to come up the replaced records are restored, with new ids.",
    inputSchema: {
      type: "object",
      properties: {
        ...labelProp,
        target: { type: "string", description: "Destination URL, including scheme (e.g. https://example.com/docs)." },
        permanent: {
          type: "boolean",
          description: "Use a 301 permanent redirect instead of the default 302 temporary one.",
        },
        preserve_path: {
          type: "boolean",
          description:
            "Append the incoming path and query to the target. Defaults to true; set false to always land on the target root.",
        },
        cloak: {
          type: "boolean",
          description:
            "Keep the AgentDomains hostname in the address bar and load the target inside a frame. Discouraged — breaks many sites.",
        },
        email: { type: "string", description: "Email, if this call also claims a new name on an account without one." },
        ...domainProp,
      },
      required: ["label", "target"],
    },
    plan: (a) => {
      const body = {
        target: a.target,
        permanent: a.permanent ?? false,
        preserve_path: a.preserve_path ?? true,
        cloak: a.cloak ?? false,
      };
      if (a.domain) body.domain = a.domain;
      if (a.email) body.email = a.email;
      return { method: "PUT", path: resourcePath(a.label, "/forward", a.domain), body };
    },
  },
  {
    name: "remove_forward",
    description:
      "Stop forwarding a subdomain. The name itself stays registered on the account; only the redirect is removed.",
    inputSchema: { type: "object", properties: { ...labelProp, ...domainProp }, required: ["label"] },
    plan: (a) => ({ method: "DELETE", path: resourcePath(a.label, "/forward", a.domain) }),
  },
  {
    name: "set_proxy",
    description:
      "Serve a backend at this subdomain through the AgentDomains edge, which terminates TLS with its own " +
      "certificate — this is how you get working HTTPS on an origin that has no certificate of its own (a bare " +
      "IP-less PaaS host, a tunnel, an internal box). Unlike a forward, the URL stays on your domain and the " +
      "response is proxied, not redirected. Claims the label first if needed. Like a forward, a proxy TAKES OVER " +
      "the hostname: A/AAAA/CNAME records on the label itself are deleted and returned in 'replaced_records', " +
      "while sub-label and TXT records are untouched. A proxy and a forward are mutually exclusive on one label. " +
      "Caveat: apps that hardcode their own hostname (OAuth callbacks especially) may need your new hostname " +
      "registered on their side.",
    inputSchema: {
      type: "object",
      properties: {
        ...labelProp,
        origin: {
          type: "string",
          description:
            "Backend hostname to proxy to, without a scheme (e.g. myapp.fly.dev). Must be a hostname, not an IP.",
        },
        email: { type: "string", description: "Email, if this call also claims a new name on an account without one." },
        ...domainProp,
      },
      required: ["label", "origin"],
    },
    plan: (a) => {
      const body = { origin: a.origin };
      if (a.domain) body.domain = a.domain;
      if (a.email) body.email = a.email;
      return { method: "PUT", path: resourcePath(a.label, "/proxy", a.domain), body };
    },
  },
  {
    name: "remove_proxy",
    description:
      "Stop reverse-proxying a subdomain, so the edge no longer serves the backend or terminates TLS for it. " +
      "The name stays registered on the account.",
    inputSchema: { type: "object", properties: { ...labelProp, ...domainProp }, required: ["label"] },
    plan: (a) => ({ method: "DELETE", path: resourcePath(a.label, "/proxy", a.domain) }),
  },
  {
    name: "delegate_nameservers",
    description:
      "Delegate the subdomain to your own nameservers, handing you full control of it and everything beneath it " +
      "(your own records, MX, deeper sub-domains). AgentDomains stops answering for the name, so its existing " +
      "records, forwards, and proxies no longer apply. Supply at least two nameservers.",
    inputSchema: {
      type: "object",
      properties: {
        ...labelProp,
        nameservers: {
          type: "array",
          items: { type: "string" },
          description: "Your nameserver hostnames, e.g. ['ns1.yourdns.com', 'ns2.yourdns.com']. At least two.",
        },
        ...domainProp,
      },
      required: ["label", "nameservers"],
    },
    plan: (a) => ({
      method: "PUT",
      path: resourcePath(a.label, "/ns", a.domain),
      body: { nameservers: a.nameservers },
    }),
  },
  {
    name: "delete_account",
    description:
      "DESTRUCTIVE AND IRREVERSIBLE, AND THE LARGEST ONE HERE: delete the whole AgentDomains account and " +
      "invalidate its API key, which cannot be recovered or reissued — every later tool call fails with a 401 " +
      "until a new signup. Without force it REFUSES while the account still holds names, answering 409 with the " +
      "list of them; that refusal is a safety net, so show the list to the user and get an explicit yes before " +
      "retrying. With force:true those names are deleted too: they stop resolving at once and are released for " +
      "anyone else to claim. Only ever call this when the user has asked to close the account itself — never as " +
      "cleanup after a task, and never to 'start fresh' on your own initiative.",
    inputSchema: {
      type: "object",
      properties: {
        force: {
          type: "boolean",
          description:
            "Delete the names the account still holds along with it. Without this the call is refused while any " +
            "name remains, which is the intended default.",
        },
      },
    },
    plan: (a) => ({ method: "DELETE", path: a.force ? "/v1/account?force=true" : "/v1/account" }),
  },
];

const TOOL_BY_NAME = new Map(TOOLS.map((t) => [t.name, t]));

// ---------- API passthrough ----------

/**
 * Call the AgentDomains API on the caller's behalf. The inbound Authorization
 * header goes straight through; CF-Connecting-IP is copied explicitly so the
 * origin's per-IP signup rate limiter sees the real client, not the Worker.
 * User-Agent names this Worker, with the caller's own string kept in
 * X-Forwarded-User-Agent.
 */
async function callApi(env, request, { method, path, body }) {
  const base = (env.API_BASE || DEFAULT_API_BASE).replace(/\/+$/, "");
  const headers = { "Content-Type": "application/json", "User-Agent": HOSTED_USER_AGENT };

  const auth = request.headers.get("Authorization");
  if (auth) headers["Authorization"] = auth;

  // The origin's audit log keeps one User-Agent per row, and the useful answer
  // to "what called this?" is "the hosted MCP server", not whichever client is
  // on the far side of it. So we name ourselves in User-Agent and preserve the
  // caller's own string beside it rather than dropping it.
  const clientUA = request.headers.get("User-Agent");
  if (clientUA) headers["X-Forwarded-User-Agent"] = clientUA;

  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) {
    headers["CF-Connecting-IP"] = ip;
    const xff = request.headers.get("X-Forwarded-For");
    headers["X-Forwarded-For"] = xff ? `${xff}, ${ip}` : ip;
  }

  let res;
  try {
    res = await fetch(base + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: "manual",
    });
  } catch (err) {
    throw new Error(`cannot reach the AgentDomains API: ${err.message}`);
  }

  const raw = await res.text();
  if (res.status >= 300) {
    let msg = "";
    try {
      msg = JSON.parse(raw).error || "";
    } catch {
      // Non-JSON error body — fall through to the status-code message.
    }
    if (!msg && res.status === 401) {
      msg = "unauthorized — send your key as `Authorization: Bearer adom_…`, or call the signup tool to get one";
    }
    throw new Error(msg || `request failed (${res.status})`);
  }
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}

// ---------- JSON-RPC ----------

const rpcResult = (id, result) => ({ jsonrpc: "2.0", id, result });
const rpcError = (id, code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });

async function handleRpc(msg, env, request) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return rpcError(msg?.id ?? null, -32600, "invalid JSON-RPC request");
  }
  const { id, method, params } = msg;

  switch (method) {
    case "initialize":
      return rpcResult(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });

    case "ping":
      return rpcResult(id, {});

    case "tools/list":
      return rpcResult(id, {
        tools: TOOLS.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        })),
      });

    case "tools/call": {
      const name = params?.name;
      const tool = TOOL_BY_NAME.get(name);
      if (!tool) return rpcError(id, -32602, `unknown tool: ${name}`);
      try {
        const out = await callApi(env, request, tool.plan(params?.arguments ?? {}));
        return rpcResult(id, { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] });
      } catch (err) {
        // Tool failures are results, not protocol errors — the model should see
        // the message and be able to correct itself.
        return rpcResult(id, { isError: true, content: [{ type: "text", text: err.message }] });
      }
    }

    // resources/* and prompts/* are not advertised in capabilities; answer
    // politely for clients that probe anyway.
    case "resources/list":
      return rpcResult(id, { resources: [] });
    case "prompts/list":
      return rpcResult(id, { prompts: [] });

    default:
      return rpcError(id, -32601, `method not found: ${method}`);
  }
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    // No server-initiated stream in this stateless implementation. The spec
    // wants 405 so clients fall back to POST-only rather than hanging on SSE.
    if (request.method === "GET" || request.method === "HEAD") {
      const url = new URL(request.url);
      if (url.pathname === "/health") return json({ ok: true, server: SERVER_INFO });
      return new Response(
        "AgentDomains MCP server (Streamable HTTP). POST JSON-RPC here; " +
          "authenticate with `Authorization: Bearer adom_…`. Docs: https://docs.agentdomains.co/#mcp\n",
        { status: 405, headers: { "Content-Type": "text/plain", Allow: "POST, OPTIONS", ...CORS } },
      );
    }

    if (request.method !== "POST") {
      return json(rpcError(null, -32600, "method not allowed"), 405);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json(rpcError(null, -32700, "parse error: body is not valid JSON"), 400);
    }

    // Batch.
    if (Array.isArray(payload)) {
      const out = [];
      for (const m of payload) {
        if (m?.id === undefined) continue; // notification: no response
        out.push(await handleRpc(m, env, request));
      }
      return out.length === 0 ? new Response(null, { status: 202, headers: CORS }) : json(out);
    }

    // Notification (no id): acknowledge with 202 and no body.
    if (payload?.id === undefined) {
      return new Response(null, { status: 202, headers: CORS });
    }

    return json(await handleRpc(payload, env, request));
  },
};
