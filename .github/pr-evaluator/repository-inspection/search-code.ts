import { isBufferOverflow, runGit } from "#evaluator/git-output"
import {
  GIT_GREP_ARGUMENTS,
  LINE_BREAK,
  MAX_SEARCH_MATCHES,
  MORE_MATCHES,
  NO_MATCHES,
  REVISION_SEPARATOR,
  SEARCH_SUBJECT,
  SEARCH_TOO_LARGE,
} from "./constants"
import { isNoMatch } from "./predicates"
import { renderInspectionItems } from "./render-items"
import { type RepositorySnapshot } from "./types"

function grep(snapshot: RepositorySnapshot, text: string): string {
  try {
    return runGit([...GIT_GREP_ARGUMENTS, text, snapshot.sha], SEARCH_SUBJECT)
  } catch (error) {
    if (error instanceof Error && isNoMatch(error)) {
      return ""
    }
    if (error instanceof Error && error.cause instanceof Error && isBufferOverflow(error.cause)) {
      return SEARCH_TOO_LARGE
    }
    throw error
  }
}

function* matchingLines(output: string, prefix: string): Generator<string> {
  let start = 0
  while (start < output.length) {
    const boundary = output.indexOf(LINE_BREAK, start)
    const end = boundary < 0 ? output.length : boundary
    if (end > start) {
      yield output.slice(start + prefix.length, end)
    }
    start = end + 1
  }
}

export function searchCode(snapshot: RepositorySnapshot, text: string): string {
  const prefix = `${snapshot.sha}${REVISION_SEPARATOR}`
  const output = grep(snapshot, text)
  if (output === SEARCH_TOO_LARGE) {
    return output
  }
  return renderInspectionItems(matchingLines(output, prefix), {
    maximum: MAX_SEARCH_MATCHES,
    more: MORE_MATCHES,
    empty: `${NO_MATCHES}${text}`,
  })
}
