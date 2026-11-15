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
import { SHELL_PROBE_UNICODE_FIXTURES, type ShellProbeUnicodeFixture } from "./probe-diagnostic"

function preservesLocalOutput(): void {
  expect(limitShellProbeText(SHELL_PROBE_DIAGNOSTIC_PRIVATE_TEXT)).toBe(SHELL_PROBE_DIAGNOSTIC_PRIVATE_TEXT)
}
function boundsOutput(fixture: ShellProbeUnicodeFixture): void {
  expect(limitShellProbeText(fixture.input)).toBe(fixture.expected)
}
function preservesExecutionFacts(): void {
  const result = formatShellProbeDiagnostic(null, "WRONG_MARKER", "Compiler rejected source")
  expect(result).toContain("code=0")
  expect(result).toContain("killed=false")
  expect(result).toContain("stderr=Compiler rejected source")
  expect(result).toContain("stdout=WRONG_MARKER")
}

test(SHELL_PROBE_DIAGNOSTIC_TEST_TITLE, preservesLocalOutput)
test.each(SHELL_PROBE_UNICODE_FIXTURES)(SHELL_PROBE_DIAGNOSTIC_BOUND_TITLE, boundsOutput)
test(SHELL_PROBE_DIAGNOSTIC_SUCCESS_TITLE, preservesExecutionFacts)
