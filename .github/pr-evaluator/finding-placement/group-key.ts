import { type Anchored } from "./types"

export function groupKey(anchor: Anchored): string {
  return `${anchor.path}:${anchor.side}:${anchor.startLine}:${anchor.line}`
}
