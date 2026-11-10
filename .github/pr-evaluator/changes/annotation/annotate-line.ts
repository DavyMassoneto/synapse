import { applyLine, type DiffState } from "../position-tracking"
import { classifyLine } from "./classify-line"
import { renderLine } from "./render-line"

export function annotateLine(state: DiffState, line: string): string {
  const kind = classifyLine(state, line)
  const position = applyLine(state, kind, line)
  return renderLine(position, line)
}
