import { expect, test } from "vitest"
import { ShellStatusReader } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import { SHELL_CLOSE_JOB_FRAME_TITLE, SHELL_CLOSE_JOB_VALID_FRAME, SHELL_CLOSE_JOB_VALID_TITLE } from "./constants"
import {
  SHELL_TEST_BAD_CLOSE_FRAMES,
  SHELL_TEST_HEX_ENCODING,
  SHELL_TEST_READER_COMPLETED,
  SHELL_TEST_READER_CREATED,
} from "./native-scenario-constants"

function validatesCloseSequence(): void {
  const reader = new ShellStatusReader()
  const frame = Buffer.from(SHELL_CLOSE_JOB_VALID_FRAME, SHELL_TEST_HEX_ENCODING)
  reader.receive(frame.subarray(0, 1))
  expect(reader.state.kind).toBe(SHELL_TEST_READER_CREATED)
  reader.release()
  reader.receive(frame.subarray(1))
  reader.eof()
  expect(reader.state.kind).toBe(SHELL_TEST_READER_COMPLETED)
  expect(reader.empty).toBe(true)
}
function rejectsInvalidCloseFrame(hex: string): void {
  const reader = new ShellStatusReader()
  reader.receive(Buffer.from([1]))
  reader.release()
  const frame = Buffer.from(hex, SHELL_TEST_HEX_ENCODING)
  expect(receiveFinalStatus.bind(undefined, reader, frame)).toThrow()
}
function receiveFinalStatus(reader: ShellStatusReader, frame: Buffer): void {
  reader.receive(frame)
  reader.eof()
  expect(reader.empty).toBe(true)
}

test(SHELL_CLOSE_JOB_VALID_TITLE, validatesCloseSequence)
test.each(SHELL_TEST_BAD_CLOSE_FRAMES)(SHELL_CLOSE_JOB_FRAME_TITLE, rejectsInvalidCloseFrame)
