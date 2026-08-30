#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const [inputPath, outputPath] = args;
const approvalFlag = args.includes("--approved");
const approvalFileIndex = args.indexOf("--approval-file");
const approvalFile = approvalFileIndex >= 0 ? args[approvalFileIndex + 1] : undefined;

if (!inputPath || !outputPath) {
  console.error("Usage: node src/draft-workorders.mjs <risk_triage.json> <workorders.csv> --approved --approval-file <approval.json>");
  process.exit(1);
}

if (!approvalFlag) {
  console.error("Refusing to draft work orders without explicit --approved flag.");
  process.exit(2);
}

if (!approvalFile) {
  console.error("Refusing to draft work orders without an approval artifact.");
  process.exit(2);
}

let approval;
try {
  approval = JSON.parse(readFileSync(approvalFile, "utf8"));
} catch (error) {
  console.error(`Refusing to draft work orders: cannot read approval artifact (${error.message}).`);
  process.exit(2);
}

if (
  approval.approved !== true ||
  approval.approval_source !== "trueforge-human-approval" ||
  !String(approval.approver ?? "").trim() ||
  !String(approval.approved_at ?? "").trim() ||
  !Array.isArray(approval.approved_finding_ids) ||
  approval.approved_finding_ids.length === 0
) {
  console.error("Refusing to draft work orders: approval artifact is incomplete or not a TrueForge human approval.");
  process.exit(2);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const analysis = JSON.parse(readFileSync(inputPath, "utf8"));
const actionable = analysis.findings.filter((finding) => ["critical", "high"].includes(finding.severity));
const actionableIds = actionable.map((finding) => finding.event_id);
const approvedIds = new Set(approval.approved_finding_ids);
if (actionableIds.some((eventId) => !approvedIds.has(eventId))) {
  console.error("Refusing to draft work orders: approval artifact does not cover every high or critical finding.");
  process.exit(2);
}

const headers = [
  "work_order_id",
  "source_event_id",
  "asset_id",
  "site",
  "priority",
  "summary",
  "recommended_action",
  "safety_basis",
  "approval_required",
  "approval_recorded_by",
  "approval_recorded_at",
  "approval_scope"
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
    approval_required: "area_owner+maintenance+EHS",
    approval_recorded_by: approval.approver,
    approval_recorded_at: approval.approved_at,
    approval_scope: approval.scope ?? "high-and-critical-findings"
  };
});

const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
writeFileSync(outputPath, `${csv}\n`);

console.log(`Drafted ${rows.length} approval-gated work orders: ${outputPath}`);
