#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { generateRecommendations, writeRecommendationPlan } from "./recommendation-engine.mjs";

const [inputPath, markdownPath, jsonPath] = process.argv.slice(2);

if (!inputPath || !markdownPath || !jsonPath) {
  console.error("Usage: node src/recommend-maintenance.mjs <risk_triage.json> <recommendations.md> <recommendations.json>");
  process.exit(1);
}

const analysis = JSON.parse(readFileSync(inputPath, "utf8"));
const plan = generateRecommendations(analysis);
writeRecommendationPlan(plan, markdownPath, jsonPath);

console.log(`Generated ${plan.recommendations.length} maintenance recommendations.`);
console.log(`Approval-gated: ${plan.approval_queue_count}`);
console.log(`Recommendation plan written: ${markdownPath}, ${jsonPath}`);

