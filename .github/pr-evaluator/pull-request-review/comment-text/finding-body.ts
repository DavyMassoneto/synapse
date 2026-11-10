import { type Finding } from "#evaluator/review-result"
import { SECTION_BREAK } from "./constants"
import { findingLabel } from "./finding-label"

export function findingBody(finding: Finding): string {
  const title = `**${findingLabel(finding)}** · ${finding.rule}`
  return [title, finding.evidence, `**Impacto:** ${finding.impact}`, `**Correção:** ${finding.fix}`].join(SECTION_BREAK)
}
