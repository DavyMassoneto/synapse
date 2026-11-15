import { expect, test } from "vitest"
import {
  SUPERVISED_TEST_CLOSE_INVALID_FRAME_TITLE,
  SUPERVISED_TEST_CLOSE_OBSERVATION_TITLE,
  SUPERVISED_TEST_CLOSE_PID,
  SUPERVISED_TEST_HEX_ENCODING,
  SUPERVISED_TEST_INVALID_CLOSE_FRAMES,
  SUPERVISED_TEST_INVALID_OBSERVATIONS,
  verifyCloseJobObservation,
  verifyCloseJobStatus,
} from "../fixtures"

function rejectsObservation(observed: string): void {
  expect(verifyCloseJobObservation.bind(undefined, SUPERVISED_TEST_CLOSE_PID, observed)).toThrow()
}
function rejectsFrame(hex: string): void {
  expect(verifyCloseJobStatus.bind(undefined, Buffer.from(hex, SUPERVISED_TEST_HEX_ENCODING))).toThrow()
}

test.each(SUPERVISED_TEST_INVALID_OBSERVATIONS)(SUPERVISED_TEST_CLOSE_OBSERVATION_TITLE, rejectsObservation)
test.each(SUPERVISED_TEST_INVALID_CLOSE_FRAMES)(SUPERVISED_TEST_CLOSE_INVALID_FRAME_TITLE, rejectsFrame)
