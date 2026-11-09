import { type Anchored } from "./types"

export function isRange(anchor: Anchored): boolean {
  return anchor.startLine < anchor.line
}
