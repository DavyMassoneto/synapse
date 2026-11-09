import { tryReadTextLines } from "../source"

export function countLines(path: string): number {
  const lines = tryReadTextLines(path)
  if (lines === undefined) {
    return 0
  }
  return lines.length
}
