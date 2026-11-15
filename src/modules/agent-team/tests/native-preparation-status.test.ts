import { expect, test } from "vitest"
import { ShellStatusReader } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import { SHELL_NATIVE_PREPARATION_INVALID_TITLE, SHELL_NATIVE_PREPARATION_VALID_TITLE } from "./constants"

function cancelledBeforeCreated(): void {
  const reader = new ShellStatusReader()
  reader.receive(Buffer.from([5, 0, 0, 0]))
  reader.eof()
  expect(reader.state).toEqual({ kind: "preparation-empty", reason: "cancelled" })
  expect(reader.empty).toBe(true)
}
function cancelledAfterInternalRelease(): void {
  const reader = new ShellStatusReader()
  reader.receive(Buffer.from([1]))
  reader.release()
  reader.receive(Buffer.from([5, 0, 0, 0]))
  reader.eof()
  expect(reader.state.kind).toBe("preparation-empty")
  expect(reader.empty).toBe(true)
}
function rejectsMalformedPreparation(frame: string): void {
  const reader = new ShellStatusReader()
  expect(readPreparationFrame.bind(undefined, reader, frame)).toThrow()
}
function readPreparationFrame(reader: ShellStatusReader, frame: string): void {
  reader.receive(Buffer.from(frame, "hex"))
  reader.eof()
}

function createdAndPreparationCoalesced(): void {
  const reader = new ShellStatusReader()
  reader.receive(Buffer.from([1, 5, 0, 0, 0]))
  reader.eof()
  expect(reader.state).toEqual({ kind: "preparation-empty", reason: "cancelled" })
  expect(reader.empty).toBe(true)
}

test(SHELL_NATIVE_PREPARATION_VALID_TITLE, createdAndPreparationCoalesced)
test(SHELL_NATIVE_PREPARATION_VALID_TITLE, cancelledBeforeCreated)
test(SHELL_NATIVE_PREPARATION_VALID_TITLE, cancelledAfterInternalRelease)
test.each(["05020000", "050000", "0500000003", "05010001ff"])(
  SHELL_NATIVE_PREPARATION_INVALID_TITLE,
  rejectsMalformedPreparation,
)
