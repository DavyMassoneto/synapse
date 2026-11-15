import { expect, test } from "vitest"
import { ShellStatusReader } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import { SHELL_NATIVE_MIXED_STATUS_TITLE } from "./constants"
import { SHELL_TEST_HEX_ENCODING, SHELL_TEST_MIXED_PREFIXES } from "./native-scenario-constants"

function rejectsMixedPrefix(prefix: string): void {
  const reader = new ShellStatusReader()
  reader.receive(Buffer.from([1]))
  reader.release()
  reader.receive(Buffer.from(prefix, SHELL_TEST_HEX_ENCODING))
  expect(mixedPreparation.bind(undefined, reader)).toThrow()
  expect(reader.empty).toBe(false)
}

function mixedPreparation(reader: ShellStatusReader): void {
  reader.receive(Buffer.from([5, 0, 0, 0]))
  reader.eof()
}

test.each(SHELL_TEST_MIXED_PREFIXES)(SHELL_NATIVE_MIXED_STATUS_TITLE, rejectsMixedPrefix)
