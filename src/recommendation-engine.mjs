import { readFileSync, writeFileSync } from "node:fs";

const EQUIPMENT_PLAYBOOKS = {
  "gas cabinet": {
    failure_mode: "Potential loss of toxic/flammable gas containment or detector drift.",
    action:
      "Verify gas detector calibration and trend, perform leak check at cylinder and valve interfaces, confirm purge/exhaust operation, and isolate per site procedure if the reading is confirmed.",
    evidence: ["gas detector bump/calibration record", "local exhaust status", "cylinder change log", "area alarm history"]
  },
  "wet bench": {
    failure_mode: "Loss of local exhaust capture at corrosive wet process equipment.",
    action:
      "Verify exhaust flow instrumentation, inspect damper/fan status, check sash/hood configuration, and hold wet processing if capture is below the site's accepted EHS limit.",
    evidence: ["exhaust balance reading", "hood/sash configuration", "fan and damper status", "acid service PM history"]
  },
  scrubber: {
    failure_mode: "Reduced abatement effectiveness for acid or hazardous exhaust.",
    action:
      "Confirm pH probe calibration, inspect dosing and recirculation, verify blowdown and reagent supply, and trend outlet conditions before clearing the abatement alarm.",
    evidence: ["pH probe calibration", "reagent tank level", "recirculation pump amps", "scrubber differential pressure"]
  },
  "vacuum pump": {
    failure_mode: "Rotating equipment degradation with possible hazardous process byproduct exposure.",
    action:
      "Run vibration confirmation, inspect bearing temperature and oil/seal condition, verify exhaust routing to abatement, and plan controlled maintenance before continued high-load operation.",
    evidence: ["vibration spectrum", "bearing temperature", "oil/seal condition", "abatement connection status"]
  },
  reactor: {
    failure_mode: "Pressure excursion in flammable chemical service.",
    action:
      "Validate pressure transmitter and control loop, verify relief path availability, hold startup escalation until the deviation is understood, and document safe operating-limit review.",
    evidence: ["pressure transmitter check", "control-loop trend", "relief path status", "startup batch record"]
  },
  "process pump": {
    failure_mode: "Seal leakage from corrosive process service.",
    action:
      "Confirm leak rate, verify secondary containment and seal flush, inspect seal-face/material compatibility, and draft corrective maintenance with PPE and isolation requirements.",
    evidence: ["seal leak measurement", "seal flush pressure", "containment inspection", "materials compatibility record"]
  },
  "heat exchanger": {
    failure_mode: "Heat-transfer degradation or abnormal thermal load in hazardous service.",
    action:
      "Confirm temperature sensor accuracy, inspect flow and fouling indicators, check leak-detection signals, and plan cleaning or isolation based on process-safety review.",
    evidence: ["temperature sensor check", "flow trend", "differential pressure", "leak detection status"]
  },
  "relief valve": {
    failure_mode: "Overdue protective-device inspection or uncertain relief-system reliability.",
    action:
      "Schedule PSV inspection/test, verify set pressure and tag/seal status, review service interval basis, and do not extend the interval without documented engineering approval.",
    evidence: ["last PSV test certificate", "set pressure record", "seal/tag inspection", "inspection interval basis"]
  },
  boiler: {
    failure_mode: "Combustion-control drift with possible efficiency or flame-stability impact.",
    action:
      "Verify oxygen analyzer calibration, inspect burner trim controls, review fuel/air ratio trend, and correct during a controlled utility maintenance window.",
    evidence: ["oxygen analyzer calibration", "burner trim trend", "flame scanner status", "fuel gas pressure trend"]
  },
  "cmp polisher": {
    failure_mode: "Drive-load increase that may indicate motor, bearing, pad, or slurry-delivery degradation.",
    action:
      "Compare motor-current trend to wafer load, inspect bearings and pad conditioning, verify slurry delivery, and schedule maintenance before yield-impacting drift.",
    evidence: ["motor current trend", "wafer load", "pad conditioning log", "slurry flow record"]
  },
  chiller: {
    failure_mode: "Temperature-control drift near process utility target.",
    action:
      "Keep on watchlist, verify sensor calibration during routine PM, and trend supply temperature against lithography tolerance.",
    evidence: ["temperature calibration", "supply/return trend", "PM checklist"]
  },
  "storage tank": {
    failure_mode: "Inventory condition inside operating band.",
    action:
      "No immediate intervention; keep routine inspection and confirm closed work order did not leave follow-up actions.",
    evidence: ["level trend", "closed work-order notes", "routine tank inspection"]
  }
};

const SEVERITY_ACTION = {
  critical: {
    action_class: "immediate_controlled_intervention",
    approval_required: true,
    time_horizon: "same shift",
    confidence_bonus: 0.18
  },
  high: {
    action_class: "priority_inspection",
    approval_required: true,
    time_horizon: "24 hours",
    confidence_bonus: 0.12
  },
  medium: {
    action_class: "planned_maintenance_review",
    approval_required: false,
    time_horizon: "next planned access window",
    confidence_bonus: 0.06
  },
  low: {
    action_class: "watchlist",
    approval_required: false,
    time_horizon: "routine PM cycle",
    confidence_bonus: 0
  }
};

const SAFETY_CONSTRAINTS = [
  "Do not treat the recommendation as authorization to operate, isolate, or restart equipment.",
  "Use site lockout/tagout, PPE, line-breaking, hot-work, and confined-space procedures where applicable.",
  "Use management-of-change review if the corrective action changes equipment, process chemistry, controls, alarm limits, procedures, or inspection intervals.",
  "Correct confirmed deficiencies outside acceptable limits before further use, or document protective measures that assure safe operation until correction."
];

