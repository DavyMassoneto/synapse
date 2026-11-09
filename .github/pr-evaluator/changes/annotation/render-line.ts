import { type LinePosition } from "../cursor"

export function renderLine(position: LinePosition, line: string): string {
  if (position.kind === "left") {
    return `L${position.line} ${line}`
  }
  if (position.kind === "right") {
    return `R${position.line} ${line}`
  }
  return line
}
