import { type DiffLines } from "../lines"

export interface DiffState {
  oldPath: string
  path: string
  inHunk: boolean
  oldLine: number
  newLine: number
  lines: DiffLines
}

export type LineKind = "file-header" | "hunk-header" | "removed" | "added" | "context" | "no-newline" | "other"

export interface LeftPosition {
  kind: "left"
  line: number
}

export interface RightPosition {
  kind: "right"
  line: number
}

export interface NoPosition {
  kind: "none"
}

export type LinePosition = LeftPosition | RightPosition | NoPosition
