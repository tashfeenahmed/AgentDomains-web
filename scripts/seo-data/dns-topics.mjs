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
    summary: 'Prove domain control to Let’s Encrypt by publishing a TXT record at `_acme-challenge.<hostname>` — works behind NAT, firewalled port 80, and for wildcard certificates.',
    explanation: 'During ACME DNS-01 validation, your certificate authority gives your ACME client (Certbot, Caddy, acme.sh) a cryptographically signed token derived from your account key. When you publish that token as a TXT record at `_acme-challenge.myapp.makes.fyi`, the CA queries authoritative DNS directly over port 53 without ever touching your web server.',
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
    summary: 'When to use HTTP-01 (open public port 80) versus DNS-01 (`_acme-challenge` TXT record) for Let’s Encrypt TLS certificates — or skip both with AgentDomains edge proxy.',
    explanation: 'HTTP-01 serves a token file at `http://<host>/.well-known/acme-challenge/<token>` on TCP port 80, which is effortless on public VPS boxes running Caddy or Nginx. DNS-01 validates via a TXT record instead, making it mandatory for wildcard certificates (`*.myapp.makes.fyi`), private intranet servers, and ISPs that block port 80. If your origin already has a hostname (like `app.fly.dev`), `agentdomains proxy` handles edge TLS without you running ACME at all.',
    cli: 'agentdomains txt myapp "acme-dns01-token-example"',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"TXT","host":"_acme-challenge","content":"acme-dns01-token-example"}'`,
    mcpTool: 'add_acme_challenge',
    mcpArgs: { label: 'myapp', value: 'acme-dns01-token-example' },
    pitfalls: [
      'HTTP-01 cannot issue wildcard certificates (`*.example`) — Let’s Encrypt enforces DNS-01 for all wildcards.',
      'Cloud firewalls (OCI iptables, AWS SG, Hetzner Firewall) frequently block port 80 even when 443 is open, breaking HTTP-01.',
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
    summary: 'Choose an A record for static IPv4 servers (VPS/Droplets) and a CNAME record (or edge proxy) for cloud PaaS hostnames whose underlying IPs rotate.',
    explanation: 'An A record maps a hostname directly to a 32-bit IPv4 address (`203.0.113.10`), whereas a CNAME aliases one hostname to another canonical hostname (`myapp.fly.dev`). On managed subdomains like `myapp.makes.fyi`, both A and CNAME records are legal — unlike zone apexes where RFC 1034 forbids CNAMEs alongside SOA/NS records.',
    cli: 'agentdomains record myapp --type CNAME --content myapp.fly.dev',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"CNAME","content":"myapp.fly.dev"}'`,
    mcpTool: 'add_dns_record',
    mcpArgs: { label: 'myapp', type: 'CNAME', content: 'myapp.fly.dev' },
    pitfalls: [
      'Per DNS RFC rules, a CNAME cannot coexist with other records (like TXT) on the exact same node label — put TXT on a sub-label or use `set_proxy`.',
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
    summary: 'Publish arbitrary TXT strings on your subdomain or sub-label to verify ownership with Google Search Console, Bluesky ATProto handles, GitHub, and SaaS APIs.',
    explanation: 'TXT records carry arbitrary human- or machine-readable text strings in DNS. Services ask you to publish a unique token at `@` or a dedicated sub-label (like `_atproto.myapp.makes.fyi` for Bluesky handles) to prove you control the hostname.',
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
    summary: 'Hand authoritative control of your entire subdomain tree (`*.myapp.makes.fyi`) to your own nameservers (Cloudflare, Route 53, deSEC, or BIND) for MX, SRV, and custom DNSSEC.',
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
    summary: 'Reverse proxy (`set_proxy`) serves your origin directly under your domain with edge HTTPS; URL forwarding (`set_forward`) issues an HTTP 301/302 redirect to another URL.',
    explanation: 'When you configure a reverse proxy, the browser or webhook client connects to `https://myapp.makes.fyi`, our edge fetches the response from your upstream hostname (e.g. `myapp.up.railway.app`), and returns it seamlessly while keeping `myapp.makes.fyi` in the address bar. URL forwarding immediately responds with a 301 or 302 `Location:` header sending the client elsewhere — great for short links, terrible for POST webhooks.',
    cli: 'agentdomains proxy myapp myapp.up.railway.app',
    curl: `curl -X PUT https://api.agentdomains.co/v1/subdomains/myapp/proxy \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"origin":"myapp.up.railway.app"}'`,
    mcpTool: 'set_proxy',
    mcpArgs: { label: 'myapp', origin: 'myapp.up.railway.app' },
    pitfalls: [
      'Never use URL forwarding for Stripe, GitHub, or Slack webhooks — webhook senders do not follow 302 redirects on POST requests.',
      'A proxy and a forward are mutually exclusive on the same label, and either replaces existing A/AAAA/CNAME records on that apex label.',
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
    summary: '302 is temporary and safe to change anytime (AgentDomains default); 301 is permanent and aggressively cached by browsers and search engines.',
    explanation: 'HTTP 302 Found tells browsers and crawlers to check your AgentDomains edge again on future visits, making it ideal while iterating on demo destinations. HTTP 301 Moved Permanently instructs browsers to cache the destination indefinitely and signals search engines to transfer ranking signals to the target URL.',
    cli: 'agentdomains forward myapp https://example.com --permanent',
    curl: `curl -X PUT https://api.agentdomains.co/v1/subdomains/myapp/forward \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"target":"https://example.com","permanent":true,"preserve_path":true}'`,
    mcpTool: 'set_forward',
    mcpArgs: { label: 'myapp', target: 'https://example.com', permanent: true, preserve_path: true },
    pitfalls: [
      'Avoid setting `permanent: true` (301) during active testing — browsers will cling to the old target even after you update the forward.',
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
    summary: 'Why DNS changes usually appear within seconds on Cloudflare-backed zones, and how recursive resolver TTL caching causes stale answers.',
    explanation: 'TTL (Time To Live) is the number of seconds a recursive resolver (like 1.1.1.1, 8.8.8.8, or your ISP resolver) is allowed to cache a DNS answer before querying authoritative nameservers again. New records on AgentDomains become resolvable globally within seconds because nothing cached them yet; updating an existing record waits at most for the previous record’s TTL to expire.',
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
    explanation: 'A wildcard certificate (`*.myapp.makes.fyi`) secures every one-level child label under your claimed subdomain with a single keypair. Let’s Encrypt mandates DNS-01 validation for wildcards, which maps directly to `agentdomains txt myapp <token>` or the `add_acme_challenge` MCP tool.',
    cli: 'agentdomains txt myapp "wildcard-acme-token-value"',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"TXT","host":"_acme-challenge","content":"wildcard-acme-token-value"}'`,
    mcpTool: 'add_acme_challenge',
    mcpArgs: { label: 'myapp', value: 'wildcard-acme-token-value' },
    pitfalls: [
      'A wildcard cert `*.myapp.makes.fyi` does NOT cover the bare parent `myapp.makes.fyi` unless you include both SANs in the CSR (`-d myapp.makes.fyi -d "*.myapp.makes.fyi"`).',
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
    summary: 'Why a subdomain like `myapp.makes.fyi` can cleanly hold a standard CNAME record while root apex domains (`example.com`) require CNAME flattening or ALIAS tricks.',
    explanation: 'RFC 1034 prohibits placing a CNAME record at the root of a DNS zone because the apex already owns SOA and NS records. Because `myapp.makes.fyi` is a subdomain inside the `makes.fyi` zone, you can point it straight at Fly.io, Railway, or Render with a standard RFC-compliant CNAME record.',
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
    summary: 'Point your subdomain at IPv6-only VPS instances (like Hetzner’s cheaper IPv6-only servers) or enable dual-stack routing alongside an A record.',
    explanation: 'An AAAA ("quad-A") record maps a hostname to a 128-bit IPv6 address. Modern browsers use Happy Eyeballs (RFC 8305) to race IPv6 and IPv4 seamlessly when both A and AAAA records exist.',
    cli: 'agentdomains record myapp --type AAAA --content 2001:db8:85a3::8a2e:370:7334',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"AAAA","content":"2001:db8:85a3::8a2e:370:7334"}'`,
    mcpTool: 'add_dns_record',
    mcpArgs: { label: 'myapp', type: 'AAAA', content: '2001:db8:85a3::8a2e:370:7334' },
    pitfalls: [
      'Make sure your web server binds `[::]:443` (dual-stack) before publishing an AAAA record, otherwise IPv6 clients will fail to connect.',
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
    summary: 'Query live authoritative DNS records straight from browsers, CI scripts, or locked-down sandboxes using Cloudflare and Google JSON DoH APIs.',
    explanation: 'DNS over HTTPS (RFC 8484) encapsulates DNS queries inside standard HTTPS requests on port 443, bypassing ISP DNS hijacking and allowing browser-based diagnostic tools (like our `/tools/dns-ssl-checker`) to verify live DNS propagation over CORS.',
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
    name: 'Cloudflare Edge TLS Termination',
    term: 'Edge TLS Termination',
    category: 'Edge Routing',
    defaultType: 'CNAME',
    defaultHost: '@',
    defaultValue: 'myapp.fly.dev',
    summary: 'How AgentDomains `set_proxy` terminates TLS 1.3 at the edge globally and forwards requests cleanly to your upstream origin hostname.',
    explanation: 'When you enable `agentdomains proxy myapp myapp.fly.dev`, incoming HTTPS connections terminate at Cloudflare’s edge using a managed trusted certificate, giving visitors sub-50ms TLS handshakes worldwide without you touching Certbot, OpenSSL, or certificate renewals.',
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
    summary: 'Avoid hitting Let’s Encrypt’s 50-certs-per-week registered domain limit by testing against staging ACME first or using AgentDomains edge proxy.',
    explanation: 'Let’s Encrypt enforces per-registered-domain issuance limits across shared zones not on the Public Suffix List, plus duplicate-certificate limits (5 identical certs per week). Using `agentdomains proxy` uses our wildcard edge certificate with zero ACME calls on your server; when running your own Certbot/Caddy on an A record, always test configs against Let’s Encrypt Staging first and persist your cert volume across container restarts.',
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
    summary: 'Configure Caddy’s automatic HTTPS on an AgentDomains A record using HTTP-01 (zero config) or DNS-01 via `agentdomains txt` / delegated NS.',
    explanation: 'Caddy automatically provisions and renews TLS certificates for any hostname in your Caddyfile as soon as the A record resolves to your server. If port 80 is blocked, delegate NS to a provider with a Caddy DNS module or run an ACME DNS-01 pre-hook calling the AgentDomains API.',
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
    explanation: 'Certbot passes `$CERTBOT_VALIDATION` to your `--manual-auth-hook` script. A 3-line shell hook calling `agentdomains txt myapp "$CERTBOT_VALIDATION"` and sleeping 10 seconds lets Certbot renew certificates cleanly even with port 80 completely firewalled.',
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
    summary: 'Why Stripe, GitHub, Slack, Meta, and Twilio reject raw IPs, self-signed certs, and 302 redirects — and how edge proxying satisfies all of them.',
    explanation: 'Production webhook senders validate three things before delivering events: a valid CA-signed certificate matching the URL hostname (SNI), port 443 HTTPS, and a direct 2xx response without following POST redirects. `agentdomains proxy` satisfies all three instantly.',
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
    explanation: 'Browsers evaluate Cross-Origin Resource Sharing (CORS) against the public URL in the address bar (`https://myapp.makes.fyi`), not your upstream origin hostname. Ensure your backend responds to `OPTIONS` preflight requests with 204 and echoes your allowed frontend origin.',
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
    explanation: 'WebSockets begin with an HTTP/1.1 `Upgrade: websocket` handshake over TLS (`wss://`), while LLM streaming commonly uses `text/event-stream` over HTTP/2. When running Nginx on an A record, explicitly enable `proxy_http_version 1.1`, pass `Upgrade`/`Connection`, and set `proxy_buffering off` for instant token streaming.',
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
    summary: 'Understand how `Strict-Transport-Security` enforces HTTPS on your subdomain and why you should avoid `includeSubDomains` until every sub-label has valid TLS.',
    explanation: 'HSTS tells browsers to automatically upgrade all `http://` requests to `https://` for `max-age` seconds, preventing SSL-stripping attacks. Start with a short `max-age=300` while testing your Caddy/Nginx TLS config before extending to `31536000`.',
    cli: 'curl -sI https://myapp.makes.fyi | grep -i strict-transport-security',
    curl: `curl -sI https://myapp.makes.fyi`,
    mcpTool: 'get_domain',
    mcpArgs: { label: 'myapp' },
    pitfalls: [
      'Never enable HSTS if you intend to test plain HTTP on a sub-label later — browsers refuse to downgrade until `max-age` expires.',
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
    summary: 'Trace the 4 caching layers (Browser → OS stub → Router/ISP → Public Recursive Resolver) that explain why `dig` and Chrome sometimes disagree.',
    explanation: 'Even after authoritative DNS updates instantaneously, your OS (`mDNSResponder` on macOS, `systemd-resolved` on Linux), Chrome’s internal DNS cache (`chrome://net-internals/#dns`), and your ISP’s resolver each keep independent copies until the record’s TTL counts down to zero.',
    cli: 'dig @1.1.1.1 myapp.makes.fyi A +noall +answer',
    curl: `curl -s "https://dns.google/resolve?name=myapp.makes.fyi&type=A"`,
    mcpTool: 'get_domain',
    mcpArgs: { label: 'myapp' },
    pitfalls: [
      'Flush macOS DNS cache with `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder` if your laptop shows an older IP than `dig @1.1.1.1`.',
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
    summary: 'Why visiting a hostname BEFORE claiming it can make it look broken for a few minutes even after your record goes live.',
    explanation: 'RFC 2308 allows recursive resolvers to cache NXDOMAIN ("domain does not exist") and NODATA answers for the minimum of the zone SOA TTL and SOA MINIMUM field. Claim and add your DNS record *before* opening the URL in your browser to avoid negative cache delays.',
    cli: 'agentdomains claim myapp --email you@example.com --type A --content 203.0.113.10',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"label":"myapp","email":"you@example.com","type":"A","content":"203.0.113.10"}'`,
    mcpTool: 'claim_domain',
    mcpArgs: { label: 'myapp', email: 'you@example.com', type: 'A', content: '203.0.113.10' },
    pitfalls: [
      'Pass `--type` and `--content` right in `claim_domain` so the label and its first record publish atomically in a single call.',
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
    summary: 'How CAA records restrict which Certificate Authorities may issue TLS certs for a domain — and how ACME walks up parent zones.',
    explanation: 'When Let’s Encrypt or Google Trust Services validates a certificate request for `myapp.makes.fyi`, it checks CAA records on `myapp.makes.fyi` and walks upward to `makes.fyi`. To publish custom CAA policies on your own subtree, delegate NS to your authoritative DNS provider.',
    cli: 'dig CAA makes.fyi +short',
    curl: `curl -s "https://dns.google/resolve?name=makes.fyi&type=CAA"`,
    mcpTool: 'delegate_nameservers',
    mcpArgs: { label: 'myapp', nameservers: ['ns1.desec.io', 'ns2.desec.org'] },
    pitfalls: [
      'If you delegate NS and add a restrictive `issue` CAA record, remember to allow `letsencrypt.org` if you use Caddy or Certbot.',
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
    summary: 'Why non-email subdomains benefit from `v=spf1 -all` and how SPF’s 10-DNS-lookup cap works if you send mail via delegated NS.',
    explanation: 'Publishing `v=spf1 -all` as a TXT record signals receiving mail servers that a demo subdomain sends zero email, reducing spoofing risk. If you need full transactional email with MX, DKIM, and DMARC, delegate NS to your own DNS provider or buy a dedicated second-level domain.',
    cli: 'agentdomains record myapp --type TXT --content "v=spf1 -all"',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"TXT","content":"v=spf1 -all"}'`,
    mcpTool: 'add_dns_record',
    mcpArgs: { label: 'myapp', type: 'TXT', content: 'v=spf1 -all' },
    pitfalls: [
      'Never publish two separate `v=spf1` TXT records on the same hostname — RFC 7208 treats duplicate SPF records as a PermError.',
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
    summary: 'Legacy DDNS only updates a single home IP; modern API/MCP DNS provisions new hostnames, records, ACME challenges, and edge proxies programmatically.',
    explanation: 'Traditional DDNS protocols (DynDNS2, DuckDNS update URLs) assume a human pre-created a static hostname and a router simply pings its current IPv4. Programmatic API/MCP DNS lets CI pipelines and AI agents check availability, claim fresh labels, write A/AAAA/CNAME/TXT records, and clean them up automatically.',
    cli: 'agentdomains record homebox --type A --content "$(curl -s https://api.ipify.org)"',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/homebox/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"A","content":"203.0.113.10"}'`,
    mcpTool: 'add_dns_record',
    mcpArgs: { label: 'homebox', type: 'A', content: '203.0.113.10' },
    pitfalls: [
      'When updating an existing A record on AgentDomains, remove the stale record ID (`delete_record`) so you do not accidentally round-robin between the old and new IP.',
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
    explanation: 'Good DNS APIs for AI agents avoid partial-failure state. AgentDomains makes `POST /v1/subdomains` atomic (if your initial DNS record fails validation, the label is NOT claimed), returns `409 {"owned":true}` when re-claiming your own label so retries stay idempotent, and mirrors every REST call 1:1 in its MCP server.',
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
    summary: 'How authoritative DNS resolvers dynamically resolve CNAME chains at the edge to return A/AAAA answers faster — and when plain CNAMEs suffice.',
    explanation: 'CNAME flattening resolves a CNAME target on the authoritative server itself and returns the final IP addresses to the client, cutting out extra recursive round-trips and allowing apex aliasing. On subdomains like `myapp.makes.fyi`, standard CNAME records already work everywhere without special apex workarounds.',
    cli: 'agentdomains record myapp --type CNAME --content myapp.fly.dev',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"CNAME","content":"myapp.fly.dev"}'`,
    mcpTool: 'add_dns_record',
    mcpArgs: { label: 'myapp', type: 'CNAME', content: 'myapp.fly.dev' },
    pitfalls: [
      'When inspecting a flattened CNAME with `dig`, you may see synthetic A records directly instead of a CNAME hop.',
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
    summary: 'Always remove DNS records, proxies, or the subdomain itself *before* deleting your underlying Fly.io, Railway, Heroku, or S3 origin.',
    explanation: 'A dangling DNS takeover happens when `myapp.makes.fyi` still CNAMEs or proxies to `old-app.fly.dev` after you deleted `old-app` on Fly.io — allowing someone else to claim `old-app.fly.dev` and serve arbitrary content under your subdomain. Teardown order matters: delete DNS/proxy first, destroy cloud compute second.',
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
    summary: 'How TLS SNI lets a single IPv4 VPS or Cloudflare edge serve hundreds of HTTPS subdomains simultaneously with distinct certificates.',
    explanation: 'During the TLS ClientHello handshake, the client sends the requested hostname (`myapp.makes.fyi`) in the SNI extension before encryption begins. Your reverse proxy (Caddy, Nginx, Traefik, or AgentDomains edge) reads SNI to pick the matching TLS certificate and route the request to the right backend.',
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
    explanation: 'When TLS terminates at an edge proxy, your backend container receives proxy-forwarded traffic. Frameworks rely on `X-Forwarded-Proto: https` and `X-Forwarded-Host` to build correct `https://` OAuth redirect URLs and set `Secure` session cookies.',
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
    summary: 'How `agentdomains proxy` terminates visitor traffic at the edge rather than exposing your backend’s raw address directly in public DNS.',
    explanation: 'An A record publishes your server’s IP directly in global DNS, allowing anyone to connect straight to your box. Using `agentdomains proxy` serves requests through our Cloudflare-backed edge Worker, insulating your origin from direct DNS IP lookup while adding free edge TLS and (on Pro) daily visitor analytics.',
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
    explanation: 'DNS records (`A`, `AAAA`, `CNAME`) do not carry HTTP port numbers — browsers always connect to port 443 for `https://`. Run Caddy, Nginx, or Traefik on port 443 of your VPS to proxy cleanly to `127.0.0.1:3000`, `:8000`, or `:11434`, or deploy on Fly/Railway/Render and use `agentdomains proxy`.',
    cli: 'agentdomains record myapp --type A --content 203.0.113.10',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains/myapp/records \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"A","content":"203.0.113.10"}'`,
    mcpTool: 'add_dns_record',
    mcpArgs: { label: 'myapp', type: 'A', content: '203.0.113.10' },
    pitfalls: [
      'DNS SRV records are ignored by web browsers for HTTP/HTTPS — always use a reverse proxy to map port 443 to internal app ports.',
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
    summary: 'Why Google, GitHub, Slack, and Apple require exact HTTPS callback hostnames — and how a fixed `makes.fyi` proxy avoids redirect mismatch errors.',
    explanation: 'RFC 6749 and modern OAuth 2.1 security profiles require exact-match HTTPS redirect URIs for non-loopback applications to prevent authorization code interception. Assigning `https://oauth-app.makes.fyi/callback` gives your team a permanent callback host even when staging containers redeploy.',
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
    summary: 'Host your own remote Model Context Protocol server over stateless Streamable HTTP with trusted HTTPS TLS on port 443.',
    explanation: 'Remote MCP clients (Claude Code, Cursor, VS Code, OpenAI Agents SDK, n8n) connect to Streamable HTTP servers by POSTing JSON-RPC 2.0 payloads (`initialize`, `tools/list`, `tools/call`) to a public HTTPS endpoint. Fronting your MCP worker with `agentdomains proxy` provides instant edge TLS and clean `*.agentdomains.co` branding.',
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
    explanation: 'Use `dig +short A myapp.makes.fyi` for scripting, `dig @1.1.1.1 TXT _acme-challenge.myapp.makes.fyi +noall +answer` to inspect live ACME tokens and remaining TTLs, and `dig +trace myapp.makes.fyi` to walk the full delegation chain from root nameservers down.',
    cli: 'dig @1.1.1.1 myapp.makes.fyi ANY +noall +answer',
    curl: `curl -s "https://dns.google/resolve?name=myapp.makes.fyi&type=A"`,
    mcpTool: 'get_domain',
    mcpArgs: { label: 'myapp' },
    pitfalls: [
      'Modern Cloudflare authoritative zones return RFC 8482 minimal responses for `ANY` queries — query explicit types (`A`, `AAAA`, `CNAME`, `TXT`, `NS`) instead.',
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
    explanation: '`nslookup` ships by default on Windows and macOS, making it handy in a pinch (`nslookup -type=TXT _acme-challenge.myapp.makes.fyi 1.1.1.1`), but `dig` shows exact TTLs, flags (`aa`, `ad`), and query latency cleanly. When working from a restricted corporate network or browser, our live DoH `/tools/dns-ssl-checker` queries both `1.1.1.1` and `8.8.8.8` simultaneously.',
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
    summary: 'A practical 4-step checklist when your newly created subdomain works on mobile data but not on your laptop Wi-Fi.',
    explanation: 'DNS does not "push" updates across the globe — resolvers pull records lazily and cache them for TTL seconds. If your phone loads `myapp.makes.fyi` while your laptop gets NXDOMAIN, your laptop or office router cached an earlier NXDOMAIN response. Check `1.1.1.1` and `8.8.8.8` via DoH, flush OS DNS cache, or open an incognito tab.',
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
    explanation: 'By default, AgentDomains `set_forward` sets `preserve_path: true`, appending the incoming path and query string onto your target URL so deep links stay intact. Set `preserve_path: false` when you want every path on an old promo domain to land cleanly on a single landing page.',
    cli: 'agentdomains forward myapp https://docs.example.com',
    curl: `curl -X PUT https://api.agentdomains.co/v1/subdomains/myapp/forward \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"target":"https://docs.example.com","permanent":false,"preserve_path":true}'`,
    mcpTool: 'set_forward',
    mcpArgs: { label: 'myapp', target: 'https://docs.example.com', preserve_path: true },
    pitfalls: [
      'Avoid `cloak: true` (iframe cloaking) for modern web apps — most sites send `X-Frame-Options: DENY` or `frame-ancestors` CSP headers that block iframes.',
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
    summary: 'An honest architectural guide to when a managed subdomain (`*.makes.fyi` / `*.agentdomains.co`) beats buying a `.com` — and when you must buy a TLD.',
    explanation: 'A managed subdomain has zero ICANN registry fee, zero WHOIS paperwork, instant API/MCP provisioning, and works for 100 agent projects at $10/yr total. However, you do NOT own it in the registrar sense: there is no EPP transfer code and it lives as long as the operator runs. Use managed subdomains for demos, previews, webhooks, bots, and agent prototypes; buy a real `.com`/`.dev` at Cloudflare Registrar or Porkbun for your long-term company brand or email domain.',
    cli: 'agentdomains claim proto-demo --email you@example.com',
    curl: `curl -X POST https://api.agentdomains.co/v1/subdomains \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"label":"proto-demo","email":"you@example.com"}'`,
    mcpTool: 'claim_domain',
    mcpArgs: { label: 'proto-demo', email: 'you@example.com' },
    pitfalls: [
      'When a prototype outgrows `*.makes.fyi` and earns a real `.com`, turn your old subdomain into a `301` redirect (`set_forward` with `permanent: true`) so existing links migrate smoothly.',
    ],
  },
];
