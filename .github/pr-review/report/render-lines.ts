import { type ReviewResult } from "../review"
import { fillTemplate } from "../templates"
import {
  HEADER_GENERAL,
  HEADER_OUTSIDE,
  LINE_ANCHORED,
  LINE_COUNTS,
  LINE_NO_FINDINGS,
  LINE_VERDICT,
  TITLE,
} from "./constants"
import { countByRule } from "./count-by-rule"
import { renderBullet, renderLocatedBullet } from "./render-bullet"
import { type Partition, type RuleLabels } from "./types"

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
    lines.push(HEADER_OUTSIDE, ...partition.outsideDiff.map((finding) => renderLocatedBullet(labels, finding)))
  }
  return lines
}
