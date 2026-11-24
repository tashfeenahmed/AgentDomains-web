// Cluster 2: 45 Origin & Host Integration Playbooks
// Every platform gets tailored Proxy vs. A-record+ACME DNS-01 guidance, exact CLI snippets,
// realistic default origin/label for the interactive CLI generator, and platform-specific tips.
export const HOST_GUIDES = [
  {
    slug: 'hetzner-vps',
    name: 'Hetzner Cloud VPS',
    group: 'Cloud VPS',
    mode: 'record',
    defaultLabel: 'hetzner-api',
    defaultOrigin: '203.0.113.10',
    originHint: 'Your Hetzner Cloud public IPv4 (e.g. 203.0.113.10)',
    recommendation: 'Use an A record (plus optional AAAA for Hetzner’s free /64 IPv6) and terminate TLS on your VPS with Caddy or Certbot DNS-01. Remember: AgentDomains edge proxy requires an upstream hostname, not a bare IP.',
    serverSnippet: `# On your Hetzner VPS with Caddy installed (/etc/caddy/Caddyfile)
hetzner-api.makes.fyi {
    reverse_proxy 127.0.0.1:8000
}`,
    notes: [
      'Open TCP ports 80 and 443 in the Hetzner Cloud Firewall so HTTP-01 works automatically, or keep port 80 closed and use `agentdomains txt` for ACME DNS-01.',
      'Hetzner assigns both IPv4 and IPv6; add an AAAA record with `agentdomains record hetzner-api --type AAAA --content 2001:db8::1` if your app binds `[::]`.',
      'If you run Coolify or Dokploy on Hetzner, see those dedicated playbooks for wildcard routing.',
    ],
  },
  {
    slug: 'digitalocean-droplet',
    name: 'DigitalOcean Droplet',
    group: 'Cloud VPS',
    mode: 'record',
    defaultLabel: 'do-app',
    defaultOrigin: '198.51.100.24',
    originHint: 'Your Droplet Reserved or Public IPv4',
    recommendation: 'Point an A record straight at your Droplet’s public IPv4 and let Caddy or Nginx + Certbot issue a Let’s Encrypt cert via HTTP-01 or AgentDomains DNS-01.',
    serverSnippet: `# Allow HTTPS on Ubuntu Droplet & test Certbot DNS-01
sudo ufw allow 443/tcp
sudo certbot certonly --manual --preferred-challenges dns -d do-app.makes.fyi`,
    notes: [
      'Use a DigitalOcean Reserved IP if you rebuild Droplets often — or just update the A record in one CLI/MCP call.',
      'For DigitalOcean App Platform (`*.ondigitalocean.app`), switch to `agentdomains proxy` instead of an A record.',
    ],
  },
  {
    slug: 'fly-io',
    name: 'Fly.io',
    group: 'PaaS & Containers',
    mode: 'proxy',
    defaultLabel: 'fly-demo',
    defaultOrigin: 'my-agent-app.fly.dev',
    originHint: 'Your Fly app hostname (without https://)',
    recommendation: 'Use `agentdomains proxy` directly against `<app>.fly.dev`. You get instant edge HTTPS without running `fly certs add` or paying for a dedicated IPv4.',
    serverSnippet: `# Or if you prefer native Fly TLS termination via CNAME + fly certs:
fly certs add fly-demo.makes.fyi
agentdomains record fly-demo --type CNAME --content my-agent-app.fly.dev`,
    notes: [
      'Pass `my-agent-app.fly.dev` without `https://` — `agentdomains proxy` takes a bare upstream hostname.',
      'If your Fly app checks the Host header (e.g. Django ALLOWED_HOSTS or Rails hosts), add `fly-demo.makes.fyi` to the allowlist.',
    ],
  },
  {
    slug: 'railway',
    name: 'Railway',
    group: 'PaaS & Containers',
    mode: 'proxy',
    defaultLabel: 'rail-api',
    defaultOrigin: 'my-service-production.up.railway.app',
    originHint: 'Your Railway generated domain (*.up.railway.app)',
    recommendation: 'Use `agentdomains proxy` pointing at your `*.up.railway.app` hostname. Zero custom-domain verification wait and instant HTTPS at our edge.',
    serverSnippet: `# Railway exposes a public hostname under Settings → Networking → Generate Domain
# Verify origin responds before proxying:
curl -I https://my-service-production.up.railway.app`,
    notes: [
      'Railway apps scale to zero on hobby plans; first request after idle may take 1–2 seconds while Railway wakes the container.',
      'If you need direct Railway edge routing instead of proxying, create a CNAME record pointing at your Railway target.',
    ],
  },
  {
    slug: 'render',
    name: 'Render',
    group: 'PaaS & Containers',
    mode: 'proxy',
    defaultLabel: 'render-bot',
    defaultOrigin: 'my-bot.onrender.com',
    originHint: 'Your Render web service hostname (*.onrender.com)',
    recommendation: 'Use `agentdomains proxy` targeting `<service>.onrender.com` for immediate HTTPS on your custom makes.fyi or agentdomains.co hostname.',
    serverSnippet: `# Ensure your Render Web Service listens on $PORT (default 10000)
# Then proxy straight to your .onrender.com origin:
curl -sS https://render-bot.makes.fyi/health`,
    notes: [
      'Free Render web services spin down after 15 minutes of inactivity; keep health checks lightweight.',
      'For static sites on Render, `agentdomains proxy` preserves clean URLs without redirecting the browser bar.',
    ],
  },
  {
    slug: 'raspberry-pi',
    name: 'Raspberry Pi',
    group: 'Homelab & Self-Hosted',
    mode: 'record',
    defaultLabel: 'pi-lab',
    defaultOrigin: '203.0.113.42',
    originHint: 'Your home router public IP (or use Tailscale Funnel + proxy)',
    recommendation: 'If you have a public IP + port forwarding, set an A record and run Caddy with ACME DNS-01. If you are behind CGNAT, expose via Tailscale Funnel/Cloudflare Tunnel and point `agentdomains proxy` at that hostname.',
    serverSnippet: `# Cron script on Raspberry Pi to keep your A record fresh when ISP IP changes:
IP=$(curl -s https://api.ipify.org)
agentdomains record pi-lab --type A --content "$IP"`,
    notes: [
      'Never expose port 80 on a home ISP that blocks inbound port 80 — use `agentdomains txt pi-lab <token>` for ACME DNS-01 TLS certificates.',
      'The Go CLI compiles cleanly for `linux/arm64` (Raspberry Pi 4/5) and `linux/arm` (Pi Zero 2 W).',
    ],
  },
  {
    slug: 'docker-compose',
    name: 'Docker Compose',
    group: 'Containers & Orchestration',
    mode: 'record',
    defaultLabel: 'compose-app',
    defaultOrigin: '203.0.113.15',
    originHint: 'Docker host public IPv4',
    recommendation: 'Point an A record to your Docker host IP and run a lightweight Caddy or Traefik container alongside your app services to handle HTTPS and container routing.',
    serverSnippet: `services:
  caddy:
    image: caddy:2-alpine
    ports: ["80:80", "443:443"]
    command: caddy reverse-proxy --from compose-app.makes.fyi --to app:3000
  app:
    build: .`,
    notes: [
      'Using `caddy reverse-proxy --from compose-app.makes.fyi --to app:3000` needs zero Caddyfile for single-service stacks.',
      'Mount `/data` in Caddy so Let’s Encrypt certificates survive `docker compose down && up`.',
    ],
  },
  {
    slug: 'fastapi',
    name: 'FastAPI (Python)',
    group: 'Web Frameworks',
    mode: 'proxy',
    defaultLabel: 'fastapi-demo',
    defaultOrigin: 'fastapi-demo.fly.dev',
    originHint: 'Hostname where Uvicorn/FastAPI is deployed',
    recommendation: 'Deploy FastAPI on Fly.io, Railway, or Render and put `agentdomains proxy` in front so `/docs` (Swagger UI) and `/openapi.json` serve cleanly over HTTPS.',
    serverSnippet: `# Run Uvicorn trusting proxy headers so request.url reflects HTTPS
uvicorn main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips="*"`,
    notes: [
      'Pass `--proxy-headers` to Uvicorn so FastAPI generates `https://` redirect URLs instead of `http://`.',
      'If hosting FastAPI on a bare VPS IP, switch to an A record + Caddy in front of Uvicorn.',
    ],
  },
  {
    slug: 'nextjs',
    name: 'Next.js',
    group: 'Web Frameworks',
    mode: 'proxy',
    defaultLabel: 'next-demo',
    defaultOrigin: 'my-next-app.vercel.app',
    originHint: 'Your Next.js deployment host (Vercel, Railway, Fly, Render)',
    recommendation: 'Use `agentdomains proxy` when hosting Next.js on Railway, Fly.io, or Render. For Vercel deployments, note that Vercel checks the Host header — either configure custom domain CNAME or proxy a self-hosted `next start` origin.',
    serverSnippet: `# In next.config.mjs, allow your AgentDomains hostname for Server Actions if proxied:
export default {
  experimental: {
    serverActions: { allowedOrigins: ['next-demo.makes.fyi'] }
  }
};`,
    notes: [
      'Set `NEXTAUTH_URL=https://next-demo.makes.fyi` (or Auth.js `AUTH_URL`) so OAuth callbacks match your public hostname.',
      'For self-hosted Next.js on a VPS, run `next start -p 3000` behind Caddy with an A record.',
    ],
  },
  {
    slug: 'express',
    name: 'Express.js (Node)',
    group: 'Web Frameworks',
    mode: 'proxy',
    defaultLabel: 'express-api',
    defaultOrigin: 'express-api.up.railway.app',
    originHint: 'Your Node/Express deployment hostname',
    recommendation: 'Put `agentdomains proxy` in front of your PaaS-hosted Express app, or point an A record at your VPS + Caddy. Enable `trust proxy` in Express so `req.ip` and `req.protocol` work accurately.',
    serverSnippet: `const app = express();
app.set('trust proxy', true);
app.get('/health', (req, res) => res.json({ host: req.hostname, proto: req.protocol }));`,
    notes: [
      'Without `app.set("trust proxy", true)`, secure cookies (`cookie.secure = true`) and rate-limiters reading `X-Forwarded-For` will misbehave.',
      'Update CORS `origin` allowlists to include `https://express-api.makes.fyi`.',
    ],
  },
  {
    slug: 'go-http',
    name: 'Go net/http',
    group: 'Web Frameworks',
    mode: 'record',
    defaultLabel: 'go-service',
    defaultOrigin: '203.0.113.20',
    originHint: 'Your Go server public IPv4 (or PaaS hostname for proxy)',
    recommendation: 'Point an A record directly at your Linux box and serve native HTTPS right from Go’s `golang.org/x/crypto/acme/autocert` — zero external reverse proxy needed!',
    serverSnippet: `m := &autocert.Manager{
    Prompt: autocert.AcceptTOS,
    HostPolicy: autocert.HostWhitelist("go-service.makes.fyi"),
    Cache: autocert.DirCache("/var/cache/certs"),
}
srv := &http.Server{Addr: ":443", TLSConfig: m.TLSConfig(), Handler: mux}
log.Fatal(srv.ListenAndServeTLS("", ""))`,
    notes: [
      'Keep port 80 serving `m.HTTPHandler(nil)` for automatic HTTP-01 challenges, or use `agentdomains proxy` if running on Fly.io/Cloud Run.',
      'Go binaries pair nicely with the AgentDomains Go CLI (`go install github.com/tashfeenahmed/AgentDomains/cmd/agentdomains@latest`).',
    ],
  },
  {
    slug: 'flask',
    name: 'Flask (Python)',
    group: 'Web Frameworks',
    mode: 'proxy',
    defaultLabel: 'flask-demo',
    defaultOrigin: 'flask-demo.onrender.com',
    originHint: 'Your Gunicorn/Flask PaaS hostname',
    recommendation: 'Use `agentdomains proxy` in front of Render/Railway/Fly Gunicorn deployments and wrap Flask with Werkzeug’s `ProxyFix` middleware.',
    serverSnippet: `from werkzeug.middleware.proxy_fix import ProxyFix
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)`,
    notes: [
      'Never run Flask’s built-in development server directly on the public internet — serve through Gunicorn (`gunicorn app:app`).',
      'ProxyFix ensures `url_for(..., _external=True)` produces `https://flask-demo.makes.fyi/...`.',
    ],
  },
  {
    slug: 'django',
    name: 'Django',
    group: 'Web Frameworks',
    mode: 'proxy',
    defaultLabel: 'django-app',
    defaultOrigin: 'django-app.up.railway.app',
    originHint: 'Your Django deployment hostname',
    recommendation: 'Use `agentdomains proxy` for PaaS Django apps or an A record + Caddy for VPS deploys. Remember to update `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS`.',
    serverSnippet: `# settings.py
ALLOWED_HOSTS = ["django-app.makes.fyi", "django-app.up.railway.app"]
CSRF_TRUSTED_ORIGINS = ["https://django-app.makes.fyi"]
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")`,
    notes: [
      'Forgetting `CSRF_TRUSTED_ORIGINS` is the #1 cause of 403 errors on Django admin login behind an HTTPS edge proxy.',
      'Set `SECURE_PROXY_SSL_HEADER` so Django recognizes requests terminated over HTTPS at the AgentDomains edge.',
    ],
  },
  {
    slug: 'rails',
    name: 'Ruby on Rails',
    group: 'Web Frameworks',
    mode: 'proxy',
    defaultLabel: 'rails-demo',
    defaultOrigin: 'rails-demo.fly.dev',
    originHint: 'Your Rails Puma/Thruster host',
    recommendation: 'Use `agentdomains proxy` for Fly.io/Render/Railway Rails apps, or an A record when deploying via Kamal to a VPS. Whitelist the hostname in `config.hosts`.',
    serverSnippet: `# config/environments/production.rb
config.hosts << "rails-demo.makes.fyi"
config.assume_ssl = true`,
    notes: [
      'Rails 7.1+ `config.assume_ssl = true` works cleanly behind the AgentDomains TLS-terminating edge proxy.',
      'For ActionCable WebSockets over custom domains, include `https://rails-demo.makes.fyi` in `config.action_cable.allowed_request_origins`.',
    ],
  },
  {
    slug: 'laravel',
    name: 'Laravel (PHP)',
    group: 'Web Frameworks',
    mode: 'record',
    defaultLabel: 'laravel-app',
    defaultOrigin: '203.0.113.30',
    originHint: 'Your Laravel VPS IP (or Forge/Cloud/Fly hostname for proxy)',
    recommendation: 'Point an A record at your PHP-FPM/FrankenPHP VPS (or use `agentdomains proxy` for PaaS deploys) and set `APP_URL` and `TrustProxies`.',
    serverSnippet: `# .env
APP_URL=https://laravel-app.makes.fyi
# In bootstrap/app.php (Laravel 11+):
$middleware->trustProxies(at: '*');`,
    notes: [
      'Signed routes (`URL::signedRoute`) fail validation if `APP_URL` or `trustProxies` does not match the public HTTPS hostname.',
      'FrankenPHP embeds Caddy so an A record gets automatic HTTPS with a single binary.',
    ],
  },
  {
    slug: 'rust-axum',
    name: 'Rust (Axum)',
    group: 'Web Frameworks',
    mode: 'record',
    defaultLabel: 'axum-api',
    defaultOrigin: '203.0.113.35',
    originHint: 'Your Linux VPS IP or Fly.io hostname',
    recommendation: 'Use an A record + Caddy on a tiny VPS for sub-millisecond overhead, or `agentdomains proxy` in front of a Fly.io Rust container.',
    serverSnippet: `// Bind 0.0.0.0:8080 inside your container or 127.0.0.1:8080 behind Caddy
let listener = tokio::net::TcpListener::bind("127.0.0.1:8080").await?;
axum::serve(listener, app).await?;`,
    notes: [
      'Add `tower_http::cors::CorsLayer` allowing `https://axum-api.makes.fyi` if a browser SPA calls your Rust API.',
      'Axum works seamlessly with HTTP/2 and WebSockets behind Caddy or Traefik.',
    ],
  },
  {
    slug: 'ollama-api',
    name: 'Ollama Local LLM API',
    group: 'AI & LLM Inference',
    mode: 'record',
    defaultLabel: 'ollama-node',
    defaultOrigin: '203.0.113.50',
    originHint: 'Your GPU server IP (always put bearer auth in front!)',
    recommendation: 'Point an A record at your GPU box and terminate TLS + Bearer token auth in Caddy before forwarding to `127.0.0.1:11434`. Never expose raw unauthenticated Ollama on port 11434!',
    serverSnippet: `# /etc/caddy/Caddyfile — protect Ollama with a Bearer token!
ollama-node.makes.fyi {
    @unauth not header Authorization "Bearer YOUR_SECRET_TOKEN"
    respond @unauth 401
    reverse_proxy 127.0.0.1:11434
}`,
    notes: [
      'Ollama ships with zero built-in authentication — always enforce an Authorization header in Caddy/Nginx before exposing an HTTPS domain.',
      'Set `OLLAMA_ORIGINS="https://*"` only if browser apps call your endpoint directly.',
    ],
  },
  {
    slug: 'vllm',
    name: 'vLLM Inference Server',
    group: 'AI & LLM Inference',
    mode: 'record',
    defaultLabel: 'vllm-gpu',
    defaultOrigin: '203.0.113.55',
    originHint: 'Your GPU VM public IPv4',
    recommendation: 'Point an A record at your GPU instance, launch vLLM with `--api-key`, and terminate HTTPS via Caddy so OpenAI-compatible SDKs can hit `https://vllm-gpu.makes.fyi/v1`.',
    serverSnippet: `vllm serve meta-llama/Llama-3.1-8B-Instruct \\
  --host 127.0.0.1 --port 8000 \\
  --api-key "$VLLM_API_KEY"`,
    notes: [
      'Configure your reverse proxy to disable response buffering (`flush_interval -1` in Caddy / `proxy_buffering off` in Nginx) so SSE token streaming stays instant.',
      'AgentDomains has no bandwidth bill or request quota, making it ideal for long streaming inference responses.',
    ],
  },
  {
    slug: 'caddy',
    name: 'Caddy Server',
    group: 'Reverse Proxies',
    mode: 'record',
    defaultLabel: 'caddy-edge',
    defaultOrigin: '203.0.113.60',
    originHint: 'Your Caddy server public IPv4',
    recommendation: 'Set an A record pointing to your Caddy host. Caddy automatically obtains and renews Let’s Encrypt TLS certificates on first request with zero extra configuration.',
    serverSnippet: `# /etc/caddy/Caddyfile
caddy-edge.makes.fyi {
    encode zstd gzip
    reverse_proxy 127.0.0.1:3000
}`,
    notes: [
      'If port 80 is blocked, use `agentdomains txt caddy-edge <token>` or delegate NS to a provider with a Caddy DNS plugin.',
      'Check `journalctl -u caddy -f` to watch automatic ACME issuance complete in ~5 seconds after your A record propagates.',
    ],
  },
  {
    slug: 'nginx',
    name: 'Nginx',
    group: 'Reverse Proxies',
    mode: 'record',
    defaultLabel: 'nginx-box',
    defaultOrigin: '203.0.113.61',
    originHint: 'Your Nginx server public IPv4',
    recommendation: 'Create an A record to your Nginx VPS, then run `certbot --nginx -d nginx-box.makes.fyi` (or DNS-01 via `agentdomains txt`) for automatic TLS.',
    serverSnippet: `server {
    listen 80;
    server_name nginx-box.makes.fyi;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}`,
    notes: [
      'Include `proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade";` for WebSocket apps.',
      'Test your A record propagation before running Certbot with our free `/tools/dns-ssl-checker`.',
    ],
  },
  {
    slug: 'traefik',
    name: 'Traefik',
    group: 'Reverse Proxies',
    mode: 'record',
    defaultLabel: 'traefik-gw',
    defaultOrigin: '203.0.113.62',
    originHint: 'Your Traefik host public IPv4',
    recommendation: 'Point an A record at your Traefik host and attach a `Host(\`traefik-gw.makes.fyi\`)` router label with an ACME `tlschallenge` or `httpchallenge` resolver.',
    serverSnippet: `labels:
  - "traefik.enable=true"
  - "traefik.http.routers.app.rule=Host(\`traefik-gw.makes.fyi\`)"
  - "traefik.http.routers.app.entrypoints=websecure"
  - "traefik.http.routers.app.tls.certresolver=le"`,
    notes: [
      'Remember to persist `acme.json` with `chmod 600` on a host volume so container restarts do not hit Let’s Encrypt rate limits.',
      'For wildcard certs (`*.traefik-gw.makes.fyi`), delegate NS or publish DNS-01 TXT records.',
    ],
  },
  {
    slug: 'coolify',
    name: 'Coolify',
    group: 'Self-Hosted PaaS',
    mode: 'record',
    defaultLabel: 'coolify-box',
    defaultOrigin: '203.0.113.70',
    originHint: 'Your Coolify server public IPv4',
    recommendation: 'Point an A record (plus an optional wildcard `*.coolify-box.makes.fyi` or individual sub-labels) to your Coolify VPS IP, then enter `https://coolify-box.makes.fyi` in Coolify’s Domains field.',
    serverSnippet: `# Point apex and a sub-label for staging apps on the same Coolify box:
agentdomains record coolify-box --type A --content 203.0.113.70
agentdomains record coolify-box --type A --host api --content 203.0.113.70`,
    notes: [
      'Coolify’s built-in Traefik proxy auto-provisions Let’s Encrypt certs as soon as the A record resolves.',
      'You can create sub-labels (`api.coolify-box.makes.fyi`, `web.coolify-box.makes.fyi`) under a single claimed name using `--host`!',
    ],
  },
  {
    slug: 'dokploy',
    name: 'Dokploy',
    group: 'Self-Hosted PaaS',
    mode: 'record',
    defaultLabel: 'dokploy-srv',
    defaultOrigin: '203.0.113.71',
    originHint: 'Your Dokploy VPS public IPv4',
    recommendation: 'Create an A record pointing to your Dokploy server IP, add `dokploy-srv.makes.fyi` in Dokploy’s Domains tab, and toggle HTTPS (Let’s Encrypt) on.',
    serverSnippet: `# Expose both the Dokploy panel and an app under one claimed subdomain:
agentdomains record dokploy-srv --type A --content 203.0.113.71
agentdomains record dokploy-srv --type A --host panel --content 203.0.113.71`,
    notes: [
      'Wait ~10 seconds after setting the A record before toggling Let’s Encrypt in Dokploy so Traefik’s HTTP-01 check succeeds on the first try.',
      'Sub-labels like `app1.dokploy-srv.makes.fyi` do not consume extra name quota!',
    ],
  },
  {
    slug: 'kamal',
    name: 'Kamal (kamal-proxy)',
    group: 'Self-Hosted PaaS',
    mode: 'record',
    defaultLabel: 'kamal-app',
    defaultOrigin: '203.0.113.72',
    originHint: 'Your Kamal target server IPv4',
    recommendation: 'Point an A record at your Kamal host IP and set `proxy: ssl: true` with `host: kamal-app.makes.fyi` in `config/deploy.yml`. Kamal-proxy handles Let’s Encrypt automatically.',
    serverSnippet: `# config/deploy.yml
proxy:
  ssl: true
  host: kamal-app.makes.fyi
  app_port: 3000`,
    notes: [
      'Kamal 2 uses `kamal-proxy` with built-in Let’s Encrypt HTTP-01 — no Traefik or Nginx setup needed.',
      'Keep your A record pointed at the server IP before running `kamal setup`.',
    ],
  },
  {
    slug: 'aws-ec2',
    name: 'AWS EC2',
    group: 'Major Clouds',
    mode: 'record',
    defaultLabel: 'ec2-node',
    defaultOrigin: '198.51.100.80',
    originHint: 'Your EC2 Elastic IPv4 (or ALB hostname for proxy)',
    recommendation: 'Attach an Elastic IP to your EC2 instance and point an A record at it (with Caddy/Nginx TLS), OR if you sit behind an AWS Application Load Balancer (`*.elb.amazonaws.com`), use `agentdomains proxy` for zero ACM cert paperwork.',
    serverSnippet: `# If fronting an AWS ALB hostname instead of a bare EC2 IP:
agentdomains proxy ec2-node my-alb-123456.us-east-1.elb.amazonaws.com`,
    notes: [
      'Ensure your EC2 Security Group allows inbound TCP 80 and 443 from `0.0.0.0/0`.',
      'EC2 instances without an Elastic IP change public IP on stop/start — update the A record in a user-data boot script if needed.',
    ],
  },
  {
    slug: 'aws-lightsail',
    name: 'AWS Lightsail',
    group: 'Major Clouds',
    mode: 'record',
    defaultLabel: 'lightsail-app',
    defaultOrigin: '198.51.100.81',
    originHint: 'Your Lightsail Static IPv4',
    recommendation: 'Attach a free Lightsail Static IP, create an A record with `agentdomains record`, and terminate HTTPS via Caddy or Bitnami’s `bncert-tool`.',
    serverSnippet: `# Open HTTPS in Lightsail Networking tab, then verify DNS:
dig +short A lightsail-app.makes.fyi`,
    notes: [
      'For Lightsail Container Services (`*.cs.amazonlightsail.com`), use `agentdomains proxy` directly against the service hostname.',
      'Lightsail Static IPs are free while attached to a running instance.',
    ],
  },
  {
    slug: 'linode',
    name: 'Linode (Akamai Cloud)',
    group: 'Cloud VPS',
    mode: 'record',
    defaultLabel: 'linode-api',
    defaultOrigin: '198.51.100.82',
    originHint: 'Your Linode public IPv4',
    recommendation: 'Set an A record (and optional AAAA) to your Linode IP and let Caddy or Certbot handle TLS.',
    serverSnippet: `# Add both IPv4 and IPv6 records for dual-stack Linode instances:
agentdomains record linode-api --type A --content 198.51.100.82
agentdomains record linode-api --type AAAA --content 2001:db8::82`,
    notes: [
      'Check Akamai Cloud Firewalls if HTTP-01 validation hangs on port 80.',
      'Sub-labels under one claimed name let you host multiple services on one Nanode.',
    ],
  },
  {
    slug: 'vultr',
    name: 'Vultr',
    group: 'Cloud VPS',
    mode: 'record',
    defaultLabel: 'vultr-box',
    defaultOrigin: '198.51.100.83',
    originHint: 'Your Vultr Cloud Compute IPv4',
    recommendation: 'Point an A record at your Vultr instance IP and serve HTTPS via Caddy or Nginx + Certbot.',
    serverSnippet: `# Verify ufw allows 80/443 on Ubuntu/Debian Vultr images:
sudo ufw allow 80/tcp && sudo ufw allow 443/tcp`,
    notes: [
      'Vultr’s default Ubuntu firewall blocks ports 80 and 443 on some marketplace images — verify `ufw status` first.',
      'Works great with Vultr GPU instances for private LLM inference APIs.',
    ],
  },
  {
    slug: 'oracle-cloud',
    name: 'Oracle Cloud (OCI Free Tier)',
    group: 'Major Clouds',
    mode: 'record',
    defaultLabel: 'oci-arm',
    defaultOrigin: '198.51.100.84',
    originHint: 'Your OCI instance Reserved Public IPv4',
    recommendation: 'Point an A record at your OCI Always Free ARM VM public IP. Remember OCI requires opening ports 80/443 in BOTH the VCN Security List AND the VM’s local `iptables`!',
    serverSnippet: `# OCI Ubuntu images ship with restrictive iptables rules — open 80 & 443:
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save`,
    notes: [
      'Missing the local `iptables` rule on OCI Ubuntu/Oracle Linux is the #1 reason HTTPS times out even when VCN Ingress Rules are open.',
      'Pair OCI’s 4-core/24GB Always Free Ampere VM with AgentDomains for a zero-cost production-grade staging lab.',
    ],
  },
  {
    slug: 'google-cloud-run',
    name: 'Google Cloud Run',
    group: 'Major Clouds',
    mode: 'proxy',
    defaultLabel: 'cloudrun-api',
    defaultOrigin: 'my-service-abc123-uc.a.run.app',
    originHint: 'Your Cloud Run *.a.run.app hostname (without https://)',
    recommendation: 'Use `agentdomains proxy` directly against your `*.a.run.app` hostname! Cloud Run custom domain mappings only work in select regions and take 15+ minutes — our edge proxy works globally in seconds.',
    serverSnippet: `# Ensure unauthenticated invoke is enabled for public endpoints/webhooks:
gcloud run services add-iam-policy-binding my-service \\
  --member="allUsers" --role="roles/run.invoker" --region=us-central1`,
    notes: [
      'Cloud Run scales cleanly to zero; AgentDomains edge proxy passes traffic straight to your regional `.a.run.app` origin.',
      'Never include `https://` in the origin argument to `agentdomains proxy`.',
    ],
  },
  {
    slug: 'supabase-webhooks',
    name: 'Supabase Webhooks & Edge Functions',
    group: 'Webhooks & SaaS',
    mode: 'proxy',
    defaultLabel: 'supa-hooks',
    defaultOrigin: 'my-webhook-worker.fly.dev',
    originHint: 'Hostname of your webhook receiver service',
    recommendation: 'Use `agentdomains proxy` to give your webhook handler a clean, stable HTTPS URL (`https://supa-hooks.makes.fyi/db-events`) that survives backend host swaps without editing Supabase Database Webhooks.',
    serverSnippet: `# Verify your Supabase webhook secret header in your handler:
if (req.headers['x-supabase-signature'] !== process.env.WEBHOOK_SECRET) {
  return res.status(401).end();
}`,
    notes: [
      'Supabase Database Webhooks require valid HTTPS TLS certificates — AgentDomains edge proxy provides trusted TLS automatically.',
      'You can also point `supa-hooks.makes.fyi` at a Supabase Edge Function host or your own FastAPI/Express receiver.',
    ],
  },
  {
    slug: 'stripe-webhooks',
    name: 'Stripe Webhooks',
    group: 'Webhooks & SaaS',
    mode: 'proxy',
    defaultLabel: 'stripe-hook',
    defaultOrigin: 'billing-worker.up.railway.app',
    originHint: 'Your billing/webhook backend hostname',
    recommendation: 'Use `agentdomains proxy` to expose a trusted HTTPS endpoint (`https://stripe-hook.makes.fyi/webhooks/stripe`) for Stripe test and live mode webhooks without touching SSL configs.',
    serverSnippet: `# Register the endpoint in Stripe Dashboard → Developers → Webhooks:
# Endpoint URL: https://stripe-hook.makes.fyi/webhooks/stripe
# Always pass the raw unparsed request body to stripe.webhooks.constructEvent()`,
    notes: [
      'Stripe strictly rejects self-signed certificates and non-443 ports in live mode — AgentDomains edge HTTPS satisfies Stripe’s TLS checks out of the box.',
      'AgentDomains proxy preserves raw request bodies and `Stripe-Signature` headers untouched.',
    ],
  },
  {
    slug: 'github-webhooks',
    name: 'GitHub Webhooks',
    group: 'Webhooks & SaaS',
    mode: 'proxy',
    defaultLabel: 'gh-hooks',
    defaultOrigin: 'ci-bot.fly.dev',
    originHint: 'Your GitHub App or webhook bot hostname',
    recommendation: 'Use `agentdomains proxy` so GitHub delivers `push`, `pull_request`, and `check_run` events over verified HTTPS to `https://gh-hooks.makes.fyi/webhook`.',
    serverSnippet: `# Verify X-Hub-Signature-256 HMAC SHA-256 on every GitHub webhook payload
# Payload URL: https://gh-hooks.makes.fyi/webhook
# Content type: application/json`,
    notes: [
      'Never turn off SSL verification in GitHub Webhook settings — AgentDomains provides valid Cloudflare-backed edge TLS automatically.',
      'If your bot moves from Railway to Fly.io, one `agentdomains proxy` command updates routing without editing 20 repo webhooks.',
    ],
  },
  {
    slug: 'twilio-webhooks',
    name: 'Twilio Voice & SMS Webhooks',
    group: 'Webhooks & SaaS',
    mode: 'proxy',
    defaultLabel: 'twilio-voice',
    defaultOrigin: 'voice-agent.fly.dev',
    originHint: 'Your TwiML/Media Streams backend hostname',
    recommendation: 'Use `agentdomains proxy` for standard HTTPS TwiML webhooks (`https://twilio-voice.makes.fyi/voice`), or an A record + Caddy for high-concurrency Twilio Media Streams WebSockets.',
    serverSnippet: `# Set your Twilio Phone Number "A call comes in" webhook to:
# https://twilio-voice.makes.fyi/voice (HTTP POST)`,
    notes: [
      'Twilio validates X-Twilio-Signature against the exact full HTTPS URL (`https://twilio-voice.makes.fyi/voice`) — make sure your app reconstructs the public hostname, not the internal origin host.',
      'Always validate `X-Twilio-Signature` so unauthenticated callers cannot trigger outbound calls or SMS.',
    ],
  },
  {
    slug: 'clerk-webhooks',
    name: 'Clerk Webhooks (Svix)',
    group: 'Webhooks & SaaS',
    mode: 'proxy',
    defaultLabel: 'clerk-sync',
    defaultOrigin: 'auth-sync.up.railway.app',
    originHint: 'Your user-sync backend hostname',
    recommendation: 'Use `agentdomains proxy` to give Clerk/Svix a clean HTTPS URL (`https://clerk-sync.makes.fyi/api/webhooks/clerk`) for `user.created` and `session.created` events.',
    serverSnippet: `// Verify Svix headers (svix-id, svix-timestamp, svix-signature) using the raw body
const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
const evt = wh.verify(rawBody, svixHeaders);`,
    notes: [
      'Do not use a 301/302 forward for webhooks — Svix/Clerk does not follow redirects on POST webhook deliveries. Always use `proxy` or an `A` record.',
      'Test live deliveries directly from the Clerk Dashboard Testing tab.',
    ],
  },
  {
    slug: 'shopify-webhooks',
    name: 'Shopify App & Webhooks',
    group: 'Webhooks & SaaS',
    mode: 'proxy',
    defaultLabel: 'shop-app',
    defaultOrigin: 'shopify-app.fly.dev',
    originHint: 'Your Shopify Remix/Node app hostname',
    recommendation: 'Use `agentdomains proxy` to serve both your Shopify App URL and mandatory GDPR/order webhooks over clean HTTPS without juggling ephemeral tunnel URLs.',
    serverSnippet: `# shopify.app.toml
application_url = "https://shop-app.makes.fyi"
[auth]
redirect_urls = ["https://shop-app.makes.fyi/auth/callback"]`,
    notes: [
      'Shopify requires valid HTTPS on port 443 and checks `X-Shopify-Hmac-Sha256` against the raw POST body.',
      'A stable `makes.fyi` hostname prevents you from updating `shopify.app.toml` every time a local tunnel restarts.',
    ],
  },
  {
    slug: 'replit',
    name: 'Replit',
    group: 'AI & Cloud IDEs',
    mode: 'proxy',
    defaultLabel: 'replit-demo',
    defaultOrigin: 'my-repl.replit.app',
    originHint: 'Your deployed Replit *.replit.app hostname',
    recommendation: 'Deploy your Repl to `*.replit.app`, then run `agentdomains proxy` so visitors see a clean `replit-demo.makes.fyi` URL instead of a long autogenerated Repl address.',
    serverSnippet: `# Test your Replit deployment is awake before proxying:
curl -I https://my-repl.replit.app`,
    notes: [
      'Use a deployed Replit Autoscale/Reserved VM URL (`*.replit.app`) rather than an ephemeral workspace dev preview URL.',
      'For simple redirection instead of proxying, `agentdomains forward` gives a clean short link with path preservation.',
    ],
  },
  {
    slug: 'bolt-new',
    name: 'Bolt.new',
    group: 'AI & Cloud IDEs',
    mode: 'proxy',
    defaultLabel: 'bolt-demo',
    defaultOrigin: 'my-bolt-site.netlify.app',
    originHint: 'The published Netlify/Vercel host exported from Bolt.new',
    recommendation: 'Publish your Bolt.new app to Netlify (or deploy its exported code to Fly/Railway), then front it with `agentdomains proxy` or `agentdomains forward` for a memorable demo domain.',
    serverSnippet: `# Point a clean client-ready demo URL at your published Bolt build:
agentdomains forward bolt-demo https://my-bolt-site.netlify.app`,
    notes: [
      'Use `forward` if your Bolt build lives on Netlify/Vercel and relies on platform-specific Host routing; use `proxy` when self-hosted on Railway/Fly/Render.',
      'Claiming a clean slug takes 2 seconds and keeps your client pitch looking sharp.',
    ],
  },
  {
    slug: 'lovable',
    name: 'Lovable',
    group: 'AI & Cloud IDEs',
    mode: 'forward',
    defaultLabel: 'lovable-mvp',
    defaultOrigin: 'my-mvp.lovable.app',
    originHint: 'Your published *.lovable.app URL',
    recommendation: 'Use `agentdomains forward` for instant memorable links to `*.lovable.app`, or export your Lovable GitHub repo to Railway/Render/Fly and front it with `agentdomains proxy`.',
    serverSnippet: `# Clean vanity redirect preserving subpaths (/pricing, /demo):
agentdomains forward lovable-mvp https://my-mvp.lovable.app`,
    notes: [
      'By default `agentdomains forward` preserves request paths and query strings (302), and supports `--permanent` for 301.',
      'Need full backend API + Supabase webhook control? Deploy the exported repo on Fly.io and switch to `agentdomains proxy`.',
    ],
  },
  {
    slug: 'v0',
    name: 'v0 by Vercel',
    group: 'AI & Cloud IDEs',
    mode: 'forward',
    defaultLabel: 'v0-proto',
    defaultOrigin: 'v0-my-prototype.vercel.app',
    originHint: 'Your published v0 *.vercel.app URL',
    recommendation: 'Use `agentdomains forward` to share clean short URLs to v0 Vercel previews, or deploy the generated Next.js app to your own container/VPS and serve it at `v0-proto.makes.fyi` via `proxy` or `A` record.',
    serverSnippet: `# Share a clean URL that forwards straight to your v0 prototype:
agentdomains forward v0-proto https://v0-my-prototype.vercel.app`,
    notes: [
      'When you iterate and deploy a new v0 revision URL, simply re-run `agentdomains forward v0-proto <new-url>` — the link you sent stakeholders never breaks.',
    ],
  },
  {
    slug: 'github-codespaces',
    name: 'GitHub Codespaces',
    group: 'AI & Cloud IDEs',
    mode: 'proxy',
    defaultLabel: 'cs-preview',
    defaultOrigin: 'studious-space-xxxx-3000.app.github.dev',
    originHint: 'Your public Codespaces forwarded port hostname',
    recommendation: 'Set your Codespaces forwarded port visibility to Public, then run `agentdomains proxy` so teammates and webhook providers hit `https://cs-preview.makes.fyi` instead of a 50-character `.app.github.dev` string.',
    serverSnippet: `# Make port 3000 public from inside your Codespace terminal:
gh codespace ports visibility 3000:public -c "$CODESPACE_NAME"`,
    notes: [
      'Private Codespaces ports redirect to GitHub OAuth login — webhooks require setting port visibility to `public`.',
      'When you stop the Codespace, keep the `cs-preview.makes.fyi` name and point it to your next Codespace or staging server later.',
    ],
  },
  {
    slug: 'tailscale-node',
    name: 'Tailscale Node (Funnel)',
    group: 'Homelab & Self-Hosted',
    mode: 'proxy',
    defaultLabel: 'ts-node',
    defaultOrigin: 'mybox.tail9a2f1.ts.net',
    originHint: 'Your Tailscale Funnel *.ts.net hostname',
    recommendation: 'Enable `tailscale funnel 3000`, then run `agentdomains proxy ts-node mybox.tail9a2f1.ts.net`. You get Tailscale’s NAT traversal PLUS a clean memorable `makes.fyi` hostname!',
    serverSnippet: `# Expose local port 3000 via Tailscale Funnel:
tailscale funnel --bg 3000
# Then put AgentDomains in front of your *.ts.net hostname:
agentdomains proxy ts-node mybox.tail9a2f1.ts.net`,
    notes: [
      'This combo solves CGNAT without opening a single home router port while hiding your tailnet name from public links.',
      'Tailscale Funnel handles HTTPS on port 443 natively, so the AgentDomains edge connects to your Funnel over TLS end-to-end.',
    ],
  },
  {
    slug: 'proxmox-homelab',
    name: 'Proxmox VE Homelab',
    group: 'Homelab & Self-Hosted',
    mode: 'record',
    defaultLabel: 'proxmox-lab',
    defaultOrigin: '203.0.113.90',
    originHint: 'Your homelab WAN IPv4 (or reverse proxy VM IP)',
    recommendation: 'Point an A record (plus sub-labels like `git.proxmox-lab.makes.fyi` and `app.proxmox-lab.makes.fyi`) at your reverse-proxy LXC/VM running Caddy or Traefik, and use ACME DNS-01 if port 80 is closed.',
    serverSnippet: `# Route multiple Proxmox LXCs under one claimed name using --host:
agentdomains record proxmox-lab --type A --content 203.0.113.90
agentdomains record proxmox-lab --type A --host gitea --content 203.0.113.90
agentdomains record proxmox-lab --type A --host grafana --content 203.0.113.90`,
    notes: [
      'Never expose the Proxmox `:8006` management UI directly to the open internet — keep management on WireGuard/Tailscale and only publish app containers.',
      'Use `agentdomains txt proxmox-lab <token>` for ACME DNS-01 certificates inside private VLANs.',
    ],
  },
  {
    slug: 'synology-nas',
    name: 'Synology NAS (DSM)',
    group: 'Homelab & Self-Hosted',
    mode: 'record',
    defaultLabel: 'nas-box',
    defaultOrigin: '203.0.113.91',
    originHint: 'Your home WAN IPv4',
    recommendation: 'Create an A record pointing to your home IP, add a Synology Task Scheduler curl/CLI job for dynamic IP updates, and configure DSM’s built-in Reverse Proxy (Control Panel → Login Portal → Advanced).',
    serverSnippet: `# Synology Task Scheduler DDNS script (runs every 15 minutes):
IP=$(curl -s https://api.ipify.org)
curl -s -X POST "https://api.agentdomains.co/v1/subdomains/nas-box/records" \\
  -H "Authorization: Bearer $AGENTDOMAINS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d "{\\"type\\":\\"A\\",\\"content\\":\\"$IP\\"}"`,
    notes: [
      'For ISP connections blocking port 80, issue Let’s Encrypt certs via `acme.sh` DNS-01 or run Tailscale Funnel behind `agentdomains proxy`.',
      'Always enable DSM 2FA and Auto Block before exposing any NAS web app.',
    ],
  },
  {
    slug: 'localhost-staging',
    name: 'Localhost Staging & Tunnel Fronting',
    group: 'Local Dev',
    mode: 'proxy',
    defaultLabel: 'local-dev',
    defaultOrigin: 'random-words.trycloudflare.com',
    originHint: 'Your Cloudflare Quick Tunnel / Tailscale Funnel / ngrok host',
    recommendation: 'AgentDomains does not terminate NAT tunnels itself — pair a free `cloudflared tunnel --url http://localhost:3000` (or Tailscale Funnel) with `agentdomains proxy` so your localhost staging URL NEVER changes!',
    serverSnippet: `# Terminal 1: start a free zero-account Cloudflare Quick Tunnel
cloudflared tunnel --url http://localhost:3000
# Terminal 2: point your stable AgentDomains hostname at the generated *.trycloudflare.com host
agentdomains proxy local-dev random-words.trycloudflare.com`,
    notes: [
      'Whenever you restart `cloudflared` and get a new random hostname, one `agentdomains proxy local-dev <new-host>` call keeps `https://local-dev.makes.fyi` unchanged for OAuth and webhooks.',
      'Zero interstitial warning page, valid HTTPS, and 100% free during the 30-day trial.',
    ],
  },
];
