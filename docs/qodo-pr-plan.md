# Qodo PR Plan

Use this PR trail so judges can see real code-review practice.

## Main Branch

Initial commit:

- README
- TrueForge agent manifests
- sample telemetry
- setup scripts
- docs

## Feature PR

Branch: `feature/risk-engine`

Title: `Add industrial maintenance risk engine`

Description:

```markdown
## What

Adds the FabGuard maintenance scoring engine, report generation, approval-gated work-order drafting, and tests.

## Why

The TrueForge hackathon requires the harness to do real work. This gives the agent a concrete semiconductor/chemical maintenance workflow with sandboxed analysis and a human approval gate before work orders.

## Validation

- npm test
- npm run analyze
- npm run draft-workorders
```

After opening the PR, Qodo should review automatically. If it does not, comment:

```text
/agentic_review
```

Resolve valid High findings. For any finding you intentionally dismiss, reply in the Qodo thread with the reason.

## Exact PR URL

After pushing both branches, open:

```text
https://github.com/ManishikaAgarwal/Agent-Harness-Hackathon/compare/main...feature/risk-engine?quick_pull=1
```

Use the repository PR template and paste `/agentic_review` if Qodo does not start.

