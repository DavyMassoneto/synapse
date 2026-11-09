import { LIST_SEPARATOR, PARAGRAPH_BREAK } from "../separators"
import { type Settings } from "../settings"
import { type Source } from "../source"
import { fillTemplate } from "../templates"
import {
  EMPTY_DESCRIPTION,
  FILES_CLOSE,
  FILES_OPEN,
  LABEL_DELETED,
  LABEL_DESCRIPTION,
  LABEL_FILES,
  LABEL_PART,
  LABEL_TITLE,
  LABEL_TREE,
  NO_DELETED_FILES,
} from "./constants"
import { describeOrPlaceholder } from "./describe-or-placeholder"
import { type ReviewInput } from "./types"

export function buildUserMessage(
  settings: Settings,
  input: ReviewInput,
  chunk: Source[],
  position: number,
  total: number,
): string {
  const deleted = describeOrPlaceholder(input.deletedPaths.join(LIST_SEPARATOR), NO_DELETED_FILES)
  const files = chunk.map((source) => source.text).join(PARAGRAPH_BREAK)
  return [
    LABEL_TITLE + settings.prTitle,
    LABEL_DESCRIPTION + PARAGRAPH_BREAK + describeOrPlaceholder(settings.prBody, EMPTY_DESCRIPTION),
    LABEL_DELETED + deleted,
    fillTemplate(LABEL_PART, [String(position), String(total)]),
    LABEL_TREE + PARAGRAPH_BREAK + input.treeListing,
    LABEL_FILES + PARAGRAPH_BREAK + FILES_OPEN + PARAGRAPH_BREAK + files + PARAGRAPH_BREAK + FILES_CLOSE,
  ].join(PARAGRAPH_BREAK)
}
