# FabGuard Maintenance Agent

FabGuard is a TrueForge agent starter for semiconductor fab and chemical plant maintenance triage. It investigates abnormal equipment telemetry, scores maintenance risk, cites the safety basis, and stops before creating work-order drafts unless a human approves the action.

The project is tuned for the TrueForge hackathon brief: a real agent harness, read-only MCP research, generated analysis code in a sandbox, subagent-style specialist review, session continuity, generative/operator UI, and an approval gate before anything irreversible.

## What It Does

- Reads sample telemetry from wet benches, gas cabinets, scrubbers, vacuum pumps, reactors, pumps, heat exchangers, relief valves, and utilities.
- Scores risk using material hazard, equipment criticality, out-of-range deviation, preventive-maintenance age, and work-order state.
- Generates scientifically grounded maintenance recommendations using deterministic RCM/FMEA-style rules, evidence gaps, confidence levels, escalation paths, and approval requirements.
- Produces a Markdown triage report and JSON evidence file.
- Drafts work orders only when the `--approved` flag is present.
- Seeds two TrueForge agents: `fabguard-maintenance-agent` and `fabguard-maintenance-agent-sandbox`.

## Why This Can Win

This is not a generic chatbot. It is a narrow industrial maintenance workflow where the harness is visibly doing the job:

- MCP: research public standards and equipment references with read-only tools.
- Sandbox: run generated analysis code against telemetry.
- Approval: hold before drafting work orders.
- Subagents: process-safety reviewer, fab-uptime analyst, and maintenance planner are explicit agent roles.
- Code quality: the repo is structured for Qodo-reviewed pull requests.

## Quick Start

```bash
npm test
npm run analyze
npm run recommend
npm run draft-workorders
npm run dashboard
npm run setup:trueforge
```

The `draft-workorders` command intentionally stops at the approval gate. After a qualified human approves the exact proposed actions, the agent must write a `.trueforge/approval.json` record containing `approved`, `approval_source`, `approver`, `approved_at`, `scope`, and the approved finding IDs, then run `npm run draft-workorders:approved -- --approval-file .trueforge/approval.json` to create the draft CSV.

First launch TrueForge from a normal Terminal so it initializes the project-local database:

```bash
./start-trueforge.sh
```

In a second Terminal, set `GEMINI_API_KEY` in the environment and run `npm run setup:trueforge` to seed the agents and read-only MCP configuration. Never put the key in the repository.

In TrueForge, choose `fabguard-maintenance-agent-sandbox` and try:

```text
Investigate sample-data/maintenance_events.csv for semiconductor fab and chemical plant maintenance risk. Run the analysis code, summarize the critical findings, ask subagents to review process safety and fab uptime impact, then pause before drafting work orders.
```

After it pauses, approve the draft-work-order step:

```text
Approved: draft work orders for the high and critical findings only.
```

## Outputs

- `reports/risk_triage_report.md`: human-readable triage.
- `reports/risk_triage.json`: machine-readable evidence.
- `reports/recommendation_plan.md`: recommendation engine output with action class, confidence, evidence gaps, escalation path, and safety constraints.
- `reports/recommendation_plan.json`: machine-readable recommendation plan.
- `reports/work_orders_draft.csv`: generated only after approval.
- `reports/fabguard-console.html`: local operator-console view for the demo.
- `docs/research-brief.md`: source-backed TrueForge and industrial-maintenance fit notes.

## Research Accuracy

The implementation is deliberately framed as maintenance decision support, not autonomous compliance or plant control.

- TrueForge/TrueFoundry relevance: TrueForge is an open-source agent harness for model calls, MCP tools, skills, sandboxing, approvals, context management, session state, chat UI, API, and SDK.
- Hackathon relevance: the required demo needs the harness visibly doing real work: a tool reached, code run in the sandbox, and a pause before irreversible action. The UI track specifically rewards showing what the agent did, what it is doing, and what it is waiting on.
- Chemical maintenance relevance: OSHA PSM mechanical integrity covers pressure vessels, tanks, piping, relief/vent systems, controls, alarms, interlocks, and pumps; it emphasizes inspection/testing, documentation, and correcting deficiencies outside acceptable limits.
- Chemical accident-prevention relevance: EPA RMP prevention programs include safety precautions, maintenance, monitoring, and employee training.
- Semiconductor relevance: SEMI EH&S/S2 guidance is explicitly about semiconductor manufacturing equipment safety, including exhaust ventilation, fire protection/risk, equipment safety, and worker protection.
- Recommendation-science relevance: recommendations are rule-based, not hallucinated. They follow reliability-centered maintenance logic, FMEA-style failure-mode mapping, evidence collection, escalation paths, and explicit operational constraints.

## Safety Scope

FabGuard is decision support only. It must not be treated as an operational authority. A qualified maintenance, process safety, and EHS owner must approve any plant or fab action.

The safety framing is based on public guidance from:

- [OSHA PSM 1910.119](https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.119)
- [EPA RMP overview](https://www.epa.gov/rmp/risk-management-program-rmp-rule-overview)
- [SEMI Environmental, Health, and Safety Standards](https://www.semi.org/en/node/114001)
- [TrueForge docs](https://trueforge.dev/quickstart)
- [TrueForge GitHub](https://github.com/truefoundry/trueforge)

## Qodo Code Review Evidence

Complete this section after the Qodo-reviewed PR is merged:

- Representative merged PR: `<paste PR URL here>`
- Qodo finding summary: `<what Qodo found, what was changed, and what was intentionally dismissed>`
- Follow-up review evidence: `<paste final Qodo-reviewed PR status or thread note>`

The hackathon requires substantive changes to go through GitHub PRs reviewed by Qodo. Direct pushes to main do not count.

## Demo Checklist

1. Open TrueForge and show the selected `fabguard-maintenance-agent-sandbox`.
2. Show MCP tools configured read-only.
3. Ask the agent to inspect `sample-data/maintenance_events.csv`.
4. Show it running analysis code and producing `reports/risk_triage_report.md`.
5. Show it generating `reports/recommendation_plan.md`.
6. Show the approval pause before work orders.
7. Approve work-order drafting and show `reports/work_orders_draft.csv`.
8. Open `reports/fabguard-console.html` to show the operator-console view.
9. Show the Qodo-reviewed PR linked in this README.
