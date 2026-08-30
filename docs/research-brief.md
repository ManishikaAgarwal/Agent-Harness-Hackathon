# Research Brief

This project is intentionally scoped around what TrueForge and the hackathon actually reward: a narrow agentic workflow where the harness is visible, useful, and safety-aware.

## TrueForge / TrueFoundry Fit

- TrueForge is TrueFoundry's open-source agent harness. Its README describes it as the runtime layer for model calls, MCP tools, skills, sandboxing, approvals, context management, and session state.
- Local quickstart is `npx @truefoundry/trueforge@latest`, with the app available at `http://localhost:8790`. Local mode uses SQLite and is meant for localhost/personal use.
- The agent spec supports `model`, `instructions`, `mcp_servers`, `skills`, and `config`. Skills require sandboxing. Tool approval can pause on write/destructive tools.
- Harness capabilities relevant to this project: sandbox-as-tool, dynamic subagents, deferred tool loading, large-result offloading, compaction, tool approval, ask-user questions, and generative UI.
- The UI SDK/chat UI can browse agents, stream responses, show tool calls, support approval workflows, manage settings, and embed the same experience in a React app.

## Hackathon Fit

- The Best Use of TrueForge track rewards real MCP tools, generated code running in a sandbox, human approval before irreversible actions, subagents, and session continuity.
- The Best UI track rewards an interface that shows what the agent is doing, what it is waiting on, what it did, and asks before the irreversible step.
- Qodo review is required for every submission. Direct pushes to `main` do not count as reviewed work; the README needs `## Qodo Code Review Evidence`.

## Industrial Maintenance Fit

- OSHA PSM 1910.119 covers prevention/minimization of catastrophic releases involving toxic, reactive, flammable, or explosive chemicals. Its mechanical-integrity section covers pressure vessels/tanks, piping, relief/vent systems, emergency shutdown systems, controls/sensors/alarms/interlocks, and pumps.
- OSHA mechanical integrity also emphasizes written maintenance procedures, maintenance training, inspection/testing using recognized and generally accepted good engineering practices, documentation, and correction of equipment deficiencies outside acceptable limits.
- EPA RMP requires covered facilities to address accident effects, prevention steps, and emergency response. Prevention programs include safety precautions, maintenance, monitoring, and employee training.
- SEMI EH&S standards are relevant for semiconductor equipment safety. SEMI describes S2 as the Environmental, Health, and Safety Guideline for Semiconductor Manufacturing Equipment, with topics including equipment safety, exhaust ventilation, fire risk assessment, and worker protection.
- SEMI S2-0724 was published in July 2024 and includes revisions touching high-pressure systems, equipment decommissioning, fire protection, flammable substances, energetic materials, lifting equipment, hinged loads, and safety labels.
- Reliability-centered maintenance is relevant because it selects maintenance tasks that reduce failure probability or consequence for the intended function while balancing proactive and reactive work. This project uses that as a recommendation logic, not as a claim of automated reliability certification.
- FMEA-style reasoning is relevant because OSHA's PSM text names FMEA as an accepted process hazard analysis methodology. This project uses a lightweight failure-mode mapping to keep recommendations explainable.

## Design Consequence

FabGuard should not claim to be a compliance engine or autonomous plant controller. The right position is decision support: triage abnormal telemetry, produce evidence, cite the safety basis, and pause before work-order drafting so qualified maintenance, process safety, and EHS owners remain in control.
