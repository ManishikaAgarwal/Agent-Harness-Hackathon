#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";

const [inputPath, outputPath, approvalFlag] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  console.error("Usage: node src/draft-workorders.mjs <risk_triage.json> <workorders.csv> --approved");
  process.exit(1);
}

if (approvalFlag !== "--approved") {
  console.error("Refusing to draft work orders without explicit --approved flag.");
  process.exit(2);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const analysis = JSON.parse(readFileSync(inputPath, "utf8"));
const actionable = analysis.findings.filter((finding) => ["critical", "high"].includes(finding.severity));

const headers = [
  "work_order_id",
  "source_event_id",
  "asset_id",
  "site",
  "priority",
  "summary",
  "recommended_action",
  "safety_basis",
  "approval_required"
];

const rows = actionable.map((finding, index) => {
  const priority = finding.severity === "critical" ? "P1" : "P2";
  return {
    work_order_id: `FG-${String(index + 1).padStart(4, "0")}`,
    source_event_id: finding.event_id,
    asset_id: finding.asset_id,
    site: finding.site,
    priority,
    summary: `${priority} ${finding.equipment_type} ${finding.metric} ${finding.out_of_range}`,
    recommended_action: finding.recommended_action,
    safety_basis: finding.basis.join(" | "),
    approval_required: "area_owner+maintenance+EHS"
  };
});

const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
writeFileSync(outputPath, `${csv}\n`);

console.log(`Drafted ${rows.length} approval-gated work orders: ${outputPath}`);

