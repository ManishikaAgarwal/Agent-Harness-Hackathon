## What

Adds or changes FabGuard's TrueForge-backed semiconductor and chemical maintenance agent workflow.

## TrueForge Harness Evidence

- [ ] MCP/read-only research path remains documented.
- [ ] Sandbox analysis or recommendation code is used.
- [ ] Agent pauses before work-order drafting or other irreversible action.
- [ ] Dynamic subagent roles remain documented.
- [ ] UI shows what the agent did, what it is waiting on, and the approval gate.

## Scientific / Safety Review

- [ ] Recommendations are decision support, not operational authorization.
- [ ] Chemical-plant framing remains aligned with OSHA PSM mechanical integrity and EPA RMP prevention principles.
- [ ] Semiconductor framing remains aligned with SEMI EH&S / S2 equipment-safety principles.
- [ ] Recommendation logic remains explainable through RCM/FMEA-style failure-mode mapping, evidence gaps, confidence, time horizon, and escalation path.
- [ ] No API keys, plant secrets, personal data, or real customer data are committed.

## Validation

```bash
npm test
npm run analyze
npm run recommend
npm run draft-workorders
npm run dashboard
```

## Qodo

After opening the PR, wait for Qodo review. If it does not start automatically, comment:

```text
/agentic_review
```

