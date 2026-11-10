import { applyLine, createState, type DiffState } from "../position-tracking"
import { classifyLine } from "./classify-line"
import { DIFF_LINE_BREAK } from "./constants"
import { renderLine } from "./render-line"
import { type AnnotatedDiff } from "./types"

function annotateLine(state: DiffState, line: string): string {
  const kind = classifyLine(state, line)
  const position = applyLine(state, kind, line)
  return renderLine(position, line)
}

export function annotateDiff(diff: string): AnnotatedDiff {
  const state = createState()
  const annotated: string[] = []
  for (const line of diff.split(DIFF_LINE_BREAK)) {
    annotated.push(annotateLine(state, line))
  }
  return { text: annotated.join(DIFF_LINE_BREAK), lines: state.lines }
}
