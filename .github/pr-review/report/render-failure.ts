import { VERDICT_FAILURE } from "../review"
import { PARAGRAPH_BREAK } from "../separators"
import { fillTemplate } from "../templates"
import { LINE_FAILURE, LINE_VERDICT, SUMMARY_MARKER, TITLE } from "./constants"

export function renderFailure(reason: string): string {
  const marker = fillTemplate(SUMMARY_MARKER, ["0"])
  return [marker, TITLE, fillTemplate(LINE_VERDICT, [VERDICT_FAILURE]), fillTemplate(LINE_FAILURE, [reason])].join(
    PARAGRAPH_BREAK,
  )
}
