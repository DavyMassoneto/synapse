import {
  TASK_BOARD_BACKSLASHES,
  TASK_BOARD_DRIVE_PREFIX,
  TASK_BOARD_INVALID_SCOPE,
  TASK_BOARD_LEADING_DOT_SLASH,
  TASK_BOARD_PARENT_SEGMENT,
  TASK_BOARD_SCOPE_SEPARATOR,
  TASK_BOARD_TRAILING_SLASHES,
} from "./constants"
import { TaskRefusal } from "./task-refusal"

function normalizeScope(value: string): string {
  const scope = value
    .trim()
    .replace(TASK_BOARD_BACKSLASHES, TASK_BOARD_SCOPE_SEPARATOR)
    .replace(TASK_BOARD_LEADING_DOT_SLASH, "")
    .replace(TASK_BOARD_TRAILING_SLASHES, "")
  if (
    !scope ||
    TASK_BOARD_DRIVE_PREFIX.test(scope) ||
    scope.startsWith(TASK_BOARD_SCOPE_SEPARATOR) ||
    scope.split(TASK_BOARD_SCOPE_SEPARATOR).includes(TASK_BOARD_PARENT_SEGMENT)
  ) {
    throw new TaskRefusal(`${TASK_BOARD_INVALID_SCOPE}${value}`)
  }
  return scope
}

export function taskBoardNormalizeScopes(values: string[]): string[] {
  return [...new Set(values.map(normalizeScope))]
}
