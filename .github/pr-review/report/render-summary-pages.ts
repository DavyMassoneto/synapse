import { type ChangedFile } from "../diff"
import { type ReviewResult } from "../review"
import { PARAGRAPH_BREAK } from "../separators"
import { fillTemplate } from "../templates"
import { SUMMARY_MARKER, TITLE_CONTINUATION } from "./constants"
import { paginate } from "./paginate"
import { partitionFindings } from "./partition-findings"
import { renderLines } from "./render-lines"
import { type RuleLabels } from "./types"

export function renderSummaryPages(result: ReviewResult, labels: RuleLabels, files: ChangedFile[]): string[] {
  const lines = renderLines(result, labels, partitionFindings(result.findings, files))
  return paginate(lines).map((page, index) => {
    const heading = index === 0 ? page : fillTemplate(TITLE_CONTINUATION, [String(index + 1)]) + PARAGRAPH_BREAK + page
    return fillTemplate(SUMMARY_MARKER, [String(index)]) + PARAGRAPH_BREAK + heading
  })
}
