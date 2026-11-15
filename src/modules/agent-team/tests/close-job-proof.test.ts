import { expect, test } from "vitest"
import { verifyCloseJobObservation, verifyCloseJobStatus } from "./close-job-proof"
import {
  SHELL_CLOSE_JOB_FRAME_TITLE,
  SHELL_CLOSE_JOB_OBSERVATION_TITLE,
  SHELL_CLOSE_JOB_VALID_FRAME,
  SHELL_CLOSE_JOB_VALID_TITLE,
} from "./constants"

function validFrame(): void {
  verifyCloseJobStatus(Buffer.from(SHELL_CLOSE_JOB_VALID_FRAME, "hex"))
  verifyCloseJobObservation("1234", "CHILD_ABSENT:1234")
}
function rejectsFrame(hex: string): void {
  expect(verifyCloseJobStatus.bind(undefined, Buffer.from(hex, "hex"))).toThrow()
}
function rejectsObservation(observed: string): void {
  expect(verifyCloseJobObservation.bind(undefined, "1234", observed)).toThrow()
}

test(SHELL_CLOSE_JOB_VALID_TITLE, validFrame)
test.each(["0102000000000000001d", "0102000000000000001d0303", "0103000000000000001d02"])(
  SHELL_CLOSE_JOB_FRAME_TITLE,
  rejectsFrame,
)
test.each(["CHILD_ALIVE:1234", "CHILD_ABSENT:5678", "CHILD_PID_MISSING"])(
  SHELL_CLOSE_JOB_OBSERVATION_TITLE,
  rejectsObservation,
)
