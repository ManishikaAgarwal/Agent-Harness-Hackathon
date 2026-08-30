import assert from "node:assert/strict";
import { writeFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
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

const malformedPath = join(mkdtempSync(join(tmpdir(), "fabguard-malformed-")), "bad.csv");
writeFileSync(
  malformedPath,
  "event_id,asset_id,site,industry,equipment_type,process_material,material_class,metric,unit,value,normal_min,normal_max,days_since_pm,work_order_status\n" +
    "BAD-1,A-1,Site,chemical,process pump,water,nonhazardous,pressure,bar,not-a-number,2,1,5,none\n"
);
assert.throws(() => loadEvents(malformedPath), /non-finite value/);

console.log("risk-engine tests passed");
