export type Side = "LEFT" | "RIGHT"

export interface FileLines {
  left: Set<number>
  right: Set<number>
}

export type DiffLines = Map<string, FileLines>
