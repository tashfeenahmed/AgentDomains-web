// Cluster 5: 40 Developer DNS, SSL & Edge Proxy Reference Topics
export const DNS_TOPICS = [
  {
    slug: 'acme-dns-01-challenge',
    name: 'ACME DNS-01 Challenge',
    term: 'ACME DNS-01 Challenge',
    category: 'SSL / ACME',
    defaultType: 'TXT',
    defaultHost: '_acme-challenge',
    defaultValue: 'gfj9Xq...example_token_9zK2',
    summary: 'Prove domain control to Let’s Encrypt with a TXT record at `_acme-challenge.<hostname>`. Works behind NAT and for wildcards.',
    explanation: 'Your certificate authority sends a signed token to Certbot, Caddy, or acme.sh. Publish that token as a TXT record at `_acme-challenge.myapp.makes.fyi`. The CA checks DNS over port 53 without reaching your web server.',
    cli: 'agentdomains txt myapp "gfj9Xq...example_token_9zK2"',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"TXT","host":"_acme-challenge","content":"gfj9Xq...example_token_9zK2"}'`,
    mcpTool: 'add_acme_challenge',
    mcpArgs: { label: 'myapp', value: 'gfj9Xq...example_token_9zK2' },
    pitfalls: [
      'Always delete spent `_acme-challenge` TXT records afterward (`agentdomains unrecord`) to keep responses small.',
      'Wait 5–10 seconds and verify with `dig TXT _acme-challenge.myapp.makes.fyi` or our `/tools/dns-ssl-checker` before telling Certbot to proceed.',
    ],
  },
  {
    slug: 'http-01-vs-dns-01-ssl',
    name: 'HTTP-01 vs DNS-01 SSL Validation',
    term: 'HTTP-01 vs DNS-01',
    category: 'SSL / ACME',
    defaultType: 'TXT',
    defaultHost: '_acme-challenge',
    defaultValue: 'acme-dns01-token-example',
    summary: 'Compare HTTP-01 (port 80) and DNS-01 (`_acme-challenge` TXT) for Let’s Encrypt TLS. Or skip both with edge proxy.',
    explanation: 'HTTP-01 serves a file on TCP port 80. It works well on public VPS servers running Caddy or Nginx. DNS-01 checks a TXT record instead. Use DNS-01 for wildcards, private servers, or blocked port 80. For PaaS origins like `app.fly.dev`, `agentdomains proxy` handles edge TLS automatically.',
    cli: 'agentdomains txt myapp "acme-dns01-token-example"',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"TXT","host":"_acme-challenge","content":"acme-dns01-token-example"}'`,
    mcpTool: 'add_acme_challenge',
    mcpArgs: { label: 'myapp', value: 'acme-dns01-token-example' },
    pitfalls: [
      'HTTP-01 cannot issue wildcard certificates (`*.example`) — Let’s Encrypt enforces DNS-01 for all wildcards.',
      'Cloud firewalls often block port 80 while port 443 is open. That breaks HTTP-01.',
    ],
  },
  {
    slug: 'cname-vs-a-record',
    name: 'CNAME vs A Record',
    term: 'CNAME vs A Record',
    category: 'DNS Fundamentals',
    defaultType: 'CNAME',
    defaultHost: '@',
    defaultValue: 'myapp.fly.dev',
    summary: 'Use an A record for static IPv4 servers. Use a CNAME or edge proxy for rotating PaaS hostnames.',
    explanation: 'An A record maps a hostname to an IPv4 address like `203.0.113.10`. A CNAME points one hostname to another hostname like `myapp.fly.dev`. Both A and CNAME records work cleanly on subdomains like `myapp.makes.fyi`.',
    cli: 'agentdomains record myapp --type CNAME --content myapp.fly.dev',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"CNAME","content":"myapp.fly.dev"}'`,
    mcpTool: 'add_dns_record',
    mcpArgs: { label: 'myapp', type: 'CNAME', content: 'myapp.fly.dev' },
    pitfalls: [
      'DNS rules forbid a CNAME and TXT record on the same label. Put TXT on a sub-label or use `set_proxy`.',
      'Never include `https://` or a trailing path in a CNAME target — DNS only resolves hostnames.',
    ],
  },
  {
    slug: 'txt-record-domain-verification',
    name: 'TXT Record Domain Verification',
    term: 'TXT Record Verification',
    category: 'DNS Fundamentals',
    defaultType: 'TXT',
    defaultHost: '@',
    defaultValue: 'google-site-verification=abc123xyz',
    summary: 'Publish TXT records on your subdomain to verify ownership with Google, Bluesky, GitHub, and SaaS tools.',
    explanation: 'TXT records store text strings inside DNS. Services ask you to add a token at `@` or a sub-label like `_atproto.myapp.makes.fyi`. That proves you control the name.',
    cli: 'agentdomains record myapp --type TXT --content "google-site-verification=abc123xyz"',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"TXT","content":"google-site-verification=abc123xyz"}'`,
    mcpTool: 'add_dns_record',
    mcpArgs: { label: 'myapp', type: 'TXT', content: 'google-site-verification=abc123xyz' },
    pitfalls: [
      'TXT records on a subdomain survive `set_proxy` and `set_forward` calls untouched on AgentDomains.',
      'Single DNS TXT character strings max out at 255 bytes.',
    ],
  },
  {
    slug: 'ns-subdomain-delegation',
    name: 'NS Subdomain Delegation',
    term: 'NS Subdomain Delegation',
    category: 'Advanced DNS',
    defaultType: 'NS',
    defaultHost: '@',
    defaultValue: 'ns1.desec.io',
    summary: 'Delegate your subdomain tree (`*.myapp.makes.fyi`) to your own nameservers. Run custom MX, SRV, and DNSSEC records.',
    explanation: 'NS delegation tells recursive resolvers to ask your chosen authoritative nameservers for `myapp.makes.fyi` and every label beneath it. Once delegated, you manage MX, SRV, CAA, and arbitrary deep subtrees directly on your own DNS provider.',
    cli: 'agentdomains ns myapp ns1.desec.io ns2.desec.org',
    curl: `curl -X PUT https://api.agentdomains.co/v1/subdomains/myapp/ns \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"nameservers":["ns1.desec.io","ns2.desec.org"]}'`,
    mcpTool: 'delegate_nameservers',
    mcpArgs: { label: 'myapp', nameservers: ['ns1.desec.io', 'ns2.desec.org'] },
    pitfalls: [
      'Supply at least two valid authoritative nameservers that already have a configured zone for `myapp.makes.fyi`.',
      'Delegating NS removes AgentDomains edge forwards/proxies on that label because your nameservers become authoritative.',
    ],
  },
  {
    slug: 'reverse-proxy-vs-url-forwarding',
    name: 'Reverse Proxy vs URL Forwarding',
    term: 'Reverse Proxy vs URL Forwarding',
    category: 'Edge Routing',
    defaultType: 'CNAME',
    defaultHost: '@',
    defaultValue: 'myapp.up.railway.app',
    summary: 'Reverse proxy (`set_proxy`) serves your origin under your domain with HTTPS. URL forwarding (`set_forward`) sends a 301 or 302 redirect.',
    explanation: 'With a reverse proxy, clients hit `https://myapp.makes.fyi`. Our edge fetches your upstream host and keeps your domain in the browser bar. URL forwarding returns a 301 or 302 redirect instead. Use forwarding for short links, not POST webhooks.',
    cli: 'agentdomains proxy myapp myapp.up.railway.app',
    curl: `curl -X PUT https://api.agentdomains.co/v1/subdomains/myapp/proxy \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"origin":"myapp.up.railway.app"}'`,
    mcpTool: 'set_proxy',
    mcpArgs: { label: 'myapp', origin: 'myapp.up.railway.app' },
    pitfalls: [
      'Never use URL forwarding for webhooks. Webhook senders do not follow 302 redirects on POST requests.',
      'A label can use a proxy or a forward, not both. Either mode replaces existing A, AAAA, or CNAME records.',
    ],
  },
  {
    slug: '301-vs-302-redirects',
    name: '301 vs 302 HTTP Redirects',
    term: '301 vs 302 Redirect',
    category: 'Edge Routing',
    defaultType: 'CNAME',
    defaultHost: '@',
    defaultValue: 'example.com',
    summary: '302 is temporary and easy to change (our default). 301 is permanent and browsers cache it hard.',
    explanation: 'HTTP 302 Found tells browsers to check your edge again on each visit. Use 302 for active demos. HTTP 301 Moved Permanently caches the target in browsers and moves SEO signals to the new URL.',
    cli: 'agentdomains forward myapp https://example.com --permanent',
    curl: `curl -X PUT https://api.agentdomains.co/v1/subdomains/myapp/forward \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"target":"https://example.com","permanent":true,"preserve_path":true}'`,
    mcpTool: 'set_forward',
    mcpArgs: { label: 'myapp', target: 'https://example.com', permanent: true, preserve_path: true },
    pitfalls: [
      'Do not use `permanent: true` (301) during testing. Browsers keep the old target cached after you change it.',
      'Keep `preserve_path: true` (the default) so `/docs?v=2` cleanly forwards to `https://example.com/docs?v=2`.',
    ],
  },
  {
    slug: 'ttl-and-dns-propagation',
    name: 'TTL and DNS Propagation',
    term: 'DNS TTL (Time To Live)',
    category: 'DNS Fundamentals',
    defaultType: 'A',
    defaultHost: '@',
    defaultValue: '203.0.113.10',
    summary: 'Learn why new DNS records go live in seconds and how resolver TTL caches cause stale answers.',
    explanation: 'TTL (Time To Live) sets how many seconds resolvers like 1.1.1.1 or 8.8.8.8 cache a DNS answer. New records resolve globally in seconds. Updated records take effect once the old TTL expires.',
    cli: 'agentdomains record myapp --type A --content 203.0.113.10',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"A","content":"203.0.113.10"}'`,
    mcpTool: 'add_dns_record',
    mcpArgs: { label: 'myapp', type: 'A', content: '203.0.113.10' },
    pitfalls: [
      'Querying a hostname BEFORE you create its record causes negative NXDOMAIN caching on your local resolver.',
      'Compare `1.1.1.1` vs `8.8.8.8` instantly with our `/tools/dns-ssl-checker` to separate local OS cache from global propagation.',
    ],
  },
  {
    slug: 'wildcard-ssl-subdomains',
    name: 'Wildcard SSL on Subdomains',
    term: 'Wildcard TLS Certificate',
    category: 'SSL / ACME',
    defaultType: 'TXT',
    defaultHost: '_acme-challenge',
    defaultValue: 'wildcard-acme-token-value',
    summary: 'Issue a single `*.myapp.makes.fyi` TLS certificate covering unlimited deeper sub-labels (`a.myapp.makes.fyi`, `b.myapp.makes.fyi`) via ACME DNS-01.',
    explanation: 'A wildcard cert (`*.myapp.makes.fyi`) secures every single-level child label with one key. Let’s Encrypt requires DNS-01 for wildcards. Publish the token with `agentdomains txt` or `add_acme_challenge`.',
    cli: 'agentdomains txt myapp "wildcard-acme-token-value"',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"TXT","host":"_acme-challenge","content":"wildcard-acme-token-value"}'`,
    mcpTool: 'add_acme_challenge',
    mcpArgs: { label: 'myapp', value: 'wildcard-acme-token-value' },
    pitfalls: [
      'A wildcard cert `*.myapp.makes.fyi` does not cover the bare parent. Pass both `-d myapp.makes.fyi` and `-d "*.myapp.makes.fyi"`.',
      'Wildcards match exactly one label level: `a.b.myapp.makes.fyi` is not covered by `*.myapp.makes.fyi`.',
    ],
  },
  {
    slug: 'apex-vs-subdomain-dns',
    name: 'Zone Apex vs Subdomain DNS',
    term: 'Zone Apex vs Subdomain',
    category: 'DNS Fundamentals',
    defaultType: 'CNAME',
    defaultHost: '@',
    defaultValue: 'myapp.fly.dev',
    summary: 'See why `myapp.makes.fyi` accepts standard CNAME records while root domains need CNAME flattening.',
    explanation: 'RFC 1034 forbids CNAME records at a zone apex because the apex owns SOA and NS records. Your `myapp.makes.fyi` host is a subdomain. You can point it straight at Fly.io, Railway, or Render with a standard CNAME.',
    cli: 'agentdomains record myapp --type CNAME --content myapp.fly.dev',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"CNAME","content":"myapp.fly.dev"}'`,
    mcpTool: 'add_dns_record',
    mcpArgs: { label: 'myapp', type: 'CNAME', content: 'myapp.fly.dev' },
    pitfalls: [
      'Remember you can also add deeper sub-labels (`--host www` or `--host api`) under your claimed subdomain.',
    ],
  },
  {
    slug: 'aaaa-ipv6-records',
    name: 'AAAA (IPv6) DNS Records',
    term: 'AAAA Record',
    category: 'DNS Fundamentals',
    defaultType: 'AAAA',
    defaultHost: '@',
    defaultValue: '2001:db8:85a3::8a2e:370:7334',
    summary: 'Point your subdomain at IPv6-only VPS servers or run dual-stack routing next to an A record.',
    explanation: 'An AAAA record maps a hostname to a 128-bit IPv6 address. Modern browsers race IPv6 and IPv4 cleanly when both A and AAAA records exist.',
    cli: 'agentdomains record myapp --type AAAA --content 2001:db8:85a3::8a2e:370:7334',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"AAAA","content":"2001:db8:85a3::8a2e:370:7334"}'`,
    mcpTool: 'add_dns_record',
    mcpArgs: { label: 'myapp', type: 'AAAA', content: '2001:db8:85a3::8a2e:370:7334' },
    pitfalls: [
      'Bind your server to `[::]:443` before you add an AAAA record. Otherwise IPv6 clients fail to connect.',
    ],
  },
  {
    slug: 'dns-over-https',
    name: 'DNS over HTTPS (DoH)',
    term: 'DNS over HTTPS (DoH)',
    category: 'Protocols & Tooling',
    defaultType: 'A',
    defaultHost: '@',
    defaultValue: '203.0.113.10',
    summary: 'Query live DNS records from browsers, CI jobs, or sandboxes using Cloudflare and Google JSON DoH APIs.',
    explanation: 'DNS over HTTPS (RFC 8484) sends DNS queries inside standard port 443 HTTPS requests. It bypasses ISP DNS blocks and lets browser tools like `/tools/dns-ssl-checker` inspect live records directly.',
    cli: 'curl -H "accept: application/dns-json" "https://cloudflare-dns.com/dns-query?name=myapp.makes.fyi&type=A"',
    curl: `curl -s "https://dns.google/resolve?name=myapp.makes.fyi&type=TXT"`,
    mcpTool: 'get_domain',
    mcpArgs: { label: 'myapp' },
    pitfalls: [
      'Always set `Accept: application/dns-json` when calling Cloudflare’s `/dns-query` endpoint, otherwise it expects binary wire-format DNS.',
    ],
  },
  {
    slug: 'cloudflare-edge-tls',
    name: 'Cloudflare Edge TLS & HTTPS',
    term: 'Edge TLS & HTTPS',
    category: 'Edge Routing',
    defaultType: 'CNAME',
    defaultHost: '@',
    defaultValue: 'myapp.fly.dev',
    summary: 'See how `set_proxy` handles TLS 1.3 at the edge and forwards traffic to your origin hostname.',
    explanation: 'When you run `agentdomains proxy`, Cloudflare handles HTTPS at the edge with a managed cert. Visitors get fast TLS 1.3 handshakes worldwide. You never touch Certbot or manual renewals.',
    cli: 'agentdomains proxy myapp myapp.fly.dev',
    curl: `curl -X PUT https://api.agentdomains.co/v1/subdomains/myapp/proxy \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"origin":"myapp.fly.dev"}'`,
    mcpTool: 'set_proxy',
    mcpArgs: { label: 'myapp', origin: 'myapp.fly.dev' },
    pitfalls: [
      'Edge proxy requires an upstream hostname (like `myapp.fly.dev`), not a bare IP address.',
    ],
  },
  {
    slug: 'lets-encrypt-rate-limits',
    name: 'Let’s Encrypt Rate Limits on Subdomains',
    term: 'Let’s Encrypt Rate Limits',
    category: 'SSL / ACME',
    defaultType: 'TXT',
    defaultHost: '_acme-challenge',
    defaultValue: 'staging-acme-test-token',
    summary: 'Avoid Let’s Encrypt weekly rate limits. Test with staging ACME first, or use AgentDomains edge proxy.',
    explanation: 'Let’s Encrypt caps cert issuance per registered domain and allows 5 duplicate certs per week. `agentdomains proxy` uses our wildcard edge cert with zero ACME calls on your server. On an A record, test with Let’s Encrypt Staging first and persist your cert volume.',
    cli: 'agentdomains proxy myapp myapp.fly.dev',
    curl: `curl -X PUT https://api.agentdomains.co/v1/subdomains/myapp/proxy \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"origin":"myapp.fly.dev"}'`,
    mcpTool: 'set_proxy',
    mcpArgs: { label: 'myapp', origin: 'myapp.fly.dev' },
    pitfalls: [
      'Destroying Docker volumes containing `/data/caddy` or `/etc/letsencrypt` on every deploy rapidly exhausts duplicate-certificate quotas.',
    ],
  },
  {
    slug: 'caddy-dns-01',
    name: 'Caddy Server with DNS-01 & Subdomains',
    term: 'Caddy Automatic HTTPS',
    category: 'SSL / ACME',
    defaultType: 'A',
    defaultHost: '@',
    defaultValue: '203.0.113.10',
    summary: 'Run Caddy automatic HTTPS on an AgentDomains A record with HTTP-01 or DNS-01 via `agentdomains txt`.',
    explanation: 'Caddy issues and renews TLS certs as soon as your A record resolves to your server. If port 80 is blocked, delegate NS or call the AgentDomains DNS-01 API from a pre-hook.',
    cli: 'agentdomains record caddyapp --type A --content 203.0.113.10',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/caddyapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"A","content":"203.0.113.10"}'`,
    mcpTool: 'add_dns_record',
    mcpArgs: { label: 'caddyapp', type: 'A', content: '203.0.113.10' },
    pitfalls: [
      'Always verify your A record resolves before reloading Caddy so initial ACME issuance succeeds on attempt #1.',
    ],
  },
  {
    slug: 'certbot-dns-01',
    name: 'Certbot Manual & Hooked DNS-01',
    term: 'Certbot DNS-01 Hook',
    category: 'SSL / ACME',
    defaultType: 'TXT',
    defaultHost: '_acme-challenge',
    defaultValue: 'certbot-validation-token',
    summary: 'Automate Certbot `--manual-auth-hook` and `--manual-cleanup-hook` with `agentdomains txt` and `agentdomains unrecord` for unattended renewals.',
    explanation: 'Certbot passes `$CERTBOT_VALIDATION` to your `--manual-auth-hook` script. Call `agentdomains txt myapp "$CERTBOT_VALIDATION"` and wait 10 seconds. Certbot renews your cert even with port 80 closed.',
    cli: 'agentdomains txt myapp "$CERTBOT_VALIDATION"',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"TXT","host":"_acme-challenge","content":"certbot-validation-token"}'`,
    mcpTool: 'add_acme_challenge',
    mcpArgs: { label: 'myapp', value: 'certbot-validation-token' },
    pitfalls: [
      'Save the returned `id` from `add_acme_challenge` so your `--manual-cleanup-hook` can call `agentdomains unrecord myapp <id>`.',
    ],
  },
  {
    slug: 'webhook-https-requirements',
    name: 'Webhook HTTPS & TLS Requirements',
    term: 'Webhook TLS Validation',
    category: 'Webhooks & APIs',
    defaultType: 'CNAME',
    defaultHost: '@',
    defaultValue: 'hooks-worker.fly.dev',
    summary: 'See why Stripe, GitHub, and Slack reject raw IPs and 302 redirects, and how edge proxy fixes it.',
    explanation: 'Webhook senders check three rules: a valid CA cert matching SNI, port 443 HTTPS, and a direct 2xx response. They do not follow POST redirects. `agentdomains proxy` meets all three rules at once.',
    cli: 'agentdomains proxy webhooks hooks-worker.fly.dev',
    curl: `curl -X PUT https://api.agentdomains.co/v1/subdomains/webhooks/proxy \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"origin":"hooks-worker.fly.dev"}'`,
    mcpTool: 'set_proxy',
    mcpArgs: { label: 'webhooks', origin: 'hooks-worker.fly.dev' },
    pitfalls: [
      'Always verify HMAC signatures (`Stripe-Signature`, `X-Hub-Signature-256`) using the raw unparsed request body.',
    ],
  },
  {
    slug: 'cors-reverse-proxy',
    name: 'CORS Behind a Reverse Proxy',
    term: 'CORS & Reverse Proxies',
    category: 'Edge Routing',
    defaultType: 'CNAME',
    defaultHost: '@',
    defaultValue: 'api-origin.up.railway.app',
    summary: 'Configure `Access-Control-Allow-Origin` and `OPTIONS` preflight handling cleanly when your API sits behind an edge reverse proxy.',
    explanation: 'Browsers check CORS against the public address bar URL (`https://myapp.makes.fyi`), not your origin host. Return HTTP 204 on `OPTIONS` requests and echo your allowed frontend origin.',
    cli: 'agentdomains proxy api-demo api-origin.up.railway.app',
    curl: `curl -i -X OPTIONS https://api-demo.makes.fyi/v1/items -H "Origin: https://app.example.com" -H "Access-Control-Request-Method: POST"`,
    mcpTool: 'set_proxy',
    mcpArgs: { label: 'api-demo', origin: 'api-origin.up.railway.app' },
    pitfalls: [
      'When sending cookies (`credentials: "include"`), you cannot use `Access-Control-Allow-Origin: *` — return the explicit frontend origin.',
    ],
  },
  {
    slug: 'websockets-reverse-proxy',
    name: 'WebSockets & SSE Through Reverse Proxies',
    term: 'WebSockets & SSE Proxying',
    category: 'Edge Routing',
    defaultType: 'A',
    defaultHost: '@',
    defaultValue: '203.0.113.10',
    summary: 'Keep long-lived `wss://` WebSocket connections and AI token Server-Sent Events (SSE) streaming cleanly over HTTPS.',
    explanation: 'WebSockets start with an HTTP/1.1 `Upgrade` handshake over `wss://`. LLM streams usually use SSE over HTTP/2. In Nginx, enable HTTP 1.1, pass `Upgrade` headers, and set `proxy_buffering off`.',
    cli: 'agentdomains record ws-app --type A --content 203.0.113.10',
    curl: `curl -N https://ws-app.makes.fyi/events`,
    mcpTool: 'add_dns_record',
    mcpArgs: { label: 'ws-app', type: 'A', content: '203.0.113.10' },
    pitfalls: [
      'Default Nginx `proxy_read_timeout` is 60s — send periodic WebSocket ping frames or SSE comment heartbeats (`: ping\\n\\n`).',
    ],
  },
  {
    slug: 'hsts-subdomains',
    name: 'HSTS and Subdomain Security',
    term: 'HTTP Strict Transport Security (HSTS)',
    category: 'SSL / ACME',
    defaultType: 'A',
    defaultHost: '@',
    defaultValue: '203.0.113.10',
    summary: 'Learn how HSTS enforces HTTPS and why you should skip `includeSubDomains` until every sub-label has TLS.',
    explanation: 'HSTS tells browsers to automatically upgrade all `http://` requests to `https://` for `max-age` seconds, preventing SSL-stripping attacks. Start with a short `max-age=300` while testing your Caddy/Nginx TLS config before extending to `31536000`.',
    cli: 'curl -sI https://myapp.makes.fyi | grep -i strict-transport-security',
    curl: `curl -sI https://myapp.makes.fyi`,
    mcpTool: 'get_domain',
    mcpArgs: { label: 'myapp' },
    pitfalls: [
      'Do not turn on HSTS if you plan to test plain HTTP later. Browsers block HTTP until `max-age` ends.',
    ],
  },
  {
    slug: 'dns-caching-explained',
    name: 'How DNS Caching Works Across Resolvers',
    term: 'Recursive DNS Caching',
    category: 'DNS Fundamentals',
    defaultType: 'A',
    defaultHost: '@',
    defaultValue: '203.0.113.10',
    summary: 'Trace the 4 DNS cache layers to see why `dig` and Chrome sometimes show different answers.',
    explanation: 'Authoritative DNS updates right away. Your OS, browser cache, and ISP resolver still hold old answers until the record TTL reaches zero.',
    cli: 'dig @1.1.1.1 myapp.makes.fyi A +noall +answer',
    curl: `curl -s "https://dns.google/resolve?name=myapp.makes.fyi&type=A"`,
    mcpTool: 'get_domain',
    mcpArgs: { label: 'myapp' },
    pitfalls: [
      'Flush the macOS DNS cache if your laptop shows an old IP while `dig @1.1.1.1` is fresh.',
    ],
  },
  {
    slug: 'negative-dns-caching',
    name: 'Negative DNS Caching (NXDOMAIN)',
    term: 'Negative DNS Caching (RFC 2308)',
    category: 'DNS Fundamentals',
    defaultType: 'A',
    defaultHost: '@',
    defaultValue: '203.0.113.10',
    summary: 'Opening a hostname before claiming it caches NXDOMAIN. That can hide your new record for minutes.',
    explanation: 'RFC 2308 lets resolvers cache NXDOMAIN ("not found") replies using the zone SOA timer. Claim your name and add records before opening the URL in a browser.',
    cli: 'agentdomains claim myapp --email you@example.com --type A --content 203.0.113.10',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"label":"myapp","email":"you@example.com","type":"A","content":"203.0.113.10"}'`,
    mcpTool: 'claim_domain',
    mcpArgs: { label: 'myapp', email: 'you@example.com', type: 'A', content: '203.0.113.10' },
    pitfalls: [
      'Pass `--type` and `--content` in `claim_domain`. That publishes your label and first record in one atomic step.',
    ],
  },
  {
    slug: 'caa-records',
    name: 'CAA Records and Certificate Issuance',
    term: 'Certification Authority Authorization (CAA)',
    category: 'SSL / ACME',
    defaultType: 'NS',
    defaultHost: '@',
    defaultValue: 'ns1.desec.io',
    summary: 'Learn how CAA records control which CAs can issue TLS certs and how ACME checks parent zones.',
    explanation: 'Before issuing a cert, Let’s Encrypt checks CAA records on `myapp.makes.fyi` and then `makes.fyi`. Delegate NS to publish your own custom CAA rules.',
    cli: 'dig CAA makes.fyi +short',
    curl: `curl -s "https://dns.google/resolve?name=makes.fyi&type=CAA"`,
    mcpTool: 'delegate_nameservers',
    mcpArgs: { label: 'myapp', nameservers: ['ns1.desec.io', 'ns2.desec.org'] },
    pitfalls: [
      'When you add a custom `issue` CAA record, include `letsencrypt.org` if you use Caddy or Certbot.',
    ],
  },
  {
    slug: 'spf-txt-limits',
    name: 'SPF & TXT Record 10-Lookup Limits',
    term: 'SPF TXT Limits (RFC 7208)',
    category: 'DNS Fundamentals',
    defaultType: 'TXT',
    defaultHost: '@',
    defaultValue: 'v=spf1 -all',
    summary: 'Add `v=spf1 -all` to block spoofing on non-mail subdomains, and stay under the 10-lookup SPF cap.',
    explanation: 'Add a `v=spf1 -all` TXT record to show that a demo subdomain sends no email. For real email with MX and DKIM, delegate NS or buy a root domain.',
    cli: 'agentdomains record myapp --type TXT --content "v=spf1 -all"',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"TXT","content":"v=spf1 -all"}'`,
    mcpTool: 'add_dns_record',
    mcpArgs: { label: 'myapp', type: 'TXT', content: 'v=spf1 -all' },
    pitfalls: [
      'Never add two `v=spf1` TXT records on one hostname. Mail servers reject duplicate SPF records.',
    ],
  },
  {
    slug: 'dynamic-dns-vs-api-dns',
    name: 'Dynamic DNS (DDNS) vs Programmatic API DNS',
    term: 'Dynamic DNS vs API DNS',
    category: 'Automation',
    defaultType: 'A',
    defaultHost: '@',
    defaultValue: '203.0.113.10',
    summary: 'Legacy DDNS only updates one IP. API and MCP DNS creates hostnames, records, ACME tokens, and proxies.',
    explanation: 'Legacy DDNS assumes you already created one hostname and only need IP updates. API and MCP DNS lets agents check names, claim labels, write records, and clean up automatically.',
    cli: 'agentdomains record homebox --type A --content "$(curl -s https://api.ipify.org)"',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/homebox/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"A","content":"203.0.113.10"}'`,
    mcpTool: 'add_dns_record',
    mcpArgs: { label: 'homebox', type: 'A', content: '203.0.113.10' },
    pitfalls: [
      'Delete the old A record ID with `delete_record` when changing IPs. That avoids round-robin routing to the stale IP.',
    ],
  },
  {
    slug: 'programmatic-dns-api',
    name: 'Programmatic REST DNS APIs for Agents',
    term: 'Programmatic DNS API',
    category: 'Automation',
    defaultType: 'A',
    defaultHost: '@',
    defaultValue: '203.0.113.10',
    summary: 'Design patterns for idempotent agent DNS automation: atomic claim+record, 409 `owned:true` handling, and clean teardown.',
    explanation: 'Good DNS APIs avoid half-broken state. `POST /v1/subdomains` is atomic: bad DNS input never claims the label. Re-claiming your own label returns `409 {"owned":true}` so retries stay safe.',
    cli: 'agentdomains claim api-bot --email you@example.com --type A --content 203.0.113.10 --json',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"label":"api-bot","email":"you@example.com","type":"A","content":"203.0.113.10"}'`,
    mcpTool: 'claim_domain',
    mcpArgs: { label: 'api-bot', email: 'you@example.com', type: 'A', content: '203.0.113.10' },
    pitfalls: [
      'Always handle HTTP 409 `{"owned":true}` as a success/continue signal in idempotent deployment scripts.',
    ],
  },
  {
    slug: 'cname-flattening',
    name: 'CNAME Flattening Explained',
    term: 'CNAME Flattening',
    category: 'Advanced DNS',
    defaultType: 'CNAME',
    defaultHost: '@',
    defaultValue: 'myapp.fly.dev',
    summary: 'See how edge resolvers flatten CNAME chains into A/AAAA answers and when plain CNAMEs work fine.',
    explanation: 'CNAME flattening resolves the target at the authoritative server and returns the final IP. That enables apex aliasing and saves lookup hops. Subdomains like `myapp.makes.fyi` already support standard CNAMEs everywhere.',
    cli: 'agentdomains record myapp --type CNAME --content myapp.fly.dev',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"CNAME","content":"myapp.fly.dev"}'`,
    mcpTool: 'add_dns_record',
    mcpArgs: { label: 'myapp', type: 'CNAME', content: 'myapp.fly.dev' },
    pitfalls: [
      'When you run `dig` on a flattened CNAME, you may see A records instead of a CNAME hop.',
    ],
  },
  {
    slug: 'subdomain-takeover-prevention',
    name: 'Preventing Dangling Subdomain Takeovers',
    term: 'Subdomain Takeover',
    category: 'Security',
    defaultType: 'CNAME',
    defaultHost: '@',
    defaultValue: 'myapp.fly.dev',
    summary: 'Delete your DNS records or proxy before you destroy your Fly.io, Railway, Heroku, or S3 origin.',
    explanation: 'A dangling takeover happens when DNS still points to a deleted cloud app. Someone else can claim that origin name and serve content on your subdomain. Always delete DNS first, then destroy compute.',
    cli: 'agentdomains delete myapp',
    curl: `curl -X DELETE https://api.agentdomains.co/v1/subdomains/myapp \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY"`,
    mcpTool: 'delete_domain',
    mcpArgs: { label: 'myapp' },
    pitfalls: [
      'In CI PR teardown jobs, put `agentdomains delete` BEFORE `fly apps destroy` so no dangling window ever exists.',
    ],
  },
  {
    slug: 'tls-sni-explained',
    name: 'TLS SNI (Server Name Indication)',
    term: 'Server Name Indication (SNI)',
    category: 'SSL / ACME',
    defaultType: 'A',
    defaultHost: '@',
    defaultValue: '203.0.113.10',
    summary: 'Learn how TLS SNI lets one IPv4 server or edge node serve hundreds of HTTPS domains.',
    explanation: 'In the TLS ClientHello step, the client sends the requested hostname inside SNI. Your reverse proxy reads SNI, picks the right cert, and routes traffic to the matching backend.',
    cli: 'openssl s_client -servername myapp.makes.fyi -connect myapp.makes.fyi:443 </dev/null 2>/dev/null | openssl x509 -noout -subject -dates',
    curl: `curl -vI https://myapp.makes.fyi 2>&1 | grep -E "subject:|expire date:|issuer:"`,
    mcpTool: 'get_domain',
    mcpArgs: { label: 'myapp' },
    pitfalls: [
      'If `curl https://203.0.113.10` fails with a cert mismatch while `curl https://myapp.makes.fyi` works, SNI is functioning exactly as intended.',
    ],
  },
  {
    slug: 'x-forwarded-for-headers',
    name: 'X-Forwarded-For & Proxy Headers',
    term: 'X-Forwarded-For / X-Forwarded-Proto',
    category: 'Edge Routing',
    defaultType: 'CNAME',
    defaultHost: '@',
    defaultValue: 'myapp.up.railway.app',
    summary: 'Configure Express, FastAPI, Django, and Rails to trust `X-Forwarded-Proto` and `X-Forwarded-For` behind edge TLS proxies.',
    explanation: 'When the edge proxy handles TLS, your backend sees forwarded traffic. Frameworks read `X-Forwarded-Proto` and `X-Forwarded-Host` to build HTTPS URLs and set secure cookies.',
    cli: 'agentdomains proxy myapp myapp.up.railway.app',
    curl: `curl -X PUT https://api.agentdomains.co/v1/subdomains/myapp/proxy \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"origin":"myapp.up.railway.app"}'`,
    mcpTool: 'set_proxy',
    mcpArgs: { label: 'myapp', origin: 'myapp.up.railway.app' },
    pitfalls: [
      'Never blindly trust client-supplied `X-Forwarded-For` headers for auth; only trust hops added by your known edge proxy.',
    ],
  },
  {
    slug: 'origin-ip-hiding',
    name: 'Hiding Your Origin Behind an Edge Proxy',
    term: 'Origin IP Concealment',
    category: 'Security',
    defaultType: 'CNAME',
    defaultHost: '@',
    defaultValue: 'my-backend.fly.dev',
    summary: 'See how `agentdomains proxy` handles visitor traffic at the edge and keeps your backend address private.',
    explanation: 'An A record publishes your server IP directly in public DNS. `agentdomains proxy` routes requests through our Cloudflare edge instead. It hides your origin from DNS lookups and adds free edge TLS.',
    cli: 'agentdomains proxy myapp my-backend.fly.dev',
    curl: `curl -X PUT https://api.agentdomains.co/v1/subdomains/myapp/proxy \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"origin":"my-backend.fly.dev"}'`,
    mcpTool: 'set_proxy',
    mcpArgs: { label: 'myapp', origin: 'my-backend.fly.dev' },
    pitfalls: [
      'Remember to still enforce application-level auth (Bearer tokens, webhook HMACs) on your origin — obscurity is not authentication.',
    ],
  },
  {
    slug: 'custom-port-reverse-proxy',
    name: 'Mapping Port 443 to Custom App Ports',
    term: 'Port 443 Reverse Proxying',
    category: 'Edge Routing',
    defaultType: 'A',
    defaultHost: '@',
    defaultValue: '203.0.113.10',
    summary: 'Turn `http://203.0.113.10:8080` or `:3000` into a clean `https://myapp.makes.fyi` URL without ugly port numbers in links.',
    explanation: 'DNS records do not store HTTP port numbers. Browsers always hit port 443 for HTTPS. Run Caddy or Nginx on port 443 to forward to local ports, or use `agentdomains proxy`.',
    cli: 'agentdomains record myapp --type A --content 203.0.113.10',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"A","content":"203.0.113.10"}'`,
    mcpTool: 'add_dns_record',
    mcpArgs: { label: 'myapp', type: 'A', content: '203.0.113.10' },
    pitfalls: [
      'Web browsers ignore DNS SRV records for HTTPS. Use a reverse proxy to map port 443 to internal ports.',
    ],
  },
  {
    slug: 'oauth-redirect-uri-https',
    name: 'OAuth 2.0 Redirect URI HTTPS Rules',
    term: 'OAuth Redirect URI',
    category: 'Webhooks & APIs',
    defaultType: 'CNAME',
    defaultHost: '@',
    defaultValue: 'oauth-app.up.railway.app',
    summary: 'See why OAuth providers require exact HTTPS callback URLs and how a fixed `makes.fyi` host prevents errors.',
    explanation: 'OAuth 2.1 requires exact-match HTTPS redirect URIs to stop code theft. Using `https://oauth-app.makes.fyi/callback` gives your team one fixed callback URL across redeploys.',
    cli: 'agentdomains proxy oauth-app oauth-app.up.railway.app',
    curl: `curl -X PUT https://api.agentdomains.co/v1/subdomains/oauth-app/proxy \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"origin":"oauth-app.up.railway.app"}'`,
    mcpTool: 'set_proxy',
    mcpArgs: { label: 'oauth-app', origin: 'oauth-app.up.railway.app' },
    pitfalls: [
      'Ensure your app’s `APP_URL` / `NEXTAUTH_URL` matches `https://oauth-app.makes.fyi` exactly (no stray trailing slash mismatch).',
    ],
  },
  {
    slug: 'mcp-streamable-http-tls',
    name: 'MCP Streamable HTTP & TLS Requirements',
    term: 'MCP Streamable HTTP',
    category: 'Protocols & Tooling',
    defaultType: 'CNAME',
    defaultHost: '@',
    defaultValue: 'my-mcp.fly.dev',
    summary: 'Host your remote MCP server over stateless Streamable HTTP with valid port 443 HTTPS.',
    explanation: 'Remote MCP clients send JSON-RPC POST requests to a public HTTPS endpoint. Put `agentdomains proxy` in front of your MCP server for instant edge TLS and a clean `*.agentdomains.co` URL.',
    cli: 'agentdomains proxy my-mcp my-mcp.fly.dev --domain agentdomains.co',
    curl: `curl -X POST https://mcp.agentdomains.co \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"curl","version":"1.0"}}}'`,
    mcpTool: 'set_proxy',
    mcpArgs: { label: 'my-mcp', origin: 'my-mcp.fly.dev', domain: 'agentdomains.co' },
    pitfalls: [
      'Return `Access-Control-Allow-Origin` and `MCP-Protocol-Version` headers if browser-based MCP clients will connect.',
    ],
  },
  {
    slug: 'dig-command-cheatsheet',
    name: 'dig Command Cheatsheet for Developers',
    term: 'dig (Domain Information Groper)',
    category: 'Protocols & Tooling',
    defaultType: 'A',
    defaultHost: '@',
    defaultValue: '203.0.113.10',
    summary: 'Essential `dig` commands for debugging A, AAAA, CNAME, TXT, `_acme-challenge`, NS delegation, and TTLs in seconds.',
    explanation: 'Run `dig +short A myapp.makes.fyi` in scripts. Use `dig @1.1.1.1 TXT _acme-challenge.myapp.makes.fyi` to check ACME tokens and TTLs. Run `dig +trace` to walk the full delegation chain.',
    cli: 'dig @1.1.1.1 myapp.makes.fyi ANY +noall +answer',
    curl: `curl -s "https://dns.google/resolve?name=myapp.makes.fyi&type=A"`,
    mcpTool: 'get_domain',
    mcpArgs: { label: 'myapp' },
    pitfalls: [
      'Cloudflare returns minimal answers for `ANY` queries. Query exact record types like `A`, `CNAME`, `TXT`, or `NS`.',
    ],
  },
  {
    slug: 'nslookup-vs-dig',
    name: 'nslookup vs dig vs DoH',
    term: 'nslookup vs dig',
    category: 'Protocols & Tooling',
    defaultType: 'TXT',
    defaultHost: '_acme-challenge',
    defaultValue: 'verify-token-123',
    summary: 'Why `dig` gives cleaner TTL/authority output than `nslookup`, and when browser DoH tools beat both.',
    explanation: '`nslookup` comes built into Windows and macOS for quick checks. `dig` gives exact TTLs, DNS flags, and timing. In a browser, use `/tools/dns-ssl-checker` to query `1.1.1.1` and `8.8.8.8` together.',
    cli: 'nslookup -type=TXT _acme-challenge.myapp.makes.fyi 1.1.1.1',
    curl: `curl -s -H "accept: application/dns-json" "https://cloudflare-dns.com/dns-query?name=_acme-challenge.myapp.makes.fyi&type=TXT"`,
    mcpTool: 'get_domain',
    mcpArgs: { label: 'myapp' },
    pitfalls: [
      'Both `nslookup` and `dig` default to your OS resolver unless you explicitly append `@1.1.1.1` or `8.8.8.8`.',
    ],
  },
  {
    slug: 'dns-propagation-delays',
    name: 'Debugging DNS Propagation Delays',
    term: 'DNS Propagation',
    category: 'DNS Fundamentals',
    defaultType: 'A',
    defaultHost: '@',
    defaultValue: '203.0.113.10',
    summary: 'Follow this 4-step checklist when a new subdomain works on mobile but fails on laptop Wi-Fi.',
    explanation: 'DNS does not push changes globally. Resolvers pull records and cache them for TTL seconds. If your phone loads the site but your laptop fails, flush your OS DNS cache.',
    cli: 'agentdomains get myapp --json',
    curl: `curl -s "https://api.agentdomains.co/v1/subdomains/myapp" -H "Authorization: Bearer $AGENTDOMAINS_API_KEY"`,
    mcpTool: 'get_domain',
    mcpArgs: { label: 'myapp' },
    pitfalls: [
      'Run `/tools/dns-ssl-checker` right after updating records to confirm both Cloudflare and Google public resolvers see the new value.',
    ],
  },
  {
    slug: 'acme-txt-cleanup',
    name: 'Cleaning Up Spent ACME TXT Records',
    term: 'ACME TXT Cleanup',
    category: 'SSL / ACME',
    defaultType: 'TXT',
    defaultHost: '_acme-challenge',
    defaultValue: 'old-challenge-token',
    summary: 'Use `agentdomains unrecord <label> <record-id>` or `delete_record` to delete individual spent `_acme-challenge` TXT tokens without touching your subdomain.',
    explanation: 'Each Let’s Encrypt renewal creates a fresh `_acme-challenge` token. Leaving dozens of old TXT records bloats UDP DNS packets and can trigger truncation or validation failures. Inspect your record IDs with `agentdomains get <label>` and delete only the spent TXT record ID.',
    cli: 'agentdomains unrecord myapp rec_123456',
    curl: `curl -X DELETE https://api.agentdomains.co/v1/subdomains/myapp/records/rec_123456 \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY"`,
    mcpTool: 'delete_record',
    mcpArgs: { label: 'myapp', record_id: 'rec_123456' },
    pitfalls: [
      'Pass the record’s `id` (from `get_domain`), NOT the TXT content string, to `delete_record`.',
    ],
  },
  {
    slug: 'edge-301-preservation',
    name: 'Path & Query Preservation on Edge Redirects',
    term: 'Path-Preserving Redirect',
    category: 'Edge Routing',
    defaultType: 'CNAME',
    defaultHost: '@',
    defaultValue: 'docs.example.com',
    summary: 'Control whether `myapp.makes.fyi/pricing?ref=gh` redirects to `https://target.com/pricing?ref=gh` or collapses to the target root.',
    explanation: 'By default, `set_forward` keeps `preserve_path: true` so deep links and query strings stay intact. Set `preserve_path: false` to send every path to one landing page.',
    cli: 'agentdomains forward myapp https://docs.example.com',
    curl: `curl -X PUT https://api.agentdomains.co/v1/subdomains/myapp/forward \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"target":"https://docs.example.com","permanent":false,"preserve_path":true}'`,
    mcpTool: 'set_forward',
    mcpArgs: { label: 'myapp', target: 'https://docs.example.com', preserve_path: true },
    pitfalls: [
      'Skip `cloak: true` for modern apps. Most sites send `X-Frame-Options: DENY` headers that block iframes.',
    ],
  },
  {
    slug: 'managed-subdomains-vs-tld',
    name: 'Managed Subdomains vs Registering a TLD',
    term: 'Managed Subdomain vs Second-Level Domain',
    category: 'Architecture',
    defaultType: 'A',
    defaultHost: '@',
    defaultValue: '203.0.113.10',
    summary: 'Learn when a managed subdomain beats buying a `.com`, and when you should buy a real TLD.',
    explanation: 'A managed subdomain has no ICANN fee, no WHOIS forms, and instant MCP setup for $10/yr (100 names). But you do not own an ICANN transfer code. Use managed subdomains for demos, webhooks, and agent builds. Buy a `.com` at Cloudflare or Porkbun for your main brand.',
    cli: 'agentdomains claim proto-demo --email you@example.com',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"label":"proto-demo","email":"you@example.com"}'`,
    mcpTool: 'claim_domain',
    mcpArgs: { label: 'proto-demo', email: 'you@example.com' },
    pitfalls: [
      'When a prototype graduates to a `.com`, point your old subdomain to it with a 301 forward.',
    ],
  },
];
