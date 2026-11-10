import { linesOnSide } from "./lines-on-side"
import { type DiffLines, type Side } from "./types"

export function isMultiLine(start: number, end: number): boolean {
  return start < end
}

export function hasEveryLine(lines: Set<number>, start: number, end: number): boolean {
  for (let line = start; line <= end; line += 1) {
    if (!lines.has(line)) {
      return false
    }
  }
  return true
}

export function hasDiffLine(lines: DiffLines, path: string, side: Side, line: number): boolean {
  return linesOnSide(lines, path, side).has(line)
}

export function hasDiffRange(lines: DiffLines, path: string, side: Side, start: number, end: number): boolean {
  return isMultiLine(start, end) && hasEveryLine(linesOnSide(lines, path, side), start, end)
}
