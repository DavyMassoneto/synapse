import { expect, test } from "vitest"
import {
  formatShellProbeDiagnostic,
  limitShellProbeText,
} from "#synapse/modules/agent-team/adapters/supervised-shell/windows"
import {
  SHELL_PROBE_DIAGNOSTIC_BOUND_TITLE,
  SHELL_PROBE_DIAGNOSTIC_PRIVATE_TEXT,
  SHELL_PROBE_DIAGNOSTIC_SUCCESS_TITLE,
  SHELL_PROBE_DIAGNOSTIC_TEST_TITLE,
} from "./constants"

function preservesLocalOutput(): void {
  expect(limitShellProbeText(SHELL_PROBE_DIAGNOSTIC_PRIVATE_TEXT)).toBe(SHELL_PROBE_DIAGNOSTIC_PRIVATE_TEXT)
}
function boundsOutput(): void {
  const prefix = "x".repeat(2047)
  expect(limitShellProbeText(`${prefix}😀tail`)).toBe(prefix)
  expect(Buffer.byteLength(limitShellProbeText("é".repeat(3000)))).toBe(2048)
  expect(Buffer.byteLength(limitShellProbeText("😀".repeat(3000)))).toBe(2048)
}
function preservesExecutionFacts(): void {
  const result = formatShellProbeDiagnostic(null, "WRONG_MARKER", "Compiler rejected source")
  expect(result).toContain("code=0")
  expect(result).toContain("killed=false")
  expect(result).toContain("stderr=Compiler rejected source")
  expect(result).toContain("stdout=WRONG_MARKER")
}

test(SHELL_PROBE_DIAGNOSTIC_TEST_TITLE, preservesLocalOutput)
test(SHELL_PROBE_DIAGNOSTIC_BOUND_TITLE, boundsOutput)
test(SHELL_PROBE_DIAGNOSTIC_SUCCESS_TITLE, preservesExecutionFacts)
