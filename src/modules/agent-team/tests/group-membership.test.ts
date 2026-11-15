import { expect, test } from "vitest"
import { confirmUnixGroupEmpty } from "./confirm-group"
import {
  SHELL_GROUP_INVALID_TITLE,
  SHELL_GROUP_MATCH_TITLE,
  SHELL_GROUP_REJECT_TITLE,
  UNIX_KEEPER_GROUP_PATTERN_PREFIX,
  UNIX_KEEPER_GROUP_PATTERN_SUFFIX,
} from "./constants"

function matchesGroup(text: string): void {
  const membership = new RegExp(`${UNIX_KEEPER_GROUP_PATTERN_PREFIX}123${UNIX_KEEPER_GROUP_PATTERN_SUFFIX}`)
  expect(membership.test(text)).toBe(true)
}
function rejectsOtherGroup(text: string): void {
  const membership = new RegExp(`${UNIX_KEEPER_GROUP_PATTERN_PREFIX}123${UNIX_KEEPER_GROUP_PATTERN_SUFFIX}`)
  expect(membership.test(text)).toBe(false)
}
async function rejectsInvalidGroup(group: number): Promise<void> {
  await expect(confirmUnixGroupEmpty(group)).rejects.toThrow()
}

test.each(["123", "  123 \n", "\t123\t\n1234\n", "456\n 123\n"])(SHELL_GROUP_MATCH_TITLE, matchesGroup)
test.each(["", "1234", "0123", "NaN\n0\n", "456\n"])(SHELL_GROUP_REJECT_TITLE, rejectsOtherGroup)
test.each([0, Number.NaN, -1, Number.POSITIVE_INFINITY])(SHELL_GROUP_INVALID_TITLE, rejectsInvalidGroup)
