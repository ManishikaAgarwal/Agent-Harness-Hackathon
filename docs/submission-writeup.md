# Submission Writeup Draft

## Project

FabGuard Maintenance Agent

## What It Does

FabGuard triages maintenance telemetry from semiconductor fab and chemical plant assets. It identifies abnormal signals, scores operational risk, links findings to public safety-program principles, and drafts work orders only after explicit approval.

It also includes a deterministic recommendation engine that maps abnormal conditions to failure modes, evidence to collect, confidence, time horizon, escalation path, and safety constraints.

## Why It Matters

Industrial maintenance teams lose time separating ordinary alarms from maintenance issues that can affect safety, uptime, or environmental controls. FabGuard gives the team an auditable first pass without bypassing human authority.

## How TrueForge Is Used

- MCP tools provide read-only research access.
- The sandbox runs generated analysis code.
- Dynamic subagents split process safety, fab uptime, and maintenance planning review.
- The session records the investigation.
- The approval gate prevents draft work-order generation until a person approves.

## How Qodo Was Used

Substantive code changes were made on `feature/risk-engine` and reviewed through a GitHub PR with Qodo before merge. The README contains the final Qodo evidence link.

## Safety

FabGuard is decision support only. A qualified maintenance, process safety, and EHS owner must approve plant or fab actions.
