import { LINE_BREAK } from "./constants"
import { type SplitText } from "./types"

export function splitCompleteLines(text: string): SplitText {
  const cut = text.lastIndexOf(LINE_BREAK) + 1
  return { lines: text.slice(0, cut).split(LINE_BREAK), rest: text.slice(cut) }
}
