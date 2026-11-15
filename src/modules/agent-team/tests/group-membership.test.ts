import { expect, test } from "vitest"
import { confirmUnixGroupEmpty } from "./confirm-group"
import { SHELL_GROUP_INVALID_TITLE } from "./constants"

async function rejectsInvalidGroup(group: number): Promise<void> {
  await expect(confirmUnixGroupEmpty(group)).rejects.toThrow()
}

test.each([0, Number.NaN, -1, Number.POSITIVE_INFINITY])(SHELL_GROUP_INVALID_TITLE, rejectsInvalidGroup)
