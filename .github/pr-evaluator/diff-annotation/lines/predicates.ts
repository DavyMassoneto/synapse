import { type DiffLines, type Side } from "./types"

export function hasEveryLine(lines: Set<number>, start: number, end: number): boolean {
  for (let line = start; line <= end; line += 1) {
    if (!lines.has(line)) {
      return false
    }
  }
  return true
}

export function hasDiffLine(lines: DiffLines, path: string, side: Side, line: number): boolean {
  const file = lines.get(path)
  if (file) {
    return file[side].has(line)
  }
  return false
}

export function hasDiffRange(lines: DiffLines, path: string, side: Side, start: number, end: number): boolean {
  const file = lines.get(path)
  if (file) {
    return start < end && hasEveryLine(file[side], start, end)
  }
  return false
}
