import { expect, test } from "vitest"
import {
  SUPERVISED_TEST_CLOSE_INVALID_FRAME_TITLE,
  SUPERVISED_TEST_CLOSE_OBSERVATION_TITLE,
  verifyCloseJobObservation,
  verifyCloseJobStatus,
} from "../fixtures"

function rejectsObservation(observed: string): void {
  expect(verifyCloseJobObservation.bind(undefined, "1234", observed)).toThrow()
}
function rejectsFrame(hex: string): void {
  expect(verifyCloseJobStatus.bind(undefined, Buffer.from(hex, "hex"))).toThrow()
}

test.each(["CHILD_ALIVE:1234", "CHILD_ABSENT:5678", "CHILD_PID_MISSING"])(
  SUPERVISED_TEST_CLOSE_OBSERVATION_TITLE,
  rejectsObservation,
)
test.each(["0102000000000000001d", "0102000000000000001d0303", "0103000000000000001d02"])(
  SUPERVISED_TEST_CLOSE_INVALID_FRAME_TITLE,
  rejectsFrame,
)
