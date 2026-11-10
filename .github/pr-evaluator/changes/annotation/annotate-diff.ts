import { createState } from "../cursor"
import { annotateLine } from "./annotate-line"
import { LINE_BREAK } from "./constants"
import { type AnnotatedDiff } from "./types"

export function annotateDiff(diff: string): AnnotatedDiff {
  const state = createState()
  const annotated: string[] = []
  for (const line of diff.split(LINE_BREAK)) {
    annotated.push(annotateLine(state, line))
  }
  return { text: annotated.join(LINE_BREAK), lines: state.lines }
}
