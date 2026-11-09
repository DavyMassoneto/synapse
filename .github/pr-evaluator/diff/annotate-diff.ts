import { annotateLine } from "./annotate-line"
import { LINE_BREAK } from "./constants"
import { createState } from "./state"
import { type AnnotatedDiff } from "./types"

export function annotateDiff(diff: string): AnnotatedDiff {
  const state = createState()
  const text = diff
    .split(LINE_BREAK)
    .map((line) => annotateLine(state, line))
    .join(LINE_BREAK)
  return { text, lines: state.lines }
}
