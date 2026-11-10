import { countRangeLines } from "./count-range-lines"
import { linesOnSide } from "./lines-on-side"
import { type DiffLines, type Side } from "./types"

export function isMultiLine(start: number, end: number): boolean {
  return start < end
}

export function hasDiffLine(lines: DiffLines, path: string, side: Side, line: number): boolean {
  const file = lines.get(path)
  return file instanceof Object && linesOnSide(file, side).has(line)
}

export function hasDiffRange(lines: DiffLines, path: string, side: Side, start: number, end: number): boolean {
  return isMultiLine(start, end) && countRangeLines(lines, path, side, start, end) === end - start + 1
}
