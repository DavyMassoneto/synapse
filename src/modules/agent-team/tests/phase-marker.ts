import { expect } from "vitest"
import { SHELL_PHASE_MARKER_LINE_SEPARATOR } from "./constants"

export function assertSingleCommit(marker: string): void {
  expect(marker.trim().split(SHELL_PHASE_MARKER_LINE_SEPARATOR)).toHaveLength(1)
}
