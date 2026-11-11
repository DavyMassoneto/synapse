import { isBufferOverflow, runGit } from "#evaluator/git-output"
import {
  GIT_GREP_ARGUMENTS,
  GREP_NO_MATCHES,
  GREP_OUTPUT,
  GREP_TOO_LARGE,
  MAX_SEARCH_MATCHES,
  MORE_MATCHES,
  NO_MATCHES,
  REVISION_SEPARATOR,
  SEARCH_SUBJECT,
  SEARCH_TOO_LARGE,
} from "./constants"
import { isNoMatch } from "./predicates"
import { renderInspectionItems } from "./render-items"
import { splitInspectionLines } from "./split-lines"
import { type InspectionGrepResult, type RepositorySnapshot } from "./types"

function grep(snapshot: RepositorySnapshot, text: string): InspectionGrepResult {
  try {
    return { kind: GREP_OUTPUT, text: runGit([...GIT_GREP_ARGUMENTS, text, snapshot.sha], SEARCH_SUBJECT) }
  } catch (error) {
    if (error instanceof Error && isNoMatch(error)) {
      return { kind: GREP_NO_MATCHES }
    }
    if (error instanceof Error && error.cause instanceof Error && isBufferOverflow(error.cause)) {
      return { kind: GREP_TOO_LARGE }
    }
    throw error
  }
}

function* matchingLines(output: string, prefix: string): Generator<string> {
  for (const line of splitInspectionLines(output, 1)) {
    if (line) {
      yield line.slice(prefix.length)
    }
  }
}

export function searchCode(snapshot: RepositorySnapshot, text: string): string {
  const prefix = `${snapshot.sha}${REVISION_SEPARATOR}`
  const output = grep(snapshot, text)
  if (output.kind === GREP_TOO_LARGE) {
    return SEARCH_TOO_LARGE
  }
  if (output.kind === GREP_NO_MATCHES) {
    return `${NO_MATCHES}${text}`
  }
  return renderInspectionItems(matchingLines(output.text, prefix), {
    maximum: MAX_SEARCH_MATCHES,
    more: MORE_MATCHES,
    empty: `${NO_MATCHES}${text}`,
  })
}
