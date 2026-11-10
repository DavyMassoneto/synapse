import { type LineKind } from "./types"

export function isHunkLineKind(kind: LineKind): boolean {
  return kind === "removed" || kind === "added" || kind === "context" || kind === "no-newline"
}
