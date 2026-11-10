import { type FileLines } from "../lines"
import { type DiffState } from "./types"

export function createState(): DiffState {
  return {
    oldPath: "",
    path: "",
    inHunk: false,
    oldLine: 0,
    newLine: 0,
    lines: new Map<string, FileLines>(),
  }
}
