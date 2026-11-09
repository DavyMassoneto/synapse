import { applyLine, createState } from "../cursor"
import { classifyLine } from "./classify-line"
import { LINE_BREAK } from "./constants"
import { renderLine } from "./render-line"
import { type AnnotatedDiff } from "./types"

export function annotateDiff(diff: string): AnnotatedDiff {
  const state = createState()
  const text = diff
    .split(LINE_BREAK)
    .map((line) => renderLine(applyLine(state, classifyLine(state, line), line), line))
    .join(LINE_BREAK)
  return { text, lines: state.lines }
}
