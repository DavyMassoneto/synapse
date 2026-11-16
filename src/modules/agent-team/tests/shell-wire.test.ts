import { expect, test } from "vitest"
import { ShellStatusReader } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import {
  SHELL_WIRE_TEST_CREATED,
  SHELL_WIRE_TEST_EOF,
  SHELL_WIRE_TEST_INVALID,
  SHELL_WIRE_TEST_RELEASE,
} from "./constants"

function rejectsDuplicateCreated(): void {
  const reader = new ShellStatusReader()
  reader.receive(Buffer.from([1]))
  expect(reader.receive.bind(reader, Buffer.from([1]))).toThrow()
}

function rejectsUnreleasedExit(): void {
  const reader = new ShellStatusReader()
  reader.receive(Buffer.from([1]))
  expect(reader.receive.bind(reader, Buffer.from([2]))).toThrow()
}

function rejectsInvalidByte(): void {
  const reader = new ShellStatusReader()
  expect(reader.receive.bind(reader, Buffer.from([255]))).toThrow()
}

function rejectsIncompleteExit(): void {
  const reader = new ShellStatusReader()
  reader.receive(Buffer.from([1]))
  reader.release()
  reader.receive(Buffer.from([2, 0]))
  expect(reader.eof.bind(reader)).toThrow()
}

test(SHELL_WIRE_TEST_CREATED, rejectsDuplicateCreated)
test(SHELL_WIRE_TEST_RELEASE, rejectsUnreleasedExit)
test(SHELL_WIRE_TEST_INVALID, rejectsInvalidByte)
test(SHELL_WIRE_TEST_EOF, rejectsIncompleteExit)
