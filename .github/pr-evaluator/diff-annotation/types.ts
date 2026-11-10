import { type DiffLines } from "./lines"

export interface AnnotatedDiff {
  text: string
  lines: DiffLines
}
