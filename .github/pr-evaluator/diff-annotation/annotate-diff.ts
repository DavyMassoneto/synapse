import { DIFF_LINE_BREAK } from "./constants"
import { createState, trackLine } from "./position-tracking"
import { renderLine } from "./render-line"
import { type AnnotatedDiff } from "./types"

export function annotateDiff(diff: string): AnnotatedDiff {
  const state = createState()
  const annotated: string[] = []
  for (const line of diff.split(DIFF_LINE_BREAK)) {
    annotated.push(renderLine(trackLine(state, line), line))
  }
  return { text: annotated.join(DIFF_LINE_BREAK), lines: state.lines }
}
