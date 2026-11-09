import { type Finding } from "#synapse/review"

export const FINDING_ON_ADDED: Finding = { rule: "C01", path: "src/a.ts", line: 11, body: "problema" }
export const FINDING_OFF_DIFF: Finding = { rule: "C03", path: "src/a.ts", line: 99, body: "fora" }
export const FINDING_GENERAL: Finding = { rule: "E01", path: "PR", line: 0, body: "descricao falsa" }
export const RULE_IDS = ["C01", "C03", "E01"]
