import { type Finding } from "#evaluator/review-result"
import { COMMENT_BREAK, SECTION_BREAK } from "./constants"
import { findingLabel } from "./finding-label"

function findingBody(finding: Finding): string {
  const title = `**${findingLabel(finding)}** · ${finding.rule}`
  return [title, finding.evidence, `**Impacto:** ${finding.impact}`, `**Correção:** ${finding.fix}`].join(SECTION_BREAK)
}

export function commentBody(findings: Finding[]): string {
  return findings.map(findingBody).join(COMMENT_BREAK)
}
