import { LIST_SEPARATOR, PARAGRAPH_BREAK } from "#synapse/separators"
import { type Settings } from "#synapse/settings"
import { type Source } from "#synapse/source"
import { fillTemplate } from "#synapse/templates"
import {
  EMPTY_DESCRIPTION,
  FILES_CLOSE,
  FILES_OPEN,
  LABEL_CHUNK,
  LABEL_DELETED,
  LABEL_DESCRIPTION,
  LABEL_FILES,
  LABEL_TITLE,
  LABEL_TREE,
  NO_DELETED_FILES,
} from "./constants"
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
    fillTemplate(LABEL_CHUNK, [String(position), String(total)]),
    LABEL_TREE + PARAGRAPH_BREAK + input.treeListing,
    LABEL_FILES + PARAGRAPH_BREAK + FILES_OPEN + PARAGRAPH_BREAK + files + PARAGRAPH_BREAK + FILES_CLOSE,
  ].join(PARAGRAPH_BREAK)
}

export function describeOrPlaceholder(text: string, placeholder: string): string {
  if (text.trim().length === 0) {
    return placeholder
  }
  return text.trim()
}
