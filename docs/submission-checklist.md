# Submission Checklist

- [ ] Public GitHub repo exists.
- [ ] Qodo installed on the repo.
- [ ] `feature/risk-engine` PR reviewed by Qodo.
- [ ] README `Qodo Code Review Evidence` filled with the merged PR link.
- [ ] `npm test` passes.
- [ ] `npm run analyze` generates the triage report.
- [ ] `npm run recommend` generates the recommendation plan.
- [ ] `npm run draft-workorders:approved` is shown only after explicit approval; the default command remains gated.
- [ ] `npm run dashboard` generates the operator console.
- [ ] TrueForge launches with `./start-trueforge.sh`.
- [ ] Demo shows MCP/read-only tools, sandbox code execution, subagents, session continuity, and approval gate.
- [ ] Demo is around three minutes.
- [ ] No API keys, personal data, or private plant data are in the repo or video.
