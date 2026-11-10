import { EVENT_LINE_BREAK } from "./constants"
import { type SplitText } from "./types"

export function splitCompleteLines(text: string): SplitText {
  const cut = text.lastIndexOf(EVENT_LINE_BREAK) + 1
  return { lines: text.slice(0, cut).split(EVENT_LINE_BREAK), rest: text.slice(cut) }
}