function confidenceFor(finding) {
  const severity = SEVERITY_ACTION[finding.severity] ?? SEVERITY_ACTION.low;
  const outOfRange = finding.out_of_range === "within normal band" ? 0 : 0.28;
  const overdue = finding.days_since_pm >= 90 ? 0.16 : finding.days_since_pm >= 60 ? 0.08 : 0;
  const noteSupport = finding.notes && finding.notes !== "none" ? 0.08 : 0;
  const openTicketPenalty = finding.work_order_status === "open" ? -0.06 : 0;
  return Math.max(0.25, Math.min(0.95, 0.35 + severity.confidence_bonus + outOfRange + overdue + noteSupport + openTicketPenalty));
}

function confidenceLabel(score) {
  if (score >= 0.78) return "high";
  if (score >= 0.55) return "medium";
  return "low";
}

function scienceBasis(finding) {
  const basis = [
    "RCM principle: choose a maintenance task that reduces failure probability or consequence for the asset's intended function.",
    "FMEA-style reasoning: connect abnormal condition, plausible failure mode, effect, detection evidence, and corrective action.",
    "OSHA PSM mechanical integrity: use written procedures, inspection/testing, documentation, and deficiency correction for covered process equipment."
  ];
  if (finding.industry === "chemical") {
    basis.push("EPA RMP prevention framing: maintenance and monitoring are part of chemical accident prevention.");
  }
  if (finding.industry === "semiconductor") {
    basis.push("SEMI EH&S framing: semiconductor equipment risk review includes exhaust ventilation, fire protection, equipment safety, and worker protection.");
  }
  return basis;
}

function escalationPath(finding) {
  if (finding.severity === "critical") return ["area owner", "maintenance lead", "process safety/EHS", "operations manager"];
  if (finding.severity === "high") return ["area owner", "maintenance lead", "process safety/EHS"];
  if (finding.severity === "medium") return ["maintenance planner", "area owner"];
  return ["maintenance planner"];
}

export function recommendForFinding(finding) {
  const playbook = EQUIPMENT_PLAYBOOKS[String(finding.equipment_type).toLowerCase()] ?? {
    failure_mode: "Unclassified equipment degradation requiring engineering review.",
    action: "Validate the signal, inspect the asset against its maintenance procedure, and document the disposition.",
    evidence: ["instrument validation", "maintenance history", "operator log"]
  };
  const severityPolicy = SEVERITY_ACTION[finding.severity] ?? SEVERITY_ACTION.low;
  const confidence_score = Number(confidenceFor(finding).toFixed(2));

  return {
    recommendation_id: `REC-${finding.event_id}`,
    source_event_id: finding.event_id,
    asset_id: finding.asset_id,
    site: finding.site,
    severity: finding.severity,
    action_class: severityPolicy.action_class,
    time_horizon: severityPolicy.time_horizon,
    approval_required: severityPolicy.approval_required,
    confidence: confidenceLabel(confidence_score),
    confidence_score,
    plausible_failure_mode: playbook.failure_mode,
    recommendation: playbook.action,
    rationale: `${finding.metric} is ${finding.out_of_range} at ${finding.value} ${finding.unit}; risk score ${finding.score} reflects ${finding.material_class} material hazard, ${finding.equipment_type} criticality, deviation magnitude, PM age, and work-order state.`,
    evidence_to_collect: playbook.evidence,
    escalation_path: escalationPath(finding),
    scientific_basis: scienceBasis(finding),
    safety_constraints: SAFETY_CONSTRAINTS
  };
}

export function generateRecommendations(analysis) {
  const recommendations = analysis.findings.map(recommendForFinding);
  const approvalQueue = recommendations.filter((recommendation) => recommendation.approval_required);
  return {
    generated_at: new Date().toISOString(),
    method:
      "Deterministic RCM/FMEA-style recommendation rules using abnormal condition, consequence severity, detection evidence, maintenance interval, and required approval controls.",
    disclaimer:
      "Recommendations are decision support only. They do not replace site procedures, engineering judgement, OEM instructions, or regulatory obligations.",
    approval_queue_count: approvalQueue.length,
    recommendations
  };
}

function renderRecommendationTable(recommendations) {
  const header = "| Recommendation | Asset | Severity | Class | Horizon | Confidence | Evidence gaps |";
  const divider = "| --- | --- | --- | --- | --- | --- | --- |";
  const rows = recommendations.map((rec) => {
    return `| ${rec.recommendation_id} | ${rec.asset_id} | ${rec.severity.toUpperCase()} | ${rec.action_class} | ${rec.time_horizon} | ${rec.confidence} (${rec.confidence_score}) | ${rec.evidence_to_collect.join("; ")} |`;
  });
  return [header, divider, ...rows].join("\n");
}

export function renderRecommendationMarkdown(plan) {
  const gated = plan.recommendations.filter((rec) => rec.approval_required);
  return `# FabGuard Recommendation Plan

Generated: ${plan.generated_at}

${plan.disclaimer}

## Method

${plan.method}

## Approval-Gated Recommendations

${gated
  .map(
    (rec) =>
      `- ${rec.recommendation_id} / ${rec.asset_id}: ${rec.recommendation} Approval path: ${rec.escalation_path.join(" -> ")}.`
  )
  .join("\n")}

## Recommendation Register

${renderRecommendationTable(plan.recommendations)}

## Controls Applied

${SAFETY_CONSTRAINTS.map((constraint) => `- ${constraint}`).join("\n")}
`;
}

export function writeRecommendationPlan(plan, markdownPath, jsonPath) {
  writeFileSync(markdownPath, renderRecommendationMarkdown(plan));
  writeFileSync(jsonPath, `${JSON.stringify(plan, null, 2)}\n`);
}
