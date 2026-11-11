import { runGit } from "#evaluator/git-output"
import {
  GIT_GREP_ARGUMENTS,
  LINE_BREAK,
  MAX_SEARCH_MATCHES,
  MORE_MATCHES,
  NO_MATCHES,
  REVISION_SEPARATOR,
  SEARCH_SUBJECT,
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
    throw error
  }
}

function* matchingLines(output: string, prefix: string): Generator<string> {
  for (const line of output.split(LINE_BREAK)) {
    if (line) {
      yield line.slice(prefix.length)
    }
  }
}

export function searchCode(snapshot: RepositorySnapshot, text: string): string {
  const prefix = `${snapshot.sha}${REVISION_SEPARATOR}`
  return renderInspectionItems(matchingLines(grep(snapshot, text), prefix), {
    maximum: MAX_SEARCH_MATCHES,
    more: MORE_MATCHES,
    empty: `${NO_MATCHES}${text}`,
  })
}
