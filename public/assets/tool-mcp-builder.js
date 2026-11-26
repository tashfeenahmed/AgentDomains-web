/* Tool 01: Universal MCP Config Builder & Live Streamable HTTP Handshake Tester */
(function(){
  const clientSel = document.getElementById('mb-client');
  const transportSel = document.getElementById('mb-transport');
  const presetSel = document.getElementById('mb-preset');
  const nameIn = document.getElementById('mb-name');
  const urlIn = document.getElementById('mb-url');
  const tokenIn = document.getElementById('mb-token');
  const pkgIn = document.getElementById('mb-pkg');
  const envIn = document.getElementById('mb-env');
  const outEl = document.getElementById('mb-out');
  const outLabel = document.getElementById('mb-out-label');
  const pathHint = document.getElementById('mb-path-hint');
  const deepLinksEl = document.getElementById('mcp-deeplinks');
  const testBtn = document.getElementById('mb-test-init');
  const testStatus = document.getElementById('mb-test-status');
  const testOut = document.getElementById('mb-test-out');
  if (!clientSel) return;

  const PATHS = {
    'claude-code': 'Config path: ~/.claude.json or project .mcp.json (or use claude mcp add)',
    'cursor': 'Config path: ~/.cursor/mcp.json (global) or .cursor/mcp.json (workspace)',
    'vscode': 'Config path: .vscode/mcp.json (note top-level "servers" key)',
    'windsurf': 'Config path: ~/.codeium/windsurf/mcp_config.json (uses "serverUrl")',
    'claude-desktop': 'Config path: ~/Library/Application Support/Claude/claude_desktop_config.json',
    'codex-cli': 'Config path: ~/.codex/config.toml (TOML format)',
    'zed': 'Config path: ~/.config/zed/settings.json ("context_servers")',
    'goose': 'Config path: ~/.config/goose/config.yaml ("extensions")',
    'opencode': 'Config path: opencode.json or ~/.config/opencode/opencode.json',
    'openai-agents': 'Python SDK: pip install openai-agents',
    'langchain': 'Python SDK: pip install langchain-mcp-adapters',
    'vercel-ai': 'TypeScript SDK: npm i ai @modelcontextprotocol/sdk',
  };

  function b64(str){
    try { return btoa(unescape(encodeURIComponent(str))); } catch (e) { return btoa(str); }
  }

  function render(){
    const client = clientSel.value;
    const mode = transportSel.value;
    const key = (nameIn.value || 'agentdomains').trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'agentdomains';
    const url = (urlIn.value || 'https://mcp.agentdomains.co').trim();
    const tok = (tokenIn.value || '').trim();
    const authHeader = tok ? (tok.startsWith('Bearer ') ? tok : 'Bearer ' + tok) : 'Bearer adom_YOUR_KEY';
    const pkg = (pkgIn.value || 'agentdomains-mcp').trim();
    const envName = (envIn.value || 'AGENTDOMAINS_API_KEY').trim();
    const envVal = tok || 'adom_YOUR_KEY';

    pathHint.textContent = PATHS[client] || '';
    outLabel.textContent = `${client} (${mode === 'http' ? 'Streamable HTTP' : 'stdio'})`;

    let code = '';
    if (mode === 'http') {
      if (client === 'claude-code') {
        code = `# Option A: CLI\nclaude mcp add --transport http ${key} ${url} --header "Authorization: ${authHeader}"\n\n# Option B: .mcp.json\n` +
          JSON.stringify({ mcpServers: { [key]: { type: 'http', url, headers: { Authorization: authHeader } } } }, null, 2);
      } else if (client === 'cursor') {
        code = JSON.stringify({ mcpServers: { [key]: { url, headers: { Authorization: authHeader } } } }, null, 2);
      } else if (client === 'vscode') {
        code = JSON.stringify({ servers: { [key]: { type: 'http', url, headers: { Authorization: authHeader } } } }, null, 2);
      } else if (client === 'windsurf') {
        code = JSON.stringify({ mcpServers: { [key]: { serverUrl: url, headers: { Authorization: authHeader } } } }, null, 2);
      } else if (client === 'claude-desktop') {
        code = JSON.stringify({ mcpServers: { [key]: { command: 'npx', args: ['-y', 'mcp-remote', url, '--header', `Authorization: ${authHeader}`] } } }, null, 2);
      } else if (client === 'codex-cli') {
        code = `[mcp_servers.${key}]\nurl = "${url}"\nbearer_token_env_var = "${envName}"`;
      } else if (client === 'zed') {
        code = JSON.stringify({ context_servers: { [key]: { command: { path: 'npx', args: ['-y', 'mcp-remote', url, '--header', `Authorization: ${authHeader}`], env: {} } } } }, null, 2);
      } else if (client === 'goose') {
        code = `extensions:\n  ${key}:\n    name: ${key}\n    type: streamable_http\n    uri: ${url}\n    headers:\n      Authorization: "${authHeader}"\n    enabled: true`;
      } else if (client === 'opencode') {
        code = JSON.stringify({ mcp: { [key]: { type: 'remote', url, headers: { Authorization: authHeader }, enabled: true } } }, null, 2);
      } else if (client === 'openai-agents') {
        code = `from agents.mcp import MCPServerStreamableHttp\n\nasync with MCPServerStreamableHttp(\n    name="${key}",\n    params={"url": "${url}", "headers": {"Authorization": "${authHeader}"}},\n) as mcp:\n    ...`;
      } else if (client === 'langchain') {
        code = `from langchain_mcp_adapters.client import MultiServerMCPClient\n\nclient = MultiServerMCPClient({\n    "${key}": {\n        "transport": "streamable_http",\n        "url": "${url}",\n        "headers": {"Authorization": "${authHeader}"},\n    }\n})\ntools = await client.get_tools()`;
      } else if (client === 'vercel-ai') {
        code = `import { experimental_createMCPClient as createMCPClient } from "ai";\nimport { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";\n\nconst mcpClient = await createMCPClient({\n  transport: new StreamableHTTPClientTransport(new URL("${url}"), {\n    requestInit: { headers: { Authorization: "${authHeader}" } },\n  }),\n});\nconst tools = await mcpClient.tools();`;
      }
    } else {
      if (client === 'vscode') {
        code = JSON.stringify({ servers: { [key]: { type: 'stdio', command: 'npx', args: ['-y', pkg], env: { [envName]: envVal } } } }, null, 2);
      } else if (client === 'codex-cli') {
        code = `[mcp_servers.${key}]\ncommand = "npx"\nargs = ["-y", "${pkg}"]\nenv = { ${envName} = "${envVal}" }`;
      } else if (client === 'zed') {
        code = JSON.stringify({ context_servers: { [key]: { command: { path: 'npx', args: ['-y', pkg], env: { [envName]: envVal } } } } }, null, 2);
      } else if (client === 'goose') {
        code = `extensions:\n  ${key}:\n    name: ${key}\n    type: stdio\n    cmd: npx\n    args: ["-y", "${pkg}"]\n    envs:\n      ${envName}: "${envVal}"\n    enabled: true`;
      } else if (client === 'opencode') {
        code = JSON.stringify({ mcp: { [key]: { type: 'local', command: ['npx', '-y', pkg], environment: { [envName]: envVal }, enabled: true } } }, null, 2);
      } else if (client === 'openai-agents') {
        code = `from agents.mcp import MCPServerStdio\n\nasync with MCPServerStdio(\n    name="${key}",\n    params={"command": "npx", "args": ["-y", "${pkg}"], "env": {"${envName}": "${envVal}"}},\n) as mcp:\n    ...`;
      } else if (client === 'langchain') {
        code = `from langchain_mcp_adapters.client import MultiServerMCPClient\n\nclient = MultiServerMCPClient({\n    "${key}": {\n        "transport": "stdio",\n        "command": "npx",\n        "args": ["-y", "${pkg}"],\n        "env": {"${envName}": "${envVal}"},\n    }\n})\ntools = await client.get_tools()`;
      } else if (client === 'vercel-ai') {
        code = `import { experimental_createMCPClient as createMCPClient } from "ai";\nimport { Experimental_StdioMCPTransport } from "ai/mcp-stdio";\n\nconst mcpClient = await createMCPClient({\n  transport: new Experimental_StdioMCPTransport({\n    command: "npx",\n    args: ["-y", "${pkg}"],\n    env: { ${envName}: "${envVal}" },\n  }),\n});`;
      } else {
        code = JSON.stringify({ mcpServers: { [key]: { command: 'npx', args: ['-y', pkg], env: { [envName]: envVal } } } }, null, 2);
      }
    }

    outEl.textContent = code;

    // 1-click Cursor & VS Code deeplinks
    const cursorCfg = mode === 'http'
      ? { url, ...(tok ? { headers: { Authorization: authHeader } } : {}) }
      : { command: 'npx', args: ['-y', pkg], env: { [envName]: envVal } };
    const cursorLink = `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(key)}&config=${encodeURIComponent(b64(JSON.stringify(cursorCfg)))}`;

    const vscodeCfg = mode === 'http'
      ? { name: key, type: 'http', url }
      : { name: key, type: 'stdio', command: 'npx', args: ['-y', pkg] };
    const vscodeLink = `vscode:mcp/install?${encodeURIComponent(JSON.stringify(vscodeCfg))}`;

    deepLinksEl.innerHTML =
      `<a class="btn sm" href="${cursorLink}">Install in Cursor</a>` +
      `<a class="btn sm ghost" href="${vscodeLink}">Install in VS Code</a>`;
  }

  presetSel.addEventListener('change', () => {
    if (presetSel.value === 'agentdomains') {
      nameIn.value = 'agentdomains';
      urlIn.value = 'https://mcp.agentdomains.co';
      pkgIn.value = 'agentdomains-mcp';
      envIn.value = 'AGENTDOMAINS_API_KEY';
    } else {
      nameIn.value = 'my-mcp';
      urlIn.value = 'https://my-mcp.agentdomains.co';
      pkgIn.value = 'my-mcp-server';
      envIn.value = 'MCP_API_KEY';
    }
    render();
  });

  [clientSel, transportSel, nameIn, urlIn, tokenIn, pkgIn, envIn].forEach((el) => {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  // Live Streamable HTTP initialize + tools/list tester
  testBtn.addEventListener('click', async () => {
    const url = (urlIn.value || '').trim();
    const tok = (tokenIn.value || '').trim();
    if (!url) return;
    testBtn.disabled = true;
    testStatus.className = 'status-line status-dim';
    testStatus.textContent = `Connecting to ${url}…`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    };
    if (tok) headers['Authorization'] = tok.startsWith('Bearer ') ? tok : 'Bearer ' + tok;

    const t0 = performance.now();
    try {
      const initReq = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'agentdomains-mcp-builder', version: '1.0.0' },
        },
      };
      const r1 = await fetch(url, { method: 'POST', headers, body: JSON.stringify(initReq) });
      const initJson = await r1.json();
      const ms1 = Math.round(performance.now() - t0);

      const t1 = performance.now();
      const listReq = { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} };
      const r2 = await fetch(url, { method: 'POST', headers, body: JSON.stringify(listReq) });
      const listJson = await r2.json();
      const ms2 = Math.round(performance.now() - t1);

      const tools = (listJson && listJson.result && Array.isArray(listJson.result.tools)) ? listJson.result.tools : [];
      const srv = initJson && initJson.result && initJson.result.serverInfo
        ? `${initJson.result.serverInfo.name}@${initJson.result.serverInfo.version}`
        : 'MCP server';

      testStatus.className = 'status-line status-ok';
      testStatus.textContent = `HANDSHAKE OK (${r1.status}) — ${srv} responded in ${ms1}ms and advertised ${tools.length} tools (${ms2}ms).`;
      try { if (window.umami && typeof window.umami.track === 'function') window.umami.track('tool_mcp_handshake', { ok: true, tools: tools.length }); } catch (e) {}

      testOut.textContent = JSON.stringify({
        endpoint: url,
        initialize_status: r1.status,
        initialize_latency_ms: ms1,
        serverInfo: initJson.result ? initJson.result.serverInfo : initJson,
        protocolVersion: initJson.result ? initJson.result.protocolVersion : null,
        tools_count: tools.length,
        tool_names: tools.map((t) => t.name),
      }, null, 2);
    } catch (err) {
      testStatus.className = 'status-line status-err';
      testStatus.textContent = `Handshake failed: ${err.message}. Check that the endpoint supports CORS + POST JSON-RPC.`;
      testOut.textContent = String(err.stack || err.message);
    } finally {
      testBtn.disabled = false;
    }
  });

  render();
})();
