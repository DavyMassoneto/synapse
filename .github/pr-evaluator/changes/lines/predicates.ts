import { type DiffLines, type Side } from "./types"

export function hasDiffLine(lines: DiffLines, path: string, side: Side, line: number): boolean {
  const file = lines.get(path)
  if (file instanceof Object && side === "RIGHT") {
    return file.right.has(line)
  }
  if (file instanceof Object) {
    return file.left.has(line)
  }
  return false
}

export function hasDiffRange(lines: DiffLines, path: string, side: Side, start: number, end: number): boolean {
  return (
    start < end &&
    Array.from({ length: end - start + 1 }, (_, offset) => start + offset).every((line) =>
      hasDiffLine(lines, path, side, line),
    )
  )
}
