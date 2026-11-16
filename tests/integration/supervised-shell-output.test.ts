import { expect, test } from "vitest"
import {
  SUPERVISED_TEST_ABSENT_MARKER,
  SUPERVISED_TEST_ABSENT_MARKER_PREFIX,
  SUPERVISED_TEST_ABSENT_MARKER_SUFFIX,
  SUPERVISED_TEST_MARKER_ABSENT_TITLE,
  SUPERVISED_TEST_MARKER_SPLIT_TITLE,
  SUPERVISED_TEST_WINDOWS_MARKER,
  SupervisedTestOutput,
} from "../fixtures"

async function splitMarker(split: number): Promise<void> {
  const output = new SupervisedTestOutput()
  const marker = Buffer.from(SUPERVISED_TEST_WINDOWS_MARKER)
  await output.write(marker.subarray(0, split))
  await output.write(marker.subarray(split))
  await output.waitForMarker()
  await output.write(marker)
  expect(output.text()).toBe(SUPERVISED_TEST_WINDOWS_MARKER.repeat(2))
}
async function absentMarker(): Promise<void> {
  const output = new SupervisedTestOutput()
  await output.write(Buffer.from(SUPERVISED_TEST_ABSENT_MARKER_PREFIX))
  await output.write(Buffer.from(SUPERVISED_TEST_ABSENT_MARKER_SUFFIX))
  expect(output.text()).toBe(SUPERVISED_TEST_ABSENT_MARKER)
}

test.each(Array.from(Buffer.from(SUPERVISED_TEST_WINDOWS_MARKER).keys()))(
  SUPERVISED_TEST_MARKER_SPLIT_TITLE,
  splitMarker,
)
test(SUPERVISED_TEST_MARKER_ABSENT_TITLE, absentMarker)
