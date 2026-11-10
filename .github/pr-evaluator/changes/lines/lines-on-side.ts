import { type FileLines, type Side } from "./types"

export function linesOnSide(file: FileLines, side: Side): Set<number> {
  if (side === "RIGHT") {
    return file.right
  }
  return file.left
}
