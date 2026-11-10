import { HUNK_START_PATTERN } from "./constants"
import { type HunkStart } from "./types"

export function readHunkStart(line: string): HunkStart {
  const match = HUNK_START_PATTERN.exec(line)
  if (match) {
    return { oldLine: Number(match[1]), newLine: Number(match[2]) }
  }
  throw new Error(`Cabeçalho de trecho inválido: ${line}`)
}
