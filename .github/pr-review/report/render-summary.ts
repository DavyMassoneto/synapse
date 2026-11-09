import { type ChangedFile } from "../diff"
import { type Finding, type ReviewResult, VERDICT_FAILURE } from "../review"
import { LIST_SEPARATOR, PARAGRAPH_BREAK } from "../separators"
import { fillTemplate } from "../templates"
import {
  BULLET_LOCATED,
  COUNT_ENTRY,
  HEADER_GENERAL,
  HEADER_OUTSIDE,
  LINE_ANCHORED,
  LINE_COUNTS,
  LINE_FAILURE,
  LINE_NO_FINDINGS,
  LINE_VERDICT,
  SUMMARY_MARKER,
  TITLE,
  TITLE_CONTINUATION,
} from "./constants"
import { labelOf, type RuleLabels } from "./labels"
import { paginate } from "./paginate"
import { type Partition, partitionFindings } from "./placement"
import { renderBullet } from "./render-bullets"

export function renderSummaryPages(result: ReviewResult, labels: RuleLabels, files: ChangedFile[]): string[] {
  const lines = renderLines(result, labels, partitionFindings(result.findings, files))
  return paginate(lines).map((page, index) => {
    const heading = index === 0 ? page : fillTemplate(TITLE_CONTINUATION, [String(index + 1)]) + PARAGRAPH_BREAK + page
    return fillTemplate(SUMMARY_MARKER, [String(index)]) + PARAGRAPH_BREAK + heading
  })
}

export function renderLines(result: ReviewResult, labels: RuleLabels, partition: Partition): string[] {
  const lines = [TITLE, fillTemplate(LINE_VERDICT, [result.verdict])]
  if (result.findings.length === 0) {
    lines.push(LINE_NO_FINDINGS)
  } else {
    lines.push(fillTemplate(LINE_COUNTS, [String(result.findings.length), countByRule(labels, result.findings)]))
  }
  lines.push(...result.notes)
  if (partition.anchored.length > 0) {
    lines.push(fillTemplate(LINE_ANCHORED, [String(partition.anchored.length)]))
  }
  if (partition.general.length > 0) {
    lines.push(HEADER_GENERAL, ...partition.general.map((finding) => renderBullet(labels, finding)))
  }
  if (partition.outsideDiff.length > 0) {
    lines.push(
      HEADER_OUTSIDE,
      ...partition.outsideDiff.map((finding) =>
        fillTemplate(BULLET_LOCATED, [finding.path, String(finding.line), labelOf(labels, finding.rule), finding.body]),
      ),
    )
  }
  return lines
}

export function countByRule(labels: RuleLabels, findings: Finding[]): string {
  const counts = new Map<string, number>()
  for (const finding of findings) {
    counts.set(finding.rule, readRuleCount(counts, finding.rule) + 1)
  }
  const entries = [...counts.entries()].sort((left, right) => right[1] - left[1])
  return entries
    .map((entry) => fillTemplate(COUNT_ENTRY, [labelOf(labels, entry[0]), String(entry[1])]))
    .join(LIST_SEPARATOR)
}

function readRuleCount(counts: Map<string, number>, rule: string): number {
  const count = counts.get(rule)
  if (count === undefined) {
    return 0
  }
  return count
}

export function renderFailure(reason: string): string {
  const marker = fillTemplate(SUMMARY_MARKER, ["0"])
  return [marker, TITLE, fillTemplate(LINE_VERDICT, [VERDICT_FAILURE]), fillTemplate(LINE_FAILURE, [reason])].join(
    PARAGRAPH_BREAK,
  )
}
