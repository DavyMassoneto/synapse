import { type ChangedFile } from "../diff"
import { publishSummary, replaceInlineComments } from "../github"
import { buildLabels, groupByLine, partitionFindings, renderInline, renderSummaryPages } from "../report"
import { type ReviewResult } from "../review"
import { type RuleGroup } from "../rules"
import { type Execution } from "./types"

export async function publishReview(
  execution: Execution,
  groups: RuleGroup[],
  files: ChangedFile[],
  result: ReviewResult,
): Promise<void> {
  const labels = buildLabels(groups)
  const anchored = partitionFindings(result.findings, files).anchored
  const inline = groupByLine(anchored).map((group) => ({
    path: group.path,
    line: group.line,
    body: renderInline(labels, group),
  }))
  await replaceInlineComments(execution.ports.runner, execution.settings, inline)
  await publishSummary(execution.ports.runner, execution.settings, renderSummaryPages(result, labels, files))
}
