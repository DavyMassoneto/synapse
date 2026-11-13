import {
  TASK_BOARD_BACKSLASHES,
  TASK_BOARD_INVALID_SCOPE,
  TASK_BOARD_LEADING_DOT_SLASH,
  TASK_BOARD_SCOPE_SEPARATOR,
  TASK_BOARD_TRAILING_SLASHES,
} from "./constants"
import { isInvalidTaskScope } from "./predicates"
import { TaskRefusal } from "./task-refusal"

function normalizeScope(value: string): string {
  const scope = value
    .trim()
    .replace(TASK_BOARD_BACKSLASHES, TASK_BOARD_SCOPE_SEPARATOR)
    .replace(TASK_BOARD_LEADING_DOT_SLASH, "")
    .replace(TASK_BOARD_TRAILING_SLASHES, "")
  if (isInvalidTaskScope(scope)) {
    throw new TaskRefusal(`${TASK_BOARD_INVALID_SCOPE}${value}`)
  }
  return scope
}

export function taskBoardNormalizeScopes(values: string[]): string[] {
  return [...new Set(values.map(normalizeScope))]
}
