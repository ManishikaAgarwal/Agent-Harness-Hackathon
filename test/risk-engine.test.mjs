import assert from "node:assert/strict";
import { analyzeEvents, loadEvents, scoreEvent } from "../src/risk-engine.mjs";

const samplePath = new URL("../sample-data/maintenance_events.csv", import.meta.url);
const events = loadEvents(samplePath);
const analysis = analyzeEvents(events);
const silaneLeak = scoreEvent(events.find((event) => event.event_id === "E-1002"));
const chiller = scoreEvent(events.find((event) => event.event_id === "E-1011"));

assert.equal(events.length, 12);
assert.equal(silaneLeak.severity, "critical");
assert.ok(silaneLeak.score >= 85);
assert.ok(silaneLeak.basis.some((basis) => basis.includes("SEMI")));
assert.ok(analysis.counts.critical >= 4);
assert.ok(analysis.counts.high >= 1);
assert.equal(chiller.severity, "low");
assert.equal(analysis.findings[0].severity, "critical");

console.log("risk-engine tests passed");

