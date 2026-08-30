import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";

const dbPath =
  process.env.SQLITE_PATH ??
  join(process.cwd(), ".trueforge", "db.sqlite");

mkdirSync(dirname(dbPath), { recursive: true });

const tenant = "default";
const now = new Date().toISOString();

function quoteSql(value) {
  return String(value).replaceAll("'", "''");
}

function jsonExpr(value) {
  return `jsonb('${quoteSql(JSON.stringify(value))}')`;
}

function modelCatalogForGemini() {
  return [
    {
      model_id: "gemini-3.6-flash",
      name: "gemini-3-6-flash",
      properties: {
        context_length: 1048576,
        max_output_tokens: 65536,
        reasoning_efforts: ["minimal", "low", "medium", "high"]
      }
    }
  ];
}

const connectors = [
  {
    type: "remote",
    name: "exa",
    url: "https://mcp.exa.ai/mcp",
    description: "Read-only research for public standards, supplier docs, and incident-response references."
  },
  {
    type: "remote",
    name: "deepwiki",
    url: "https://mcp.deepwiki.com/mcp",
    description: "Read public GitHub documentation for connected maintenance, CMMS, or data-analysis tooling."
  }
];

const skills = [
  {
    type: "git",
    name: "jupyter-notebook",
    url: "https://github.com/openai/skills",
    path: "skills/.curated/jupyter-notebook",
    ref: "main",
    description: "Run and explain data analysis in notebooks."
  },
  {
    type: "git",
    name: "web-artifacts-builder",
    url: "https://github.com/anthropics/skills",
    path: "skills/web-artifacts-builder",
    ref: "main",
    description: "Build lightweight interactive dashboards for agent findings."
  }
];

const agentFiles = [
  "../trueforge/fabguard-maintenance-agent.json",
  "../trueforge/fabguard-maintenance-agent-with-sandbox.json"
];
const agents = agentFiles.map((file) => JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8")));

let sql = "BEGIN;\n";

for (const connector of connectors) {
  sql += `insert into mcp_server (id, tenant_id, name, manifest, oauth_server, oauth_client, created_at, updated_at)
values ('${randomUUID()}', '${tenant}', '${quoteSql(connector.name)}', ${jsonExpr(connector)}, null, null, '${now}', '${now}')
on conflict(tenant_id, name) do update set manifest = excluded.manifest, updated_at = excluded.updated_at;\n`;
}

for (const skill of skills) {
  sql += `insert into skill (tenant_id, name, manifest, created_at, updated_at)
values ('${tenant}', '${quoteSql(skill.name)}', ${jsonExpr(skill)}, '${now}', '${now}')
on conflict(tenant_id, name) do update set manifest = excluded.manifest, updated_at = excluded.updated_at;\n`;
}

const geminiApiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!geminiApiKey) {
  const providerCheck = existsSync(dbPath)
    ? spawnSync("sqlite3", [dbPath], {
        input: "select count(*) from model_provider where tenant_id='default' and name='google-gemini';",
        encoding: "utf8"
      })
    : { status: 1, stdout: "" };
  const hasExistingProvider = providerCheck.status === 0 && Number(providerCheck.stdout.trim()) > 0;
  if (!hasExistingProvider) {
    console.error("GEMINI_API_KEY is required on a fresh setup because the seeded agents use Google Gemini.");
    console.error("Start TrueForge once to initialize the local database, then rerun with GEMINI_API_KEY set.");
    process.exit(1);
  }
}
if (geminiApiKey) {
  const geminiProvider = {
    type: "google-gemini",
    auth: {
      api_key: geminiApiKey
    },
    models: modelCatalogForGemini()
  };

  sql += `insert into model_provider (tenant_id, name, manifest, created_at, updated_at)
values ('${tenant}', 'google-gemini', ${jsonExpr(geminiProvider)}, '${now}', '${now}')
on conflict(tenant_id, name) do update set manifest = excluded.manifest, updated_at = excluded.updated_at;\n`;
}

for (const agent of agents) {
  sql += `insert into agent (id, tenant_id, name, manifest, created_at, updated_at)
values ('${randomUUID()}', '${tenant}', '${quoteSql(agent.name)}', ${jsonExpr(agent.manifest)}, '${now}', '${now}')
on conflict(tenant_id, name) do update set manifest = excluded.manifest, updated_at = excluded.updated_at;\n`;
}

sql += "COMMIT;\n";

const result = spawnSync("sqlite3", [dbPath], { input: sql, encoding: "utf8" });
if (result.status !== 0) {
  console.error(result.stderr || result.stdout);
  process.exit(result.status || 1);
}

console.log("TrueForge seed complete.");
console.log(`Database: ${dbPath}`);
console.log(`Agents: ${agents.map((agent) => agent.name).join(", ")}`);
console.log(`Gemini provider: ${geminiApiKey ? "configured from env var" : "left unchanged; no key written to repo"}`);
