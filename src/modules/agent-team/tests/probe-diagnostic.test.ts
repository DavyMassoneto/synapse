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
import {
  SHELL_PROBE_COMPILER_ERROR,
  SHELL_PROBE_EXPECT_CODE,
  SHELL_PROBE_EXPECT_KILLED,
  SHELL_PROBE_EXPECT_STDERR,
  SHELL_PROBE_EXPECT_STDOUT,
  SHELL_PROBE_WRONG_MARKER,
} from "./native-scenario-constants"
import { SHELL_PROBE_UNICODE_FIXTURES, type ShellProbeUnicodeFixture } from "./probe-diagnostic"

function preservesLocalOutput(): void {
  expect(limitShellProbeText(SHELL_PROBE_DIAGNOSTIC_PRIVATE_TEXT)).toBe(SHELL_PROBE_DIAGNOSTIC_PRIVATE_TEXT)
}
function boundsOutput(fixture: ShellProbeUnicodeFixture): void {
  expect(limitShellProbeText(fixture.input)).toBe(fixture.expected)
}
function preservesExecutionFacts(): void {
  const result = formatShellProbeDiagnostic(null, SHELL_PROBE_WRONG_MARKER, SHELL_PROBE_COMPILER_ERROR)
  expect(result).toContain(SHELL_PROBE_EXPECT_CODE)
  expect(result).toContain(SHELL_PROBE_EXPECT_KILLED)
  expect(result).toContain(SHELL_PROBE_EXPECT_STDERR)
  expect(result).toContain(SHELL_PROBE_EXPECT_STDOUT)
}

test(SHELL_PROBE_DIAGNOSTIC_TEST_TITLE, preservesLocalOutput)
test.each(SHELL_PROBE_UNICODE_FIXTURES)(SHELL_PROBE_DIAGNOSTIC_BOUND_TITLE, boundsOutput)
test(SHELL_PROBE_DIAGNOSTIC_SUCCESS_TITLE, preservesExecutionFacts)
