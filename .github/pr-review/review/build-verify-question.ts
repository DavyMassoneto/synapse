import { LINE_BREAK } from "../separators"
import { fillTemplate } from "../templates"
import { VERIFY_LINE, VERIFY_QUESTION } from "./constants"
import { type Finding } from "./types"

export function buildVerifyQuestion(findings: Finding[]): string {
  const lines = findings.map((finding, index) =>
    fillTemplate(VERIFY_LINE, [String(index + 1), finding.rule, finding.path, String(finding.line), finding.body]),
  )
  return [VERIFY_QUESTION, ...lines].join(LINE_BREAK)
}
