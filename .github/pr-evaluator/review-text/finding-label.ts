import { type Finding } from "#evaluator/review-result"
import { CRITERION_LABELS, KIND_LABELS } from "./constants"

export function findingLabel(finding: Finding): string {
  return `${CRITERION_LABELS[finding.criterion]} · ${KIND_LABELS[finding.kind]}`
}
