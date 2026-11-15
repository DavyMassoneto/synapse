import { expect } from "vitest"
import {
  SUPERVISED_TEST_CLOSE_ACCEPTED_OFFSET,
  SUPERVISED_TEST_CLOSE_CREATED_BYTE,
  SUPERVISED_TEST_CLOSE_EMPTY_BYTE,
  SUPERVISED_TEST_CLOSE_EMPTY_OFFSET,
  SUPERVISED_TEST_CLOSE_EXIT_BYTE,
  SUPERVISED_TEST_CLOSE_EXIT_OFFSET,
  SUPERVISED_TEST_CLOSE_FRAME_BYTES,
} from "./constants"

export function verifyCloseJobObservation(pid: string, observed: string): void {
  expect(pid).toMatch(/^\d+$/)
  expect(observed.trim()).toBe(`CHILD_ABSENT:${pid}`)
}

export function verifyCloseJobStatus(bytes: Buffer): void {
  expect(bytes.length).toBe(SUPERVISED_TEST_CLOSE_FRAME_BYTES)
  expect(bytes[0]).toBe(SUPERVISED_TEST_CLOSE_CREATED_BYTE)
  expect(bytes[1]).toBe(SUPERVISED_TEST_CLOSE_EXIT_BYTE)
  expect(bytes.readInt32BE(SUPERVISED_TEST_CLOSE_EXIT_OFFSET)).toBe(0)
  expect(bytes.readUInt32BE(SUPERVISED_TEST_CLOSE_ACCEPTED_OFFSET)).toBeGreaterThan(0)
  expect(bytes[SUPERVISED_TEST_CLOSE_EMPTY_OFFSET]).toBe(SUPERVISED_TEST_CLOSE_EMPTY_BYTE)
}
