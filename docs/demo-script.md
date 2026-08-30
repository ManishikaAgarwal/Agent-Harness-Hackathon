# Three-Minute Demo Script

## 0:00-0:25 - Problem

"Semiconductor fabs and chemical plants cannot treat abnormal maintenance telemetry like ordinary alerts. A weak scrubber, a gas cabinet leak trend, or an overdue relief valve can become safety, uptime, and compliance risk. FabGuard is a TrueForge agent that triages that risk and stops before operational action."

## 0:25-0:55 - Harness

Show TrueForge with `fabguard-maintenance-agent-sandbox` selected.

Say: "The harness is doing the real work: read-only MCP research, sandbox code execution, subagent delegation, persistent session state, and human approval before work-order drafting."

## 0:55-1:35 - Investigation

Prompt:

```text
Investigate sample-data/maintenance_events.csv for semiconductor fab and chemical plant maintenance risk. Run the analysis code, summarize the critical findings, ask subagents to review process safety and fab uptime impact, then pause before drafting work orders.
```

Show the agent reading telemetry and running:

```bash
npm run analyze
npm run recommend
```

Open `reports/risk_triage_report.md`.
Open `reports/recommendation_plan.md`.

## 1:35-2:15 - Why It Matters

Point to examples:

- Silane gas cabinet leak trend.
- Arsine vacuum pump vibration.
- Hydrofluoric-acid wet-bench exhaust loss.
- Overdue propane relief valve inspection.

Explain that the agent ties findings to OSHA PSM mechanical integrity, EPA RMP prevention, and SEMI EH&S context.
Show that the recommendation engine separates risk scoring from action selection: failure mode, evidence to collect, confidence, time horizon, escalation path, and safety constraints.

## 2:15-2:45 - Approval Gate

Show the agent pausing before work-order drafting.

Approve only the draft step:

```text
Approved: draft work orders for high and critical findings only.
```

Show:

```bash
npm run draft-workorders:approved
npm run dashboard
```

Then open `reports/work_orders_draft.csv`.
Then open `reports/fabguard-console.html`.

## 2:45-3:00 - Qodo

Show the GitHub PR reviewed by Qodo and the README `Qodo Code Review Evidence` section.

Close with: "This is a narrow, auditable industrial maintenance workflow that uses TrueForge as the actual control layer, not just a chat UI."
