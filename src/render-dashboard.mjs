#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";

const [riskPath, workOrderPath, recommendationPath, outputPath] = process.argv.slice(2);

if (!riskPath || !workOrderPath || !recommendationPath || !outputPath) {
  console.error("Usage: node src/render-dashboard.mjs <risk.json> <workorders.csv> <recommendations.json> <dashboard.html>");
  process.exit(1);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function parseCsv(text) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  if (!headerLine) return [];
  const headers = headerLine.split(",");
  return lines.map((line) => {
    const values = [];
    let field = "";
    let inQuotes = false;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];
      if (char === '"' && inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(field);
        field = "";
      } else {
        field += char;
      }
    }
    values.push(field);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function scoreBar(score) {
  return `<span class="scorebar"><i style="width:${Math.max(4, Number(score))}%"></i></span>`;
}

const risk = JSON.parse(readFileSync(riskPath, "utf8"));
const workOrders = parseCsv(readFileSync(workOrderPath, "utf8"));
const recommendationPlan = JSON.parse(readFileSync(recommendationPath, "utf8"));
const urgent = risk.findings.filter((finding) => ["critical", "high"].includes(finding.severity));
const topFindings = risk.findings.slice(0, 5);
const topRecommendations = recommendationPlan.recommendations.filter((rec) => rec.approval_required).slice(0, 4);
const siteCounts = risk.findings.reduce((acc, finding) => {
  acc[finding.site] = (acc[finding.site] ?? 0) + 1;
  return acc;
}, {});

const countCards = [
  ["critical", "Critical", "Immediate escalation"],
  ["high", "High", "Priority inspection"],
  ["medium", "Medium", "Planned review"],
  ["low", "Low", "Watchlist"]
]
  .map(
    ([key, label, caption]) => `
      <section class="metric ${key}">
        <span>${label}</span>
        <strong>${risk.counts[key]}</strong>
        <small>${caption}</small>
      </section>`
  )
  .join("");

const siteRows = Object.entries(siteCounts)
  .sort((a, b) => b[1] - a[1])
  .map(
    ([site, count]) => `
      <div class="site-row">
        <span>${escapeHtml(site)}</span>
        <b>${count}</b>
      </div>`
  )
  .join("");

const findingRows = risk.findings
  .map(
    (finding) => `
      <tr>
        <td><span class="sev ${finding.severity}">${finding.severity}</span></td>
        <td>
          <strong>${escapeHtml(finding.asset_id)}</strong>
          <small>${escapeHtml(finding.equipment_type)} / ${escapeHtml(finding.process_material)}</small>
        </td>
        <td>${escapeHtml(finding.site)}</td>
        <td>${escapeHtml(finding.metric)}</td>
        <td class="num">${finding.score}${scoreBar(finding.score)}</td>
        <td>${escapeHtml(finding.out_of_range)}</td>
      </tr>`
  )
  .join("");

const topFindingTiles = topFindings
  .map(
    (finding, index) => `
      <article class="finding-tile ${finding.severity}">
        <span class="rank">0${index + 1}</span>
        <div>
          <strong>${escapeHtml(finding.asset_id)}</strong>
          <small>${escapeHtml(finding.site)} / ${escapeHtml(finding.equipment_type)}</small>
        </div>
        <b>${finding.score}</b>
      </article>`
  )
  .join("");

const workOrderRows = workOrders
  .map(
    (workOrder) => `
      <tr>
        <td>${escapeHtml(workOrder.work_order_id)}</td>
        <td><span class="priority">${escapeHtml(workOrder.priority)}</span></td>
        <td>${escapeHtml(workOrder.asset_id)}</td>
        <td>${escapeHtml(workOrder.summary)}</td>
        <td>${escapeHtml(workOrder.approval_required)}</td>
      </tr>`
  )
  .join("");

const recommendationRows = topRecommendations
  .map(
    (rec) => `
      <article class="recommendation-card ${rec.severity}">
        <div>
          <span>${escapeHtml(rec.recommendation_id)} / ${escapeHtml(rec.action_class)}</span>
          <strong>${escapeHtml(rec.asset_id)}: ${escapeHtml(rec.plausible_failure_mode)}</strong>
          <p>${escapeHtml(rec.recommendation)}</p>
        </div>
        <b>${escapeHtml(rec.confidence)}</b>
      </article>`
  )
  .join("");

const processNodes = topFindings
  .map((finding) => [finding.equipment_type, finding.asset_id, finding.severity])
  .map(
    ([label, asset, severity]) => `
      <div class="map-node ${escapeHtml(severity)}">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(asset)}</strong>
      </div>`
  )
  .join("");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FabGuard Operator Console</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #111827;
      --muted: #647084;
      --line: #d8dee8;
      --panel: #ffffff;
      --bg: #eef2f7;
      --rail: #141a24;
      --critical: #c92a2a;
      --high: #d66a00;
      --medium: #806b00;
      --low: #13795b;
      --blue: #1d4ed8;
      --shadow: 0 18px 45px rgba(16, 24, 40, 0.14);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        linear-gradient(90deg, rgba(20, 26, 36, 0.04) 1px, transparent 1px),
        linear-gradient(0deg, rgba(20, 26, 36, 0.04) 1px, transparent 1px),
        var(--bg);
      background-size: 28px 28px;
      color: var(--ink);
    }
    .shell {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 78px minmax(0, 1fr);
    }
    .rail {
      background: var(--rail);
      color: #e5e7eb;
      padding: 18px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
    }
    .mark {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(255,255,255,0.24);
      background: #202938;
      font-weight: 900;
      border-radius: 8px;
    }
    .rail a {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      color: #cbd5e1;
      text-decoration: none;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      font-weight: 800;
      font-size: 11px;
    }
    .rail a.active {
      color: #ffffff;
      background: var(--blue);
      border-color: var(--blue);
    }
    main {
      width: 100%;
      max-width: 1440px;
      margin: 0 auto;
      padding: 24px;
    }
    header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 18px;
      align-items: center;
      margin-bottom: 18px;
    }
    h1, h2, h3 { margin: 0; letter-spacing: 0; }
    h1 { font-size: 34px; line-height: 1.05; }
    h2 { font-size: 16px; }
    h3 { font-size: 14px; }
    p { margin: 6px 0 0; color: var(--muted); line-height: 1.45; }
    small { display: block; color: var(--muted); line-height: 1.35; }
    .title-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      margin-bottom: 7px;
    }
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 9px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.78);
      border-radius: 999px;
      color: var(--muted);
      font-size: 12px;
      font-weight: 800;
    }
    .status {
      display: grid;
      gap: 4px;
      min-width: 260px;
      padding: 14px;
      border: 1px solid #f5b041;
      background: #fff7df;
      border-radius: 8px;
      box-shadow: var(--shadow);
    }
    .status strong {
      color: #744300;
      font-size: 14px;
      text-transform: uppercase;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 18px;
    }
    .metric {
      min-height: 118px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.92);
      border-radius: 8px;
      padding: 15px;
      position: relative;
      overflow: hidden;
    }
    .metric:after {
      content: "";
      position: absolute;
      inset: auto 0 0 0;
      height: 5px;
      background: var(--accent);
    }
    .metric.critical { --accent: var(--critical); }
    .metric.high { --accent: var(--high); }
    .metric.medium { --accent: var(--medium); }
    .metric.low { --accent: var(--low); }
    .metric span {
      display: block;
      text-transform: uppercase;
      font-size: 12px;
      color: var(--muted);
      font-weight: 900;
    }
    .metric strong {
      display: block;
      margin-top: 5px;
      font-size: 42px;
      line-height: 1;
    }
    .metric small { margin-top: 10px; }
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(330px, 0.6fr);
      gap: 16px;
      align-items: start;
    }
    .panel {
      background: rgba(255,255,255,0.94);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: 0 10px 28px rgba(16, 24, 40, 0.08);
      padding: 16px;
      margin-bottom: 16px;
    }
    .panel-head {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }
    .process-map {
      display: grid;
      gap: 12px;
      padding: 18px;
      min-height: 230px;
      background:
        linear-gradient(90deg, rgba(255,255,255,0.78), rgba(255,255,255,0.48)),
        repeating-linear-gradient(45deg, rgba(29,78,216,0.08), rgba(29,78,216,0.08) 1px, transparent 1px, transparent 14px);
      border: 1px solid var(--line);
      border-radius: 8px;
    }
    .map-track {
      display: grid;
      grid-template-columns: repeat(5, minmax(100px, 1fr));
      gap: 12px;
      align-items: center;
    }
    .map-node {
      min-height: 78px;
      border: 1px solid var(--line);
      border-top: 5px solid var(--accent);
      background: #fff;
      border-radius: 8px;
      padding: 12px;
      position: relative;
    }
    .map-node:before {
      content: "";
      position: absolute;
      left: -12px;
      top: 34px;
      width: 12px;
      height: 2px;
      background: var(--line);
    }
    .map-node:first-child:before { display: none; }
    .map-node.critical { --accent: var(--critical); }
    .map-node.high { --accent: var(--high); }
    .map-node span {
      display: block;
      color: var(--muted);
      font-size: 12px;
      font-weight: 800;
    }
    .map-node strong {
      display: block;
      margin-top: 6px;
      font-size: 20px;
    }
    .tiles {
      display: grid;
      gap: 10px;
      margin-top: 12px;
    }
    .finding-tile {
      display: grid;
      grid-template-columns: 44px 1fr auto;
      gap: 12px;
      align-items: center;
      border: 1px solid var(--line);
      border-left: 5px solid var(--accent);
      background: #fff;
      border-radius: 8px;
      padding: 11px;
    }
    .finding-tile.critical { --accent: var(--critical); }
    .finding-tile.high { --accent: var(--high); }
    .rank {
      color: var(--muted);
      font-weight: 900;
      font-size: 12px;
    }
    .finding-tile b {
      font-size: 24px;
      font-variant-numeric: tabular-nums;
    }
    .recommendation-card {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: start;
      padding: 13px;
      border: 1px solid var(--line);
      border-left: 5px solid var(--accent);
      background: #fff;
      border-radius: 8px;
      margin-top: 10px;
    }
    .recommendation-card.critical { --accent: var(--critical); }
    .recommendation-card.high { --accent: var(--high); }
    .recommendation-card span {
      color: var(--muted);
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .recommendation-card strong {
      display: block;
      margin-top: 4px;
    }
    .recommendation-card p {
      font-size: 13px;
    }
    .recommendation-card b {
      color: var(--blue);
      text-transform: uppercase;
      font-size: 12px;
    }
    .split {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 260px;
      gap: 14px;
      align-items: start;
    }
    .site-stack {
      display: grid;
      gap: 8px;
      margin-top: 12px;
    }
    .site-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      padding: 10px;
      background: #f8fafc;
      border: 1px solid var(--line);
      border-radius: 8px;
    }
    .trace {
      display: grid;
      gap: 10px;
      margin-top: 12px;
    }
    .step {
      display: grid;
      grid-template-columns: 84px 1fr;
      gap: 10px;
      padding: 11px;
      border: 1px solid var(--line);
      background: #fbfcff;
      border-radius: 8px;
    }
    .step strong {
      color: var(--blue);
      font-size: 12px;
      text-transform: uppercase;
    }
    .approval {
      border-color: #f5b041;
      background: #fffaf0;
    }
    .approval-number {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin: 10px 0;
    }
    .approval-number strong {
      font-size: 46px;
      line-height: 1;
    }
    .button-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 14px;
    }
    button {
      border: 1px solid var(--line);
      background: #fff;
      color: var(--ink);
      padding: 10px 12px;
      border-radius: 8px;
      font-weight: 900;
      cursor: default;
    }
    button.primary {
      background: var(--blue);
      border-color: var(--blue);
      color: #fff;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th, td {
      border-bottom: 1px solid var(--line);
      padding: 10px 9px;
      text-align: left;
      vertical-align: top;
    }
    th {
      color: var(--muted);
      font-size: 11px;
      text-transform: uppercase;
      background: #f8fafc;
    }
    td strong { display: block; }
    .num {
      text-align: right;
      font-variant-numeric: tabular-nums;
      min-width: 96px;
    }
    .scorebar {
      display: block;
      height: 5px;
      width: 76px;
      margin: 5px 0 0 auto;
      background: #e5e7eb;
      border-radius: 999px;
      overflow: hidden;
    }
    .scorebar i {
      display: block;
      height: 100%;
      background: var(--blue);
    }
    .sev, .priority {
      display: inline-block;
      min-width: 74px;
      padding: 5px 7px;
      color: #fff;
      text-align: center;
      text-transform: uppercase;
      font-size: 11px;
      font-weight: 900;
      border-radius: 999px;
    }
    .sev.critical, .priority { background: var(--critical); }
    .sev.high { background: var(--high); }
    .sev.medium { background: var(--medium); }
    .sev.low { background: var(--low); }
    .evidence-list {
      display: grid;
      gap: 8px;
      margin: 10px 0 0;
      padding: 0;
      list-style: none;
    }
    .evidence-list li {
      padding: 10px 11px;
      border: 1px solid var(--line);
      background: #f8fafc;
      border-radius: 8px;
      color: var(--muted);
    }
    @media (max-width: 1050px) {
      .shell { grid-template-columns: 1fr; }
      .rail {
        position: sticky;
        top: 0;
        z-index: 10;
        flex-direction: row;
        justify-content: start;
      }
      .layout, header, .split { grid-template-columns: 1fr; }
      .map-track { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 760px) {
      main { padding: 14px; }
      h1 { font-size: 28px; }
      .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .map-track { grid-template-columns: 1fr; }
      table { display: block; overflow-x: auto; white-space: nowrap; }
      .status { min-width: 0; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <nav class="rail" aria-label="FabGuard sections">
      <div class="mark">FG</div>
      <a class="active" href="#risk">RISK</a>
      <a href="#trace">RUN</a>
      <a href="#approval">HOLD</a>
      <a href="#orders">WO</a>
    </nav>

    <main>
      <header>
        <div>
          <div class="title-row">
            <span class="tag">TrueForge sandbox run</span>
            <span class="tag">MCP read-only research</span>
            <span class="tag">Subagent review</span>
          </div>
          <h1>FabGuard Maintenance Control</h1>
          <p>Semiconductor fab and chemical plant maintenance triage generated from evidence at ${escapeHtml(risk.generated_at)}.</p>
        </div>
        <aside class="status" id="approval">
          <strong>Waiting for human approval</strong>
          <small>Draft work orders are held until area owner, maintenance, and EHS sign off.</small>
        </aside>
      </header>

      <div class="metrics">${countCards}</div>

      <div class="layout">
        <div>
          <section class="panel">
            <div class="panel-head">
              <div>
                <h2>Plant And Fab Risk Map</h2>
                <p>Top hazards placed as an operator-facing process path.</p>
              </div>
              <span class="tag">${urgent.length} gated actions</span>
            </div>
            <div class="process-map">
              <div class="map-track">${processNodes}</div>
              <div class="split">
                <div>
                  <h3>Highest scoring assets</h3>
                  <div class="tiles">${topFindingTiles}</div>
                </div>
                <div>
                  <h3>Events by site</h3>
                  <div class="site-stack">${siteRows}</div>
                </div>
              </div>
            </div>
          </section>

          <section class="panel" id="risk">
            <div class="panel-head">
              <div>
                <h2>Risk Register</h2>
                <p>Scored from material hazard, equipment criticality, range deviation, PM age, and work-order state.</p>
              </div>
              <span class="tag">${risk.findings.length} telemetry events</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Asset</th>
                  <th>Site</th>
                  <th>Metric</th>
                  <th class="num">Score</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>${findingRows}</tbody>
            </table>
          </section>
        </div>

        <aside>
          <section class="panel approval">
            <h2>Approval Gate</h2>
            <p>TrueForge should pause here before the irreversible step.</p>
            <div class="approval-number">
              <strong>${workOrders.length}</strong>
              <span>draft work orders held</span>
            </div>
            <small>Required approval path: area owner + maintenance + EHS.</small>
            <div class="button-row">
              <button class="primary" type="button">Approve Drafts</button>
              <button type="button">Keep Holding</button>
            </div>
          </section>

          <section class="panel" id="trace">
            <h2>Agent Trace</h2>
            <p>What the demo should show inside TrueForge.</p>
            <div class="trace">
              <div class="step"><strong>MCP</strong><span>Read-only standards and supplier-doc research.</span></div>
              <div class="step"><strong>Sandbox</strong><span>Risk scoring code ran against telemetry files.</span></div>
              <div class="step"><strong>Subagents</strong><span>Process safety, fab uptime, and maintenance planning reviews.</span></div>
              <div class="step"><strong>Approval</strong><span>Paused before generating operational work-order drafts.</span></div>
              <div class="step"><strong>Session</strong><span>Run evidence remains in reports for reconnect/demo continuity.</span></div>
            </div>
          </section>

          <section class="panel">
            <h2>Recommendation Engine</h2>
            <p>RCM/FMEA-style rules convert risk into evidence-backed maintenance actions.</p>
            ${recommendationRows}
          </section>

          <section class="panel">
            <h2>Research Basis</h2>
            <ul class="evidence-list">
              <li>OSHA PSM mechanical integrity: inspections, tests, procedures, documentation, and deficiency correction.</li>
              <li>EPA RMP prevention: maintenance, monitoring, safety precautions, training, and emergency response planning.</li>
              <li>SEMI EH&S: semiconductor equipment safety, exhaust ventilation, fire risk, and worker protection.</li>
            </ul>
          </section>
        </aside>
      </div>

      <section class="panel" id="orders">
        <div class="panel-head">
          <div>
            <h2>Draft Work Orders</h2>
            <p>Prepared after approval for high and critical findings only; still not operational authorization.</p>
          </div>
          <span class="tag">Approval required</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Draft</th>
              <th>Priority</th>
              <th>Asset</th>
              <th>Summary</th>
              <th>Approval</th>
            </tr>
          </thead>
          <tbody>${workOrderRows}</tbody>
        </table>
      </section>
    </main>
  </div>
</body>
</html>
`;

writeFileSync(outputPath, html);
console.log(`Dashboard written: ${outputPath}`);
