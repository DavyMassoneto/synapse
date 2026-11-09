export type Side = "LEFT" | "RIGHT"

export interface FileLines {
  left: Set<number>
  right: Set<number>
}

export type DiffLines = Map<string, FileLines>

export interface DiffState {
  oldPath: string
  path: string
  inHunk: boolean
  oldLine: number
  newLine: number
  lines: DiffLines
}

export interface AnnotatedDiff {
  text: string
  lines: DiffLines
}
