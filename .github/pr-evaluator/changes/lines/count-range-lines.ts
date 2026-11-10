import { linesOnSide } from "./lines-on-side"
import { type DiffLines, type Side } from "./types"

export function countRangeLines(lines: DiffLines, path: string, side: Side, start: number, end: number): number {
  const file = lines.get(path)
  if (file instanceof Object) {
    return [...linesOnSide(file, side)].filter((line) => line >= start && line <= end).length
  }
  return 0
}
