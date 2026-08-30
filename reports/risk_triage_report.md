# FabGuard Maintenance Risk Triage

Generated: 2026-08-30T07:46:02.991Z

Decision support only. A qualified maintenance, process safety, and EHS owner must approve any operational action.

## Executive Snapshot

- Critical findings: 5
- High findings: 3
- Medium findings: 2
- Low findings: 2
- Approval gate: work orders are draft-only and require explicit human approval.

## Priority Findings

| Rank | Severity | Score | Site | Asset | Finding | Recommended action |
| ---: | --- | ---: | --- | --- | --- | --- |
| 1 | CRITICAL | 100 | Fab A | GC-04 | leak_ppm above normal band: 1.2 ppm outside 0-0.2 | Escalate to maintenance, process safety/EHS, and area owner immediately; verify containment and consider controlled isolation. Confirm GC-04 gas cabinet instrumentation, inspect the failure mode behind leak_ppm=1.2ppm, document acceptance criteria, and do not close the action until a qualified owner approves return to service. |
| 2 | CRITICAL | 100 | Fab B | VP-22 | vibration_mm_s above normal band: 9.8 mm/s outside 0-4.5 | Escalate to maintenance, process safety/EHS, and area owner immediately; verify containment and consider controlled isolation. Confirm VP-22 vacuum pump instrumentation, inspect the failure mode behind vibration_mm_s=9.8mm/s, document acceptance criteria, and do not close the action until a qualified owner approves return to service. |
| 3 | CRITICAL | 96 | Plant C | P-204 | seal_leak_ml_min above normal band: 28 ml/min outside 0-5 | Escalate to maintenance, process safety/EHS, and area owner immediately; verify containment and consider controlled isolation. Confirm P-204 process pump instrumentation, inspect the failure mode behind seal_leak_ml_min=28ml/min, document acceptance criteria, and do not close the action until a qualified owner approves return to service. |
| 4 | CRITICAL | 95 | Plant D | HX-12 | outlet_temp_c above normal band: 92 C outside 35-70 | Escalate to maintenance, process safety/EHS, and area owner immediately; verify containment and consider controlled isolation. Confirm HX-12 heat exchanger instrumentation, inspect the failure mode behind outlet_temp_c=92C, document acceptance criteria, and do not close the action until a qualified owner approves return to service. |
| 5 | CRITICAL | 88 | Plant D | PSV-9 | inspection_due_days below normal band: -45 days outside 0-365 | Escalate to maintenance, process safety/EHS, and area owner immediately; verify containment and consider controlled isolation. Confirm PSV-9 relief valve instrumentation, inspect the failure mode behind inspection_due_days=-45days, document acceptance criteria, and do not close the action until a qualified owner approves return to service. |
| 6 | HIGH | 81 | Plant C | R-101 | pressure_bar above normal band: 12.9 bar outside 6-10 | Schedule priority inspection with maintenance and area owner; keep monitoring trend until cleared. Confirm R-101 reactor instrumentation, inspect the failure mode behind pressure_bar=12.9bar, document acceptance criteria, and do not close the action until a qualified owner approves return to service. |
| 7 | HIGH | 78 | Fab B | SCR-08 | scrubber_ph below normal band: 3.1 pH outside 6.5-8.5 | Schedule priority inspection with maintenance and area owner; keep monitoring trend until cleared. Confirm SCR-08 scrubber instrumentation, inspect the failure mode behind scrubber_ph=3.1pH, document acceptance criteria, and do not close the action until a qualified owner approves return to service. |
| 8 | HIGH | 74 | Fab A | WB-17 | exhaust_flow_cfm below normal band: 410 cfm outside 550-750 | Schedule priority inspection with maintenance and area owner; keep monitoring trend until cleared. Confirm WB-17 wet bench instrumentation, inspect the failure mode behind exhaust_flow_cfm=410cfm, document acceptance criteria, and do not close the action until a qualified owner approves return to service. |
| 9 | MEDIUM | 53 | Fab A | CMP-03 | motor_current_amp above normal band: 72 A outside 20-55 | Add to maintenance review queue, verify trend source, and inspect during the next planned access window. Confirm CMP-03 CMP polisher instrumentation, inspect the failure mode behind motor_current_amp=72A, document acceptance criteria, and do not close the action until a qualified owner approves return to service. |
| 10 | MEDIUM | 50 | Plant C | BLR-02 | stack_o2_pct below normal band: 2.1 % outside 3-6 | Add to maintenance review queue, verify trend source, and inspect during the next planned access window. Confirm BLR-02 boiler instrumentation, inspect the failure mode behind stack_o2_pct=2.1%, document acceptance criteria, and do not close the action until a qualified owner approves return to service. |
| 11 | LOW | 28 | Plant D | TK-07 | level_pct within normal band: 84 % inside 20-90 | No immediate intervention recommended; retain in watchlist and review during routine maintenance. Confirm TK-07 storage tank instrumentation, inspect the failure mode behind level_pct=84%, document acceptance criteria, and do not close the action until a qualified owner approves return to service. |
| 12 | LOW | 14 | Fab B | CH-14 | supply_temp_c within normal band: 20.2 C inside 19.5-20.5 | No immediate intervention recommended; retain in watchlist and review during routine maintenance. Confirm CH-14 chiller instrumentation, inspect the failure mode behind supply_temp_c=20.2C, document acceptance criteria, and do not close the action until a qualified owner approves return to service. |

## Immediate Approval Queue

- CRITICAL GC-04: approve a controlled maintenance work order only after area owner and EHS review. Source event E-1002.
- CRITICAL VP-22: approve a controlled maintenance work order only after area owner and EHS review. Source event E-1003.
- CRITICAL P-204: approve a controlled maintenance work order only after area owner and EHS review. Source event E-1006.
- CRITICAL HX-12: approve a controlled maintenance work order only after area owner and EHS review. Source event E-1007.
- CRITICAL PSV-9: approve a controlled maintenance work order only after area owner and EHS review. Source event E-1008.
- HIGH R-101: approve a controlled maintenance work order only after area owner and EHS review. Source event E-1005.
- HIGH SCR-08: approve a controlled maintenance work order only after area owner and EHS review. Source event E-1004.
- HIGH WB-17: approve a controlled maintenance work order only after area owner and EHS review. Source event E-1001.

## Safety Basis Used By Agent

- OSHA PSM 1910.119: mechanical integrity emphasizes documented inspections/tests, suitable frequency, and correction of deficiencies.
- EPA RMP: prevention programs include maintenance, monitoring, safety precautions, training, and emergency response planning.
- SEMI EH&S / S2: semiconductor equipment risk context includes exhaust ventilation, fire protection, equipment safety, and worker protection.
