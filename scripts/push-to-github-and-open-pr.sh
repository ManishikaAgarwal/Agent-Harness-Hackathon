#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/ManishikaAgarwal/Agent-Harness-Hackathon.git"
COMPARE_URL="https://github.com/ManishikaAgarwal/Agent-Harness-Hackathon/compare/main...feature/risk-engine?quick_pull=1"

git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"

git push -u origin main
git push -u origin feature/risk-engine

if command -v gh >/dev/null 2>&1; then
  gh pr create \
    --base main \
    --head feature/risk-engine \
    --title "Add FabGuard industrial maintenance agent" \
    --body-file .github/pull_request_template.md || true
else
  echo "GitHub CLI not found. Opening the GitHub compare page instead."
fi

if command -v open >/dev/null 2>&1; then
  open "$COMPARE_URL"
else
  echo "$COMPARE_URL"
fi

cat <<'NOTE'

After the PR opens:
1. Install/confirm Qodo for this repo.
2. If Qodo does not start automatically, comment:

   /agentic_review

3. Resolve valid findings.
4. Merge the PR.
5. Paste the merged PR link and Qodo summary into README.md under "Qodo Code Review Evidence".

NOTE

