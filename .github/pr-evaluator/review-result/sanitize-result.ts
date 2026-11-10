import { INVISIBLE_PATTERN } from "./constants"
import { type ReviewResult } from "./types"

export function sanitizeResult(result: ReviewResult): ReviewResult {
  return {
    ...result,
    findings: result.findings.map((finding) => ({ ...finding, path: finding.path.replace(INVISIBLE_PATTERN, "") })),
  }
}
