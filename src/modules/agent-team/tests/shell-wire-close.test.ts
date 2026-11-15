import { expect, test } from "vitest"
import { ShellStatusReader } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import { SHELL_CLOSE_JOB_FRAME_TITLE, SHELL_CLOSE_JOB_VALID_FRAME, SHELL_CLOSE_JOB_VALID_TITLE } from "./constants"

function validatesCloseSequence(): void {
  const reader = new ShellStatusReader()
  const frame = Buffer.from(SHELL_CLOSE_JOB_VALID_FRAME, "hex")
  reader.receive(frame.subarray(0, 1))
  expect(reader.state.kind).toBe("created")
  reader.release()
  reader.receive(frame.subarray(1))
  reader.eof()
  expect(reader.state.kind).toBe("completed")
  expect(reader.empty).toBe(true)
}
function rejectsInvalidCloseFrame(hex: string): void {
  const reader = new ShellStatusReader()
  reader.receive(Buffer.from([1]))
  reader.release()
  const frame = Buffer.from(hex, "hex")
  expect(receiveFinalStatus.bind(undefined, reader, frame)).toThrow()
}
function receiveFinalStatus(reader: ShellStatusReader, frame: Buffer): void {
  reader.receive(frame)
  reader.eof()
  expect(reader.empty).toBe(true)
}

test(SHELL_CLOSE_JOB_VALID_TITLE, validatesCloseSequence)
test.each(["02000000000000001d", "02000000000000001d0303", "03000000000000001d02"])(
  SHELL_CLOSE_JOB_FRAME_TITLE,
  rejectsInvalidCloseFrame,
)
