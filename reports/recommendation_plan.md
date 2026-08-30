# FabGuard Recommendation Plan

Generated: 2026-08-30T07:16:30.925Z

Recommendations are decision support only. They do not replace site procedures, engineering judgement, OEM instructions, or regulatory obligations.

## Method

Deterministic RCM/FMEA-style recommendation rules using abnormal condition, consequence severity, detection evidence, maintenance interval, and required approval controls.

## Approval-Gated Recommendations

- REC-E-1002 / GC-04: Verify gas detector calibration and trend, perform leak check at cylinder and valve interfaces, confirm purge/exhaust operation, and isolate per site procedure if the reading is confirmed. Approval path: area owner -> maintenance lead -> process safety/EHS -> operations manager.
- REC-E-1003 / VP-22: Run vibration confirmation, inspect bearing temperature and oil/seal condition, verify exhaust routing to abatement, and plan controlled maintenance before continued high-load operation. Approval path: area owner -> maintenance lead -> process safety/EHS -> operations manager.
- REC-E-1006 / P-204: Confirm leak rate, verify secondary containment and seal flush, inspect seal-face/material compatibility, and draft corrective maintenance with PPE and isolation requirements. Approval path: area owner -> maintenance lead -> process safety/EHS -> operations manager.
- REC-E-1007 / HX-12: Confirm temperature sensor accuracy, inspect flow and fouling indicators, check leak-detection signals, and plan cleaning or isolation based on process-safety review. Approval path: area owner -> maintenance lead -> process safety/EHS -> operations manager.
- REC-E-1008 / PSV-9: Schedule PSV inspection/test, verify set pressure and tag/seal status, review service interval basis, and do not extend the interval without documented engineering approval. Approval path: area owner -> maintenance lead -> process safety/EHS -> operations manager.
- REC-E-1005 / R-101: Validate pressure transmitter and control loop, verify relief path availability, hold startup escalation until the deviation is understood, and document safe operating-limit review. Approval path: area owner -> maintenance lead -> process safety/EHS.
- REC-E-1004 / SCR-08: Confirm pH probe calibration, inspect dosing and recirculation, verify blowdown and reagent supply, and trend outlet conditions before clearing the abatement alarm. Approval path: area owner -> maintenance lead -> process safety/EHS.
- REC-E-1001 / WB-17: Verify exhaust flow instrumentation, inspect damper/fan status, check sash/hood configuration, and hold wet processing if capture is below the site's accepted EHS limit. Approval path: area owner -> maintenance lead -> process safety/EHS.

## Recommendation Register

| Recommendation | Asset | Severity | Class | Horizon | Confidence | Evidence gaps |
| --- | --- | --- | --- | --- | --- | --- |
| REC-E-1002 | GC-04 | CRITICAL | immediate_controlled_intervention | same shift | high (0.89) | gas detector bump/calibration record; local exhaust status; cylinder change log; area alarm history |
| REC-E-1003 | VP-22 | CRITICAL | immediate_controlled_intervention | same shift | high (0.95) | vibration spectrum; bearing temperature; oil/seal condition; abatement connection status |
| REC-E-1006 | P-204 | CRITICAL | immediate_controlled_intervention | same shift | high (0.95) | seal leak measurement; seal flush pressure; containment inspection; materials compatibility record |
| REC-E-1007 | HX-12 | CRITICAL | immediate_controlled_intervention | same shift | high (0.95) | temperature sensor check; flow trend; differential pressure; leak detection status |
| REC-E-1008 | PSV-9 | CRITICAL | immediate_controlled_intervention | same shift | high (0.95) | last PSV test certificate; set pressure record; seal/tag inspection; inspection interval basis |
| REC-E-1005 | R-101 | HIGH | priority_inspection | 24 hours | high (0.83) | pressure transmitter check; control-loop trend; relief path status; startup batch record |
| REC-E-1004 | SCR-08 | HIGH | priority_inspection | 24 hours | high (0.85) | pH probe calibration; reagent tank level; recirculation pump amps; scrubber differential pressure |
| REC-E-1001 | WB-17 | HIGH | priority_inspection | 24 hours | high (0.93) | exhaust balance reading; hood/sash configuration; fan and damper status; acid service PM history |
| REC-E-1009 | CMP-03 | MEDIUM | planned_maintenance_review | next planned access window | high (0.85) | motor current trend; wafer load; pad conditioning log; slurry flow record |
| REC-E-1010 | BLR-02 | MEDIUM | planned_maintenance_review | next planned access window | high (0.79) | oxygen analyzer calibration; burner trim trend; flame scanner status; fuel gas pressure trend |
| REC-E-1012 | TK-07 | LOW | watchlist | routine PM cycle | low (0.43) | level trend; closed work-order notes; routine tank inspection |
| REC-E-1011 | CH-14 | LOW | watchlist | routine PM cycle | low (0.43) | temperature calibration; supply/return trend; PM checklist |

## Controls Applied

- Do not treat the recommendation as authorization to operate, isolate, or restart equipment.
- Use site lockout/tagout, PPE, line-breaking, hot-work, and confined-space procedures where applicable.
- Use management-of-change review if the corrective action changes equipment, process chemistry, controls, alarm limits, procedures, or inspection intervals.
- Correct confirmed deficiencies outside acceptable limits before further use, or document protective measures that assure safe operation until correction.
