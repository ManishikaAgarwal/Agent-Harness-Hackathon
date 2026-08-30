#!/usr/bin/env node
import { analyzeEvents, loadEvents, writeReports } from "./risk-engine.mjs";

const [inputPath, markdownPath, jsonPath] = process.argv.slice(2);

if (!inputPath || !markdownPath || !jsonPath) {
  console.error("Usage: node src/analyze-maintenance.mjs <input.csv> <report.md> <report.json>");
  process.exit(1);
}

const events = loadEvents(inputPath);
const analysis = analyzeEvents(events);
writeReports(analysis, markdownPath, jsonPath);

console.log(`Analyzed ${events.length} maintenance events.`);
console.log(`Critical: ${analysis.counts.critical}, High: ${analysis.counts.high}, Medium: ${analysis.counts.medium}, Low: ${analysis.counts.low}`);
console.log(`Reports written: ${markdownPath}, ${jsonPath}`);

