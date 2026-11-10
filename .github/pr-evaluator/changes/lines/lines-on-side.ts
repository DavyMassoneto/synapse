import { type DiffLines, type Side } from "./types"

export function linesOnSide(lines: DiffLines, path: string, side: Side): Set<number> {
  const file = lines.get(path)
  if (file instanceof Object && side === "RIGHT") {
    return file.right
  }
  if (file instanceof Object) {
    return file.left
  }
  return new Set<number>()
}
