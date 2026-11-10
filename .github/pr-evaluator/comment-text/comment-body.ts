import { type Finding } from "#evaluator/review-result"
import { COMMENT_BREAK } from "./constants"
import { findingBody } from "./finding-body"

export function commentBody(findings: Finding[]): string {
  return findings.map(findingBody).join(COMMENT_BREAK)
}
