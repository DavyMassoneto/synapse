import { isPresentObject } from "#evaluator/presence"
import { type DiffLines, type Side } from "./types"

export function linesOnSide(lines: DiffLines, path: string, side: Side): Set<number> {
  const file = lines.get(path)
  if (!isPresentObject(file)) {
    return new Set<number>()
  }
  if (side === "RIGHT") {
    return file.right
  }
  return file.left
}
