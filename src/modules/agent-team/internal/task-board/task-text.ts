import { TASK_BOARD_EMPTY_TEXT, TASK_BOARD_TEXT_TOO_LONG } from "./constants"
import { TaskRefusal } from "./task-refusal"

export function taskBoardRequireText(value: string, maxLength: number): string {
  const text = value.trim()
  if (!text) {
    throw new TaskRefusal(TASK_BOARD_EMPTY_TEXT)
  }
  if (text.length > maxLength) {
    throw new TaskRefusal(`${TASK_BOARD_TEXT_TOO_LONG}${maxLength}`)
  }
  return text
}
