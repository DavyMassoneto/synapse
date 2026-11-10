import { type Finding } from "#evaluator/review-result"
import { findingLabel } from "../comment-text"

export function unplacedItem(finding: Finding): string {
  const location = `\`${finding.path}:${finding.line}\``
  return `- ${location} (${findingLabel(finding)}, ${finding.rule}): ${finding.evidence} Correção: ${finding.fix}`
}
