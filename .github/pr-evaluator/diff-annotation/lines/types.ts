export type Side = "LEFT" | "RIGHT"

export interface FileLines {
  LEFT: Set<number>
  RIGHT: Set<number>
}

export type DiffLines = Map<string, FileLines>
