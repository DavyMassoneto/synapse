import { type Finding } from "#evaluator/review-result"
import { CRITERION_LABELS, KIND_LABELS, SECTION_BREAK } from "./constants"

export function findingBody(finding: Finding): string {
  const title = `**${CRITERION_LABELS[finding.criterion]} · ${KIND_LABELS[finding.kind]}** · ${finding.rule}`
  return [title, finding.evidence, `**Impacto:** ${finding.impact}`, `**Correção:** ${finding.fix}`].join(SECTION_BREAK)
}
