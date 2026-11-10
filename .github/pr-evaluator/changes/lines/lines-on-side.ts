import { type DiffLines, type Side } from "./types"

export function linesOnSide(lines: DiffLines, path: string, side: Side): Set<number> {
  const file = lines.get(path)
  if (!(file instanceof Object)) {
    return new Set<number>()
  }
  if (side === "RIGHT") {
    return file.right
  }
  return file.left
}
