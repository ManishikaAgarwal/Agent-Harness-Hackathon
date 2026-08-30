import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { analyzeEvents, loadEvents, writeReports } from "../src/risk-engine.mjs";

const scratch = mkdtempSync(join(tmpdir(), "fabguard-test-"));
mkdirSync(join(scratch, "reports"), { recursive: true });

const samplePath = new URL("../sample-data/maintenance_events.csv", import.meta.url);
const jsonPath = join(scratch, "reports", "risk.json");
const markdownPath = join(scratch, "reports", "risk.md");
const outputPath = join(scratch, "reports", "workorders.csv");
const approvalPath = join(scratch, "reports", "approval.json");
writeReports(analyzeEvents(loadEvents(samplePath)), markdownPath, jsonPath);
const risk = JSON.parse(readFileSync(jsonPath, "utf8"));
writeFileSync(
  approvalPath,
  JSON.stringify({
    approved: true,
    approval_source: "trueforge-human-approval",
    approver: "Test approver",
    approved_at: new Date().toISOString(),
    scope: "high-and-critical-findings",
    approved_finding_ids: risk.findings
      .filter((finding) => ["critical", "high"].includes(finding.severity))
      .map((finding) => finding.event_id)
  })
);

const denied = spawnSync(process.execPath, ["src/draft-workorders.mjs", jsonPath, outputPath], {
  cwd: new URL("..", import.meta.url),
  encoding: "utf8"
});
assert.equal(denied.status, 2);
assert.match(denied.stderr, /Refusing to draft work orders/);

const approved = spawnSync(
  process.execPath,
  ["src/draft-workorders.mjs", jsonPath, outputPath, "--approved", "--approval-file", approvalPath],
  {
  cwd: new URL("..", import.meta.url),
  encoding: "utf8"
  }
);
assert.equal(approved.status, 0);

const csv = readFileSync(outputPath, "utf8");
assert.match(csv, /area_owner\+maintenance\+EHS/);
assert.match(csv, /FG-0001/);
assert.match(csv, /GC-04|VP-22|PSV-9/);
assert.match(csv, /Test approver/);

console.log("workorder approval gate tests passed");
