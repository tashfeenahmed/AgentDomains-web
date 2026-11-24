// Cluster 1: 25 MCP Client Setup Guides
export const MCP_CLIENTS = [
  {
    slug: 'claude-code',
    name: 'Claude Code',
    category: 'CLI Coding Agent',
    transport: 'Streamable HTTP & stdio',
    configPath: '~/.claude.json (user) or .mcp.json (project root)',
    cliCommand: 'claude mcp add --transport http agentdomains https://mcp.agentdomains.co --header "Authorization: Bearer adom_YOUR_KEY"',
    httpConfig: JSON.stringify({
      mcpServers: {
        agentdomains: {
          type: 'http',
          url: 'https://mcp.agentdomains.co',
          headers: { Authorization: 'Bearer adom_YOUR_KEY' },
        },
      },
    }, null, 2),
    stdioConfig: JSON.stringify({
      mcpServers: {
        agentdomains: {
          command: 'npx',
          args: ['-y', 'agentdomains-mcp'],
          env: { AGENTDOMAINS_API_KEY: 'adom_YOUR_KEY' },
        },
      },
    }, null, 2),
    firstPrompt: 'Check if demo-bot is free on makes.fyi, claim it with email dev@example.com, and proxy it to demo-bot.fly.dev.',
    gotchas: [
      'Use --scope project if you want .mcp.json committed to the repo — keep the API key in an environment variable or connect without a key and call signup first.',
      'Run /mcp inside a live Claude Code session to verify that all 20 AgentDomains tools loaded without restarting the terminal.',
      'Project-level .mcp.json requires one-time approval on first load in Claude Code.',
    ],
    related: ['cursor', 'codex-cli', 'cline', 'opencode'],
    summary: 'Connect Claude Code to AgentDomains via Streamable HTTP or npx stdio so Claude can claim hostnames, set DNS records, and wire HTTPS reverse proxies straight from your terminal.',
  },
  {
    slug: 'cursor',
    name: 'Cursor',
    category: 'AI Code Editor',
    transport: 'Streamable HTTP & stdio',
    configPath: '~/.cursor/mcp.json (global) or .cursor/mcp.json (workspace)',
    deeplink: {
      label: '1-Click Install in Cursor',
      href: 'cursor://anysphere.cursor-deeplink/mcp/install?name=agentdomains&config=eyJ1cmwiOiJodHRwczovL21jcC5hZ2VudGRvbWFpbnMuY28iLCJoZWFkZXJzIjp7IkF1dGhvcml6YXRpb24iOiJCZWFyZXIgYWRvbV9ZT1VSX0tFWSJ9fQ==',
    },
    httpConfig: JSON.stringify({
      mcpServers: {
        agentdomains: {
          url: 'https://mcp.agentdomains.co',
          headers: { Authorization: 'Bearer adom_YOUR_KEY' },
        },
      },
    }, null, 2),
    stdioConfig: JSON.stringify({
      mcpServers: {
        agentdomains: {
          command: 'npx',
          args: ['-y', 'agentdomains-mcp'],
          env: { AGENTDOMAINS_API_KEY: 'adom_YOUR_KEY' },
        },
      },
    }, null, 2),
    firstPrompt: 'Use agentdomains to check availability of invoice-api on agentdomains.co, claim it, and point an HTTPS proxy at my Railway service invoice-api.up.railway.app.',
    gotchas: [
      'After saving .cursor/mcp.json, open Settings → Tools & MCP and click the refresh icon so Cursor fetches the 20 tool schemas.',
      'Cursor Agent Mode (not Ask Mode) is required for tool execution; enable auto-run carefully because delete_domain and set_proxy are marked destructive.',
      'Never commit your live adom_ key in workspace .cursor/mcp.json — use ~/.cursor/mcp.json for personal keys.',
    ],
    related: ['vscode', 'windsurf', 'claude-code', 'cline'],
    summary: 'Add AgentDomains to Cursor via one-click deeplink, Streamable HTTP, or npx stdio so Composer and Agent Mode can claim domains and configure edge HTTPS proxies.',
  },
  {
    slug: 'vscode',
    name: 'VS Code (GitHub Copilot)',
    category: 'Code Editor',
    transport: 'Streamable HTTP & stdio',
    configPath: '.vscode/mcp.json (workspace) or VS Code User settings.json',
    deeplink: {
      label: '1-Click Install in VS Code',
      href: 'vscode:mcp/install?%7B%22name%22%3A%22agentdomains%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fmcp.agentdomains.co%22%7D',
    },
    httpConfig: JSON.stringify({
      inputs: [
        {
          id: 'agentdomains_api_key',
          type: 'promptString',
          description: 'AgentDomains API key (adom_...)',
          password: true,
        },
      ],
      servers: {
        agentdomains: {
          type: 'http',
          url: 'https://mcp.agentdomains.co',
          headers: {
            Authorization: 'Bearer ${input:agentdomains_api_key}',
          },
        },
      },
    }, null, 2),
    stdioConfig: JSON.stringify({
      servers: {
        agentdomains: {
          type: 'stdio',
          command: 'npx',
          args: ['-y', 'agentdomains-mcp'],
          env: { AGENTDOMAINS_API_KEY: '${input:agentdomains_api_key}' },
        },
      },
    }, null, 2),
    firstPrompt: 'Check if webhook-dev is available on makes.fyi, claim it, and add an A record pointing at 203.0.113.10.',
    gotchas: [
      'VS Code uses the top-level "servers" key in .vscode/mcp.json — NOT "mcpServers" (which Cursor and Claude Desktop use).',
      'Use VS Code promptString inputs so teammates can share .vscode/mcp.json safely without hardcoding API keys.',
      'Switch Copilot Chat to Agent mode and click the tools icon to confirm agentdomains tools are toggled on.',
    ],
    related: ['cursor', 'cline', 'roo-code', 'continue'],
    summary: 'Configure AgentDomains in VS Code Copilot Agent Mode using .vscode/mcp.json with secure promptString inputs and Streamable HTTP or stdio transport.',
  },
  {
    slug: 'windsurf',
    name: 'Windsurf (Cascade)',
    category: 'AI Code Editor',
    transport: 'Streamable HTTP & stdio',
    configPath: '~/.codeium/windsurf/mcp_config.json',
    httpConfig: JSON.stringify({
      mcpServers: {
        agentdomains: {
          serverUrl: 'https://mcp.agentdomains.co',
          headers: { Authorization: 'Bearer adom_YOUR_KEY' },
        },
      },
    }, null, 2),
    stdioConfig: JSON.stringify({
      mcpServers: {
        agentdomains: {
          command: 'npx',
          args: ['-y', 'agentdomains-mcp'],
          env: { AGENTDOMAINS_API_KEY: 'adom_YOUR_KEY' },
        },
      },
    }, null, 2),
    firstPrompt: 'Claim preview-ui on makes.fyi and set up a 302 forward to https://preview-ui.onrender.com.',
    gotchas: [
      'Windsurf remote HTTP entries use "serverUrl" rather than "url" in ~/.codeium/windsurf/mcp_config.json.',
      'Open the Cascade MCP toolbar and click Refresh after editing mcp_config.json; Windsurf caches the tool catalog per window.',
      'Keep total enabled MCP tools across all servers under Windsurf’s active tool cap by disabling unused servers.',
    ],
    related: ['cursor', 'vscode', 'claude-code', 'zed'],
    summary: 'Wire AgentDomains into Windsurf Cascade with serverUrl Streamable HTTP or npx stdio so Cascade can claim subdomains and publish live HTTPS previews.',
  },
  {
    slug: 'claude-desktop',
    name: 'Claude Desktop',
    category: 'Desktop AI App',
    transport: 'stdio & Remote Connector',
    configPath: 'macOS: ~/Library/Application Support/Claude/claude_desktop_config.json | Windows: %APPDATA%\\Claude\\claude_desktop_config.json',
    httpConfig: JSON.stringify({
      mcpServers: {
        agentdomains: {
          command: 'npx',
          args: [
            '-y',
            'mcp-remote',
            'https://mcp.agentdomains.co',
            '--header',
            'Authorization: Bearer adom_YOUR_KEY',
          ],
        },
      },
    }, null, 2),
    stdioConfig: JSON.stringify({
      mcpServers: {
        agentdomains: {
          command: 'npx',
          args: ['-y', 'agentdomains-mcp'],
          env: { AGENTDOMAINS_API_KEY: 'adom_YOUR_KEY' },
        },
      },
    }, null, 2),
    firstPrompt: 'List my current AgentDomains subdomains and check if notes-bot is available on agentdomains.co.',
    gotchas: [
      'Claude Desktop reads claude_desktop_config.json only on startup — fully quit (Cmd+Q) and relaunch after saving.',
      'On macOS, GUI apps may not inherit Homebrew/nvm PATH; pass the absolute path to npx (e.g. /opt/homebrew/bin/npx) if the server fails to spawn.',
      'If you have ~/.agentdomains/config.json from the Go CLI, agentdomains-mcp picks up your key automatically without setting env.',
    ],
    related: ['claude-code', 'cursor', 'goose', 'zed'],
    summary: 'Install AgentDomains in Claude Desktop via native stdio (npx agentdomains-mcp) or mcp-remote bridge to manage DNS records, redirects, and HTTPS proxies in chat.',
  },
  {
    slug: 'openai-agents-sdk',
    name: 'OpenAI Agents SDK',
    category: 'Python / TS Agent Framework',
    transport: 'Streamable HTTP & stdio',
    configPath: 'Python: agents.mcp.MCPServerStreamableHttp / MCPServerStdio',
    httpConfig: `from agents import Agent, Runner
from agents.mcp import MCPServerStreamableHttp

async with MCPServerStreamableHttp(
    name="agentdomains",
    params={
        "url": "https://mcp.agentdomains.co",
        "headers": {"Authorization": "Bearer adom_YOUR_KEY"},
    },
) as mcp:
    agent = Agent(
        name="DeployAgent",
        instructions="Claim hostnames and wire proxies via AgentDomains.",
        mcp_servers=[mcp],
    )
    result = await Runner.run(agent, "Check if billing-demo is free on makes.fyi")`,
    stdioConfig: `from agents.mcp import MCPServerStdio

async with MCPServerStdio(
    name="agentdomains",
    params={
        "command": "npx",
        "args": ["-y", "agentdomains-mcp"],
        "env": {"AGENTDOMAINS_API_KEY": "adom_YOUR_KEY"},
    },
) as mcp:
    ...`,
    firstPrompt: 'Check if billing-demo is free on makes.fyi, claim it, and set_proxy to billing-demo.fly.dev.',
    gotchas: [
      'Always use MCPServerStreamableHttp (not MCPServerSse) — mcp.agentdomains.co is stateless Streamable HTTP and returns 405 on GET SSE streams.',
      'Pass cache_tools_list=True on long-running worker processes so every agent turn does not re-fetch tools/list.',
      'Read AGENTDOMAINS_API_KEY from os.environ rather than embedding it in agent source code.',
    ],
    related: ['pydantic-ai', 'langchain', 'crewai', 'vercel-ai-sdk'],
    summary: 'Connect OpenAI Agents SDK to AgentDomains with MCPServerStreamableHttp or MCPServerStdio to let autonomous Python and TypeScript agents register domains and configure DNS.',
  },
  {
    slug: 'langchain',
    name: 'LangChain',
    category: 'Agent Framework',
    transport: 'Streamable HTTP & stdio',
    configPath: 'Python: langchain-mcp-adapters (MultiServerMCPClient)',
    httpConfig: `from langchain_mcp_adapters.client import MultiServerMCPClient

client = MultiServerMCPClient({
    "agentdomains": {
        "transport": "streamable_http",
        "url": "https://mcp.agentdomains.co",
        "headers": {"Authorization": "Bearer adom_YOUR_KEY"},
    }
})
tools = await client.get_tools()`,
    stdioConfig: `from langchain_mcp_adapters.client import MultiServerMCPClient

client = MultiServerMCPClient({
    "agentdomains": {
        "transport": "stdio",
        "command": "npx",
        "args": ["-y", "agentdomains-mcp"],
        "env": {"AGENTDOMAINS_API_KEY": "adom_YOUR_KEY"},
    }
})
tools = await client.get_tools()`,
    firstPrompt: 'Use check_availability for rag-demo on makes.fyi, then claim_domain and add_dns_record type A 203.0.113.25.',
    gotchas: [
      'Install langchain-mcp-adapters >= 0.1.7 to get first-class streamable_http transport support.',
      'In LangGraph workflows, wrap destructive tools (delete_domain, delete_account) with an interrupt_before human approval node.',
      'Filter client.get_tools() if your graph only needs check_availability, claim_domain, and set_proxy to save prompt tokens.',
    ],
    related: ['llamaindex', 'crewai', 'openai-agents-sdk', 'pydantic-ai'],
    summary: 'Load AgentDomains MCP tools into LangChain and LangGraph using MultiServerMCPClient over stateless Streamable HTTP or local stdio.',
  },
  {
    slug: 'crewai',
    name: 'CrewAI',
    category: 'Multi-Agent Framework',
    transport: 'Streamable HTTP & stdio',
    configPath: 'Python: crewai_tools.MCPServerAdapter',
    httpConfig: `from crewai import Agent
from crewai_tools import MCPServerAdapter

server_params = {
    "url": "https://mcp.agentdomains.co",
    "transport": "streamable-http",
    "headers": {"Authorization": "Bearer adom_YOUR_KEY"},
}

with MCPServerAdapter(server_params) as tools:
    devops_agent = Agent(
        role="Release Engineer",
        goal="Publish every build on a live HTTPS hostname",
        backstory="Automates DNS and edge TLS for agent deployments.",
        tools=tools,
    )`,
    stdioConfig: `from mcp import StdioServerParameters
from crewai_tools import MCPServerAdapter

params = StdioServerParameters(
    command="npx",
    args=["-y", "agentdomains-mcp"],
    env={"AGENTDOMAINS_API_KEY": "adom_YOUR_KEY"},
)
with MCPServerAdapter(params) as tools:
    ...`,
    firstPrompt: 'Assign our release agent to claim crew-demo.makes.fyi and proxy it to crew-demo.onrender.com.',
    gotchas: [
      'Use "streamable-http" (hyphenated) in CrewAI MCPServerAdapter server_params.',
      'Keep the MCPServerAdapter context manager open for the entire crew.kickoff() call so tool connections stay alive.',
      'Give only the deployment agent write tools; read-only agents only need check_availability and get_domain.',
    ],
    related: ['autogen', 'langchain', 'openai-agents-sdk', 'mastra'],
    summary: 'Equip CrewAI multi-agent crews with AgentDomains DNS, HTTPS proxy, and ACME DNS-01 tools via MCPServerAdapter.',
  },
  {
    slug: 'cline',
    name: 'Cline',
    category: 'VS Code Autonomous Agent',
    transport: 'Streamable HTTP & stdio',
    configPath: 'Cline MCP Servers panel → Configure MCP Servers (cline_mcp_settings.json)',
    httpConfig: JSON.stringify({
      mcpServers: {
        agentdomains: {
          url: 'https://mcp.agentdomains.co',
          type: 'streamableHttp',
          headers: { Authorization: 'Bearer adom_YOUR_KEY' },
          autoApprove: ['check_availability', 'list_domains', 'get_domain', 'whoami'],
        },
      },
    }, null, 2),
    stdioConfig: JSON.stringify({
      mcpServers: {
        agentdomains: {
          command: 'npx',
          args: ['-y', 'agentdomains-mcp'],
          env: { AGENTDOMAINS_API_KEY: 'adom_YOUR_KEY' },
          autoApprove: ['check_availability', 'list_domains', 'get_domain'],
        },
      },
    }, null, 2),
    firstPrompt: 'Deploy this FastAPI service and claim a makes.fyi hostname for it using AgentDomains.',
    gotchas: [
      'Only add read-only tools (check_availability, list_domains, get_domain) to autoApprove; keep delete_domain manual.',
      'Cline distinguishes "streamableHttp" from legacy "sse" — pick streamableHttp for mcp.agentdomains.co.',
      'If Cline shows a red dot, test connectivity at /tools/mcp-config-builder to verify your Bearer header.',
    ],
    related: ['roo-code', 'vscode', 'cursor', 'claude-code'],
    summary: 'Add AgentDomains to Cline in VS Code with granular autoApprove rules so Cline can claim hostnames and configure DNS safely.',
  },
  {
    slug: 'zed',
    name: 'Zed Editor',
    category: 'Native Code Editor',
    transport: 'stdio (native) & HTTP bridge',
    configPath: '~/.config/zed/settings.json (context_servers)',
    httpConfig: JSON.stringify({
      context_servers: {
        agentdomains: {
          command: {
            path: 'npx',
            args: [
              '-y',
              'mcp-remote',
              'https://mcp.agentdomains.co',
              '--header',
              'Authorization: Bearer adom_YOUR_KEY',
            ],
            env: {},
          },
        },
      },
    }, null, 2),
    stdioConfig: JSON.stringify({
      context_servers: {
        agentdomains: {
          command: {
            path: 'npx',
            args: ['-y', 'agentdomains-mcp'],
            env: { AGENTDOMAINS_API_KEY: 'adom_YOUR_KEY' },
          },
        },
      },
    }, null, 2),
    firstPrompt: 'Check if zed-preview is free on agentdomains.co, claim it, and point an A record to my Hetzner VPS.',
    gotchas: [
      'Zed calls MCP servers "context_servers" inside ~/.config/zed/settings.json.',
      'In Zed Agent Panel, make sure the active profile (e.g. Write) has the agentdomains context server enabled.',
      'If Zed cannot find npx on macOS, supply the full binary path under command.path.',
    ],
    related: ['cursor', 'claude-code', 'opencode', 'windsurf'],
    summary: 'Register AgentDomains as a Zed context_server in settings.json so Zed’s Agent Panel can claim domains, set DNS records, and proxy backends.',
  },
  {
    slug: 'codex-cli',
    name: 'OpenAI Codex CLI',
    category: 'CLI Coding Agent',
    transport: 'Streamable HTTP & stdio',
    configPath: '~/.codex/config.toml',
    cliCommand: 'codex mcp add agentdomains --url https://mcp.agentdomains.co',
    httpConfig: `[mcp_servers.agentdomains]
url = "https://mcp.agentdomains.co"
bearer_token_env_var = "AGENTDOMAINS_API_KEY"`,
    stdioConfig: `[mcp_servers.agentdomains]
command = "npx"
args = ["-y", "agentdomains-mcp"]
env = { AGENTDOMAINS_API_KEY = "adom_YOUR_KEY" }`,
    firstPrompt: 'Check availability of codex-demo on makes.fyi, claim it, and set_proxy to codex-demo.fly.dev.',
    gotchas: [
      'Codex CLI uses TOML (~/.codex/config.toml), not JSON — use bearer_token_env_var so secrets stay in your shell environment.',
      'Export AGENTDOMAINS_API_KEY in your shell before running codex so bearer_token_env_var resolves cleanly.',
      'In sandboxed approval modes, Codex will prompt before invoking outbound network MCP tools unless configured otherwise.',
    ],
    related: ['claude-code', 'opencode', 'goose', 'aider'],
    summary: 'Configure AgentDomains in OpenAI Codex CLI via ~/.codex/config.toml with bearer_token_env_var or stdio npx agentdomains-mcp.',
  },
  {
    slug: 'goose',
    name: 'Goose (Block)',
    category: 'Open-Source CLI & Desktop Agent',
    transport: 'Streamable HTTP & stdio',
    configPath: '~/.config/goose/config.yaml (extensions)',
    cliCommand: 'goose configure',
    httpConfig: `extensions:
  agentdomains:
    name: AgentDomains
    type: streamable_http
    uri: https://mcp.agentdomains.co
    headers:
      Authorization: "Bearer adom_YOUR_KEY"
    enabled: true
    timeout: 60`,
    stdioConfig: `extensions:
  agentdomains:
    name: AgentDomains
    type: stdio
    cmd: npx
    args: ["-y", "agentdomains-mcp"]
    envs:
      AGENTDOMAINS_API_KEY: "adom_YOUR_KEY"
    enabled: true`,
    firstPrompt: 'Claim goose-api on makes.fyi and publish an ACME DNS-01 TXT challenge token for it.',
    gotchas: [
      'Goose models MCP servers as "extensions" in ~/.config/goose/config.yaml.',
      'Set timeout: 60 so first-time npx package downloads do not time out in stdio mode.',
      'Use goose configure for an interactive wizard that stores your API key in the OS keychain.',
    ],
    related: ['claude-code', 'codex-cli', 'opencode', 'claude-desktop'],
    summary: 'Add AgentDomains as a Goose extension using streamable_http or stdio so Goose recipes can claim hostnames and automate DNS.',
  },
  {
    slug: 'n8n',
    name: 'n8n',
    category: 'Workflow Automation',
    transport: 'Streamable HTTP (MCP Client Tool Node)',
    configPath: 'n8n AI Agent → MCP Client Tool node',
    httpConfig: `Node: MCP Client Tool
Server Transport: HTTP Streamable
Endpoint URL: https://mcp.agentdomains.co
Authentication: Header Auth
Header Name: Authorization
Header Value: Bearer adom_YOUR_KEY`,
    stdioConfig: `For self-hosted n8n community MCP stdio node:
Command: npx
Arguments: -y agentdomains-mcp
Environment: AGENTDOMAINS_API_KEY=adom_YOUR_KEY`,
    firstPrompt: 'When a new client onboarding form arrives, claim <slug>.makes.fyi and forward it to their preview URL.',
    gotchas: [
      'Select "HTTP Streamable" (not SSE) in the n8n MCP Client Tool node — mcp.agentdomains.co rejects GET SSE streams with 405.',
      'Store your Bearer token inside an n8n Header Auth credential so it is encrypted at rest and never exposed in workflow JSON exports.',
      'You can also pair n8n with AgentDomains to give your self-hosted n8n instance an HTTPS webhook domain (see /use-cases/n8n-webhook-endpoints).',
    ],
    related: ['dify', 'langchain', 'crewai', 'mastra'],
    summary: 'Connect n8n’s MCP Client Tool node to mcp.agentdomains.co over HTTP Streamable to provision domains and HTTPS proxies inside automated workflows.',
  },
  {
    slug: 'dify',
    name: 'Dify',
    category: 'LLM App & Workflow Platform',
    transport: 'Streamable HTTP',
    configPath: 'Dify Studio → Tools → MCP → Add MCP Server (HTTP)',
    httpConfig: JSON.stringify({
      name: 'AgentDomains',
      server_url: 'https://mcp.agentdomains.co',
      transport: 'streamable_http',
      headers: { Authorization: 'Bearer adom_YOUR_KEY' },
    }, null, 2),
    stdioConfig: `# Dify Cloud connects over HTTP; for local stdio bridges, run mcp-proxy or connect directly to https://mcp.agentdomains.co`,
    firstPrompt: 'In a Dify Agent node, check availability of a user-requested slug and claim it with a reverse proxy.',
    gotchas: [
      'Dify Cloud requires a public HTTPS MCP endpoint — use https://mcp.agentdomains.co directly rather than local stdio.',
      'After adding the MCP server in Dify Studio, click Authorize/Sync to inspect all 20 tool definitions.',
      'Avoid enabling delete_account on public-facing Dify chatbots; scope enabled tools to check_availability and set_proxy.',
    ],
    related: ['n8n', 'langchain', 'crewai', 'vercel-ai-sdk'],
    summary: 'Register https://mcp.agentdomains.co inside Dify Studio to expose AgentDomains DNS and reverse-proxy tools to Dify Agent workflows.',
  },
  {
    slug: 'autogen',
    name: 'Microsoft AutoGen',
    category: 'Multi-Agent Framework',
    transport: 'Streamable HTTP & stdio',
    configPath: 'Python: autogen_ext.tools.mcp (StreamableHttpServerParams / StdioServerParams)',
    httpConfig: `from autogen_ext.tools.mcp import StreamableHttpServerParams, mcp_server_tools

params = StreamableHttpServerParams(
    url="https://mcp.agentdomains.co",
    headers={"Authorization": "Bearer adom_YOUR_KEY"},
)
tools = await mcp_server_tools(params)`,
    stdioConfig: `from autogen_ext.tools.mcp import StdioServerParams, mcp_server_tools

params = StdioServerParams(
    command="npx",
    args=["-y", "agentdomains-mcp"],
    env={"AGENTDOMAINS_API_KEY": "adom_YOUR_KEY"},
)
tools = await mcp_server_tools(params)`,
    firstPrompt: 'Have the InfraAgent verify availability of autogen-app.makes.fyi and configure an A record.',
    gotchas: [
      'Install autogen-ext[mcp] alongside autogen-agentchat >= 0.4 for StreamableHttpServerParams.',
      'Pass tools into AssistantAgent(..., tools=tools, reflect_on_tool_use=True) so the agent explains the live FQDN returned by claim_domain.',
      'Use a UserProxyAgent approval gate before letting autonomous teams call delete_domain.',
    ],
    related: ['crewai', 'langchain', 'openai-agents-sdk', 'pydantic-ai'],
    summary: 'Load AgentDomains into Microsoft AutoGen 0.4+ via autogen_ext.tools.mcp StreamableHttpServerParams or StdioServerParams.',
  },
  {
    slug: 'roo-code',
    name: 'Roo Code',
    category: 'VS Code Coding Agent',
    transport: 'Streamable HTTP & stdio',
    configPath: 'Roo Code → MCP Servers → Edit Global/Project MCP (mcp_settings.json)',
    httpConfig: JSON.stringify({
      mcpServers: {
        agentdomains: {
          type: 'streamable-http',
          url: 'https://mcp.agentdomains.co',
          headers: { Authorization: 'Bearer adom_YOUR_KEY' },
          alwaysAllow: ['check_availability', 'list_domains', 'get_domain'],
        },
      },
    }, null, 2),
    stdioConfig: JSON.stringify({
      mcpServers: {
        agentdomains: {
          command: 'npx',
          args: ['-y', 'agentdomains-mcp'],
          env: { AGENTDOMAINS_API_KEY: 'adom_YOUR_KEY' },
          alwaysAllow: ['check_availability', 'list_domains'],
        },
      },
    }, null, 2),
    firstPrompt: 'Switch to Orchestrator mode, build the landing page, and claim roo-demo.makes.fyi with set_proxy.',
    gotchas: [
      'Roo Code uses "alwaysAllow" (unlike Cline’s "autoApprove") for tool allowlists.',
      'Project-level .roo/mcp.json overrides global settings for the same server name — keep keys out of Git.',
      'If you use Custom Modes, verify that the mode has the "mcp" tool group enabled.',
    ],
    related: ['cline', 'vscode', 'cursor', 'continue'],
    summary: 'Set up AgentDomains in Roo Code using streamable-http or stdio with per-tool alwaysAllow safety controls.',
  },
  {
    slug: 'continue',
    name: 'Continue.dev',
    category: 'Open-Source IDE Agent',
    transport: 'Streamable HTTP & stdio',
    configPath: '.continue/mcpServers/agentdomains.yaml (or ~/.continue/config.yaml)',
    httpConfig: `name: AgentDomains
version: 0.0.1
schema: v1
mcpServers:
  - name: agentdomains
    type: streamable-http
    url: https://mcp.agentdomains.co
    requestOptions:
      headers:
        Authorization: Bearer \${{ secrets.AGENTDOMAINS_API_KEY }}`,
    stdioConfig: `name: AgentDomains
version: 0.0.1
schema: v1
mcpServers:
  - name: agentdomains
    command: npx
    args:
      - -y
      - agentdomains-mcp
    env:
      AGENTDOMAINS_API_KEY: \${{ secrets.AGENTDOMAINS_API_KEY }}`,
    firstPrompt: 'Check if continue-preview is free on agentdomains.co and point it at our staging Railway URL.',
    gotchas: [
      'Continue v1 uses YAML blocks under .continue/mcpServers/*.yaml — legacy config.json is deprecated for new MCP servers.',
      'Switch Continue into Agent mode; Chat/Edit modes do not invoke MCP tools.',
      'Use ${{ secrets.AGENTDOMAINS_API_KEY }} so the YAML file can be shared cleanly across repositories.',
    ],
    related: ['vscode', 'cline', 'roo-code', 'cursor'],
    summary: 'Add AgentDomains to Continue.dev in VS Code or JetBrains using a clean YAML MCP server block with Streamable HTTP or stdio.',
  },
  {
    slug: 'aider',
    name: 'Aider',
    category: 'Terminal Pair Programmer',
    transport: 'CLI + MCP Bridge',
    configPath: 'CLI tool execution (/run agentdomains …) or aider-mcp-client bridge',
    cliCommand: 'export AGENTDOMAINS_API_KEY=adom_YOUR_KEY && agentdomains claim my-aider-app --email you@example.com',
    httpConfig: `# Aider shines with the AgentDomains Go CLI directly via /run, or via an MCP bridge:
{
  "mcpServers": {
    "agentdomains": {
      "url": "https://mcp.agentdomains.co",
      "headers": { "Authorization": "Bearer adom_YOUR_KEY" }
    }
  }
}`,
    stdioConfig: `# Install the Go CLI so Aider can run --json commands natively with /run:
go install github.com/tashfeenahmed/AgentDomains/cmd/agentdomains@latest
agentdomains signup
agentdomains claim my-app --email you@example.com --json`,
    firstPrompt: 'After updating the Express server, run agentdomains proxy my-aider-app my-aider-app.fly.dev --json.',
    gotchas: [
      'Core Aider does not ship a built-in native MCP client — using the AgentDomains Go CLI with --json via /run is zero-overhead and rock solid.',
      'If you run Aider behind an MCP-enabled wrapper (like aider-mcp or Claude Code calling Aider), attach mcp.agentdomains.co at the orchestrator layer.',
      'Add .agentdomains/ to .gitignore so local config files are never auto-committed by Aider.',
    ],
    related: ['claude-code', 'codex-cli', 'opencode', 'goose'],
    summary: 'Pair Aider with AgentDomains using the JSON-native Go CLI via /run or an MCP orchestrator bridge to claim and proxy hostnames.',
  },
  {
    slug: 'opencode',
    name: 'OpenCode',
    category: 'Open-Source Terminal Agent',
    transport: 'Streamable HTTP & stdio',
    configPath: 'opencode.json (project) or ~/.config/opencode/opencode.json',
    httpConfig: JSON.stringify({
      $schema: 'https://opencode.ai/config.json',
      mcp: {
        agentdomains: {
          type: 'remote',
          url: 'https://mcp.agentdomains.co',
          headers: { Authorization: 'Bearer {env:AGENTDOMAINS_API_KEY}' },
          enabled: true,
        },
      },
    }, null, 2),
    stdioConfig: JSON.stringify({
      $schema: 'https://opencode.ai/config.json',
      mcp: {
        agentdomains: {
          type: 'local',
          command: ['npx', '-y', 'agentdomains-mcp'],
          environment: { AGENTDOMAINS_API_KEY: '{env:AGENTDOMAINS_API_KEY}' },
          enabled: true,
        },
      },
    }, null, 2),
    firstPrompt: 'Check if opencode-demo is available on makes.fyi, claim it, and set_proxy to opencode-demo.fly.dev.',
    gotchas: [
      'OpenCode uses type: "remote" for Streamable HTTP servers and type: "local" with a command array for stdio.',
      'Use {env:AGENTDOMAINS_API_KEY} interpolation so opencode.json stays secret-free.',
      'Run opencode mcp list to confirm agentdomains is connected and healthy.',
    ],
    related: ['claude-code', 'codex-cli', 'goose', 'zed'],
    summary: 'Connect OpenCode to AgentDomains using opencode.json remote Streamable HTTP or local stdio configuration with env interpolation.',
  },
  {
    slug: 'mastra',
    name: 'Mastra',
    category: 'TypeScript Agent Framework',
    transport: 'Streamable HTTP & stdio',
    configPath: 'TypeScript: @mastra/mcp (MCPClient)',
    httpConfig: `import { MCPClient } from "@mastra/mcp";

export const mcp = new MCPClient({
  servers: {
    agentdomains: {
      url: new URL("https://mcp.agentdomains.co"),
      requestInit: {
        headers: { Authorization: \`Bearer \${process.env.AGENTDOMAINS_API_KEY}\` },
      },
    },
  },
});

const tools = await mcp.getTools();`,
    stdioConfig: `import { MCPClient } from "@mastra/mcp";

export const mcp = new MCPClient({
  servers: {
    agentdomains: {
      command: "npx",
      args: ["-y", "agentdomains-mcp"],
      env: { AGENTDOMAINS_API_KEY: process.env.AGENTDOMAINS_API_KEY ?? "" },
    },
  },
});`,
    firstPrompt: 'Use the agentdomains_claim_domain tool to claim mastra-agent on agentdomains.co and proxy to our Cloud Run host.',
    gotchas: [
      'Mastra prefixes tool names with the server key (e.g. agentdomains_claim_domain), which prevents collisions across servers.',
      'Pass a URL instance (`new URL(...)`) to @mastra/mcp rather than a plain string.',
      'Close mcp.disconnect() in serverless or CLI scripts so stdio child processes do not linger.',
    ],
    related: ['vercel-ai-sdk', 'openai-agents-sdk', 'langchain', 'n8n'],
    summary: 'Integrate AgentDomains into Mastra TypeScript agents via @mastra/mcp over Streamable HTTP or local stdio.',
  },
  {
    slug: 'pydantic-ai',
    name: 'PydanticAI',
    category: 'Typed Python Agent Framework',
    transport: 'Streamable HTTP & stdio',
    configPath: 'Python: pydantic_ai.mcp (MCPServerStreamableHTTP / MCPServerStdio)',
    httpConfig: `from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStreamableHTTP

server = MCPServerStreamableHTTP(
    "https://mcp.agentdomains.co",
    headers={"Authorization": "Bearer adom_YOUR_KEY"},
)
agent = Agent("openai:gpt-4.1", toolsets=[server])

async with agent:
    res = await agent.run("Check if typed-api is free on makes.fyi")`,
    stdioConfig: `from pydantic_ai.mcp import MCPServerStdio

server = MCPServerStdio(
    "npx",
    args=["-y", "agentdomains-mcp"],
    env={"AGENTDOMAINS_API_KEY": "adom_YOUR_KEY"},
)`,
    firstPrompt: 'Verify typed-api is available on makes.fyi, claim it, and return the live FQDN in a structured Pydantic model.',
    gotchas: [
      'Use MCPServerStreamableHTTP (note uppercase HTTP in PydanticAI) instead of MCPServerHTTP/SSE.',
      'Always run inside `async with agent:` (or `async with server:`) so the MCP session initializes cleanly.',
      'Combine with PydanticAI output_type to enforce strict typed return values containing fqdn and trial_ends_at.',
    ],
    related: ['openai-agents-sdk', 'langchain', 'llamaindex', 'smolagents'],
    summary: 'Attach AgentDomains to PydanticAI via MCPServerStreamableHTTP so strongly typed Python agents can register and proxy subdomains.',
  },
  {
    slug: 'llamaindex',
    name: 'LlamaIndex',
    category: 'Data & RAG Agent Framework',
    transport: 'Streamable HTTP & stdio',
    configPath: 'Python: llama_index.tools.mcp (BasicMCPClient + McpToolSpec)',
    httpConfig: `from llama_index.tools.mcp import BasicMCPClient, McpToolSpec

client = BasicMCPClient(
    "https://mcp.agentdomains.co",
    headers={"Authorization": "Bearer adom_YOUR_KEY"},
)
tool_spec = McpToolSpec(client=client)
tools = await tool_spec.to_tool_list_async()`,
    stdioConfig: `from llama_index.tools.mcp import BasicMCPClient, McpToolSpec

client = BasicMCPClient("npx", args=["-y", "agentdomains-mcp"])
tool_spec = McpToolSpec(client=client)
tools = await tool_spec.to_tool_list_async()`,
    firstPrompt: 'Claim docs-rag on makes.fyi and proxy it to our FastAPI RAG endpoint on Railway.',
    gotchas: [
      'Install llama-index-tools-mcp >= 0.2 to ensure Streamable HTTP URL auto-detection works without SSE fallback errors.',
      'Pass allowed_tools=["check_availability","claim_domain","set_proxy"] into McpToolSpec to restrict write scope.',
      'Use to_tool_list_async() inside async FastAPI or workflow loops rather than the blocking sync helper.',
    ],
    related: ['langchain', 'haystack', 'pydantic-ai', 'openai-agents-sdk'],
    summary: 'Expose AgentDomains tools inside LlamaIndex agents and workflows with BasicMCPClient and McpToolSpec.',
  },
  {
    slug: 'vercel-ai-sdk',
    name: 'Vercel AI SDK',
    category: 'TypeScript AI Toolkit',
    transport: 'Streamable HTTP & stdio',
    configPath: 'TypeScript: ai (experimental_createMCPClient) + @modelcontextprotocol/sdk',
    httpConfig: `import { experimental_createMCPClient as createMCPClient, generateText } from "ai";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { openai } from "@ai-sdk/openai";

const mcpClient = await createMCPClient({
  transport: new StreamableHTTPClientTransport(
    new URL("https://mcp.agentdomains.co"),
    { requestInit: { headers: { Authorization: \`Bearer \${process.env.AGENTDOMAINS_API_KEY}\` } } }
  ),
});
const tools = await mcpClient.tools();
const result = await generateText({ model: openai("gpt-4.1"), tools, prompt: "Check if edge-demo is free on makes.fyi" });
await mcpClient.close();`,
    stdioConfig: `import { experimental_createMCPClient as createMCPClient } from "ai";
import { Experimental_StdioMCPTransport } from "ai/mcp-stdio";

const mcpClient = await createMCPClient({
  transport: new Experimental_StdioMCPTransport({
    command: "npx",
    args: ["-y", "agentdomains-mcp"],
    env: { AGENTDOMAINS_API_KEY: process.env.AGENTDOMAINS_API_KEY ?? "" },
  }),
});`,
    firstPrompt: 'Check availability of edge-demo on makes.fyi and set up an HTTPS forward to our preview deployment.',
    gotchas: [
      'On Vercel Serverless / Edge Functions, always use StreamableHTTPClientTransport — stdio subprocesses cannot spawn in edge runtimes.',
      'Call await mcpClient.close() inside a try/finally block or onFinish callback when streaming responses.',
      'Enable maxSteps >= 4 in streamText/generateText so the model can chain check_availability → claim_domain → set_proxy.',
    ],
    related: ['mastra', 'openai-agents-sdk', 'langchain', 'dify'],
    summary: 'Use StreamableHTTPClientTransport with Vercel AI SDK to give Next.js and Node.js AI agents live domain claiming and DNS automation.',
  },
  {
    slug: 'haystack',
    name: 'Haystack (deepset)',
    category: 'AI Pipeline Framework',
    transport: 'Streamable HTTP & stdio',
    configPath: 'Python: haystack_integrations.tools.mcp (MCPToolset)',
    httpConfig: `from haystack_integrations.tools.mcp import MCPToolset, StreamableHttpServerInfo
from haystack.utils import Secret

server_info = StreamableHttpServerInfo(
    url="https://mcp.agentdomains.co",
    token=Secret.from_env_var("AGENTDOMAINS_API_KEY"),
)
toolset = MCPToolset(server_info=server_info)`,
    stdioConfig: `from haystack_integrations.tools.mcp import MCPToolset, StdioServerInfo

server_info = StdioServerInfo(
    command="npx",
    args=["-y", "agentdomains-mcp"],
    env={"AGENTDOMAINS_API_KEY": "adom_YOUR_KEY"},
)
toolset = MCPToolset(server_info=server_info)`,
    firstPrompt: 'Publish a Haystack retrieval pipeline by claiming search-api.makes.fyi and proxying to our origin.',
    gotchas: [
      'Install mcp-haystack (`pip install mcp-haystack`) for StreamableHttpServerInfo and MCPToolset.',
      'Use Secret.from_env_var("AGENTDOMAINS_API_KEY") so Haystack serializes pipeline YAML safely without leaking tokens.',
      'Pass tool_names=["check_availability","claim_domain","set_proxy"] to MCPToolset when you only want a subset of tools.',
    ],
    related: ['llamaindex', 'langchain', 'pydantic-ai', 'smolagents'],
    summary: 'Attach AgentDomains to deepset Haystack pipelines via MCPToolset and StreamableHttpServerInfo.',
  },
  {
    slug: 'smolagents',
    name: 'Hugging Face smolagents',
    category: 'Lightweight Python Agent',
    transport: 'Streamable HTTP & stdio',
    configPath: 'Python: smolagents.MCPClient',
    httpConfig: `from smolagents import CodeAgent, MCPClient, InferenceClientModel

server_params = {
    "url": "https://mcp.agentdomains.co",
    "transport": "streamable-http",
    "headers": {"Authorization": "Bearer adom_YOUR_KEY"},
}

with MCPClient(server_params) as tools:
    agent = CodeAgent(tools=tools, model=InferenceClientModel())
    agent.run("Check if hf-demo is free on makes.fyi and claim it")`,
    stdioConfig: `from mcp import StdioServerParameters
from smolagents import MCPClient

params = StdioServerParameters(
    command="npx",
    args=["-y", "agentdomains-mcp"],
    env={"AGENTDOMAINS_API_KEY": "adom_YOUR_KEY"},
)
with MCPClient(params) as tools:
    ...`,
    firstPrompt: 'Check if hf-demo is available on makes.fyi, claim it, and forward it to our Hugging Face Space URL.',
    gotchas: [
      'Install `pip install "smolagents[mcp]"` so the MCPClient helper and mcp SDK are available.',
      'CodeAgent executes Python snippets that call tools directly — pass only non-destructive tools unless running in an approved session.',
      'Use transport="streamable-http" so smolagents talks cleanly to mcp.agentdomains.co.',
    ],
    related: ['pydantic-ai', 'openai-agents-sdk', 'crewai', 'haystack'],
    summary: 'Connect Hugging Face smolagents CodeAgent and ToolCallingAgent to AgentDomains over Streamable HTTP or stdio.',
  },
];
