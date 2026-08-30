import assert from "node:assert/strict";
import { analyzeEvents, loadEvents } from "../src/risk-engine.mjs";
import { generateRecommendations } from "../src/recommendation-engine.mjs";

const samplePath = new URL("../sample-data/maintenance_events.csv", import.meta.url);
const plan = generateRecommendations(analyzeEvents(loadEvents(samplePath)));
const gasCabinet = plan.recommendations.find((rec) => rec.asset_id === "GC-04");
const chiller = plan.recommendations.find((rec) => rec.asset_id === "CH-14");
const reliefValve = plan.recommendations.find((rec) => rec.asset_id === "PSV-9");
const cmp = plan.recommendations.find((rec) => rec.asset_id === "CMP-03");

assert.equal(plan.recommendations.length, 12);
assert.equal(gasCabinet.action_class, "immediate_controlled_intervention");
assert.equal(gasCabinet.approval_required, true);
assert.equal(gasCabinet.confidence, "high");
assert.ok(gasCabinet.scientific_basis.some((basis) => basis.includes("FMEA")));
assert.ok(gasCabinet.recommendation.includes("detector calibration"));
assert.ok(reliefValve.evidence_to_collect.includes("last PSV test certificate"));
assert.ok(cmp.recommendation.includes("slurry delivery"));
assert.equal(chiller.action_class, "watchlist");
assert.equal(chiller.approval_required, false);

console.log("recommendation-engine tests passed");
