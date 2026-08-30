# GitHub And Qodo Handoff

1. Create a public GitHub repository named `fabguard-maintenance-agent`.
2. Push `main`.
3. Push `feature/risk-engine`.
4. Install Qodo for the repository: Qodo > Integrations > SaaS > GitHub > Add installation.
5. Open a PR from `feature/risk-engine` into `main`.
6. Wait for Qodo. If needed, comment `/agentic_review`.
7. Fix or document Qodo findings.
8. Merge the PR.
9. Paste the merged PR URL and Qodo summary into `README.md` under `## Qodo Code Review Evidence`.

Do not commit API keys, `.env` files, SQLite databases, or local TrueForge logs.

Shortcut from this repo:

```bash
./scripts/push-to-github-and-open-pr.sh
```

This pushes both branches and opens:

```text
https://github.com/ManishikaAgarwal/Agent-Harness-Hackathon/compare/main...feature/risk-engine?quick_pull=1
```

