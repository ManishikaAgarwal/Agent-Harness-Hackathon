import { readFileSync, writeFileSync } from "node:fs";

const HAZARD_WEIGHTS = {
  pyrophoric: 34,
  toxic: 30,
  flammable: 26,
  corrosive: 22,
  irritant: 10,
  nonhazardous: 0
};

const EQUIPMENT_WEIGHTS = {
  "gas cabinet": 18,
  "wet bench": 16,
  scrubber: 14,
  "vacuum pump": 14,
  reactor: 16,
  "relief valve": 18,
  "process pump": 12,
  "heat exchanger": 12,
  boiler: 10,
  "cmp polisher": 8,
  chiller: 4,
  "storage tank": 6
};

const SAFETY_BASIS = {
  psm: "OSHA PSM mechanical integrity: inspection/test frequency, deficiency correction, and documentation for covered process equipment.",
  rmp: "EPA RMP prevention program: maintenance, monitoring, safety precautions, training, and emergency response planning.",
  semi: "SEMI equipment EH&S guidance: semiconductor equipment safety, exhaust ventilation, fire protection, and worker protection principles."
};

export function parseCsv(text) {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }

  const [headers, ...dataRows] = rows;
  if (!headers) return [];

  return dataRows.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))
  );
}

export function loadEvents(path) {
  return parseCsv(readFileSync(path, "utf8")).map((event) => ({
    ...event,
    value: Number(event.value),
    normal_min: Number(event.normal_min),
    normal_max: Number(event.normal_max),
    days_since_pm: Number(event.days_since_pm)
  }));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rangeDeviation(event) {
  const { value, normal_min: min, normal_max: max } = event;
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) return 0;
  if (value >= min && value <= max) return 0;

  const band = Math.max(Math.abs(max - min), 1);
  const distance = value < min ? min - value : value - max;
  return clamp((distance / band) * 40, 10, 40);
}

function overdueScore(daysSincePm) {
  if (daysSincePm >= 365) return 24;
  if (daysSincePm >= 120) return 18;
  if (daysSincePm >= 90) return 12;
  if (daysSincePm >= 60) return 6;
  return 0;
}

function eventBasis(event) {
  const basis = [SAFETY_BASIS.psm, SAFETY_BASIS.rmp];
  if (event.industry === "semiconductor") basis.push(SAFETY_BASIS.semi);
  return basis;
}

function recommendedAction(event, severity) {
  const asset = `${event.asset_id} ${event.equipment_type}`;
  const metric = `${event.metric}=${event.value}${event.unit}`;
  const isolateText = {
    critical:
      "Escalate to maintenance, process safety/EHS, and area owner immediately; verify containment and consider controlled isolation.",
    high: "Schedule priority inspection with maintenance and area owner; keep monitoring trend until cleared.",
    medium: "Add to maintenance review queue, verify trend source, and inspect during the next planned access window.",
    low: "No immediate intervention recommended; retain in watchlist and review during routine maintenance."
  }[severity];

  return `${isolateText} Confirm ${asset} instrumentation, inspect the failure mode behind ${metric}, document acceptance criteria, and do not close the action until a qualified owner approves return to service.`;
}

export function scoreEvent(event) {
  const hazard = HAZARD_WEIGHTS[event.material_class] ?? 8;
  const equipment = EQUIPMENT_WEIGHTS[String(event.equipment_type).toLowerCase()] ?? 6;
  const deviation = rangeDeviation(event);
  const overdue = overdueScore(event.days_since_pm);
  const noWorkOrderPenalty = event.work_order_status === "none" ? 10 : 0;
  const openWorkOrderCredit = event.work_order_status === "open" ? -4 : 0;
  const rawScore = hazard + equipment + deviation + overdue + noWorkOrderPenalty + openWorkOrderCredit;
  const score = clamp(Math.round(rawScore), 0, 100);

  let severity = "low";
  if (score >= 85) severity = "critical";
  else if (score >= 65) severity = "high";
  else if (score >= 35) severity = "medium";

  const outOfRange =
    event.value < event.normal_min
      ? "below normal band"
      : event.value > event.normal_max
        ? "above normal band"
        : "within normal band";

  return {
    ...event,
    score,
    severity,
    out_of_range: outOfRange,
    basis: eventBasis(event),
    recommended_action: recommendedAction(event, severity)
  };
}

export function analyzeEvents(events) {
  const findings = events.map(scoreEvent).sort((a, b) => b.score - a.score);
  const counts = findings.reduce(
    (acc, finding) => {
      acc[finding.severity] += 1;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );

  return {
    generated_at: new Date().toISOString(),
    disclaimer:
      "Decision support only. A qualified maintenance, process safety, and EHS owner must approve any operational action.",
    counts,
    findings
  };
}

function markdownTable(rows) {
  const header = "| Rank | Severity | Score | Site | Asset | Finding | Recommended action |";
  const divider = "| ---: | --- | ---: | --- | --- | --- | --- |";
  const body = rows.map((row, index) => {
    const bandText =
      row.out_of_range === "within normal band"
        ? `inside ${row.normal_min}-${row.normal_max}`
        : `outside ${row.normal_min}-${row.normal_max}`;
    const finding = `${row.metric} ${row.out_of_range}: ${row.value} ${row.unit} ${bandText}`;
    return `| ${index + 1} | ${row.severity.toUpperCase()} | ${row.score} | ${row.site} | ${row.asset_id} | ${finding} | ${row.recommended_action} |`;
  });
  return [header, divider, ...body].join("\n");
}

export function renderMarkdownReport(analysis) {
  const urgent = analysis.findings.filter((finding) => ["critical", "high"].includes(finding.severity));
  const sourceNotes = [
    "- OSHA PSM 1910.119: mechanical integrity emphasizes documented inspections/tests, suitable frequency, and correction of deficiencies.",
    "- EPA RMP: prevention programs include maintenance, monitoring, safety precautions, training, and emergency response planning.",
    "- SEMI EH&S / S2: semiconductor equipment risk context includes exhaust ventilation, fire protection, equipment safety, and worker protection."
  ];

  return `# FabGuard Maintenance Risk Triage

Generated: ${analysis.generated_at}

${analysis.disclaimer}

## Executive Snapshot

- Critical findings: ${analysis.counts.critical}
- High findings: ${analysis.counts.high}
- Medium findings: ${analysis.counts.medium}
- Low findings: ${analysis.counts.low}
- Approval gate: work orders are draft-only and require explicit human approval.

## Priority Findings

${markdownTable(analysis.findings)}

## Immediate Approval Queue

${urgent
  .map(
    (finding) =>
      `- ${finding.severity.toUpperCase()} ${finding.asset_id}: approve a controlled maintenance work order only after area owner and EHS review. Source event ${finding.event_id}.`
  )
  .join("\n")}

## Safety Basis Used By Agent

${sourceNotes.join("\n")}
`;
}

export function writeReports(analysis, markdownPath, jsonPath) {
  writeFileSync(markdownPath, renderMarkdownReport(analysis));
  writeFileSync(jsonPath, `${JSON.stringify(analysis, null, 2)}\n`);
}
