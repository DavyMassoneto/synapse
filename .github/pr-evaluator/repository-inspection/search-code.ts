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

export function searchCode(snapshot: RepositorySnapshot, text: string): string {
  const prefix = `${snapshot.sha}${REVISION_SEPARATOR}`
  const matches: string[] = []
  for (const line of grep(snapshot, text).split(LINE_BREAK)) {
    if (line) {
      if (matches.length === MAX_SEARCH_MATCHES) {
        return [...matches, MORE_MATCHES].join(LINE_BREAK)
      }
      matches.push(line.slice(prefix.length))
    }
  }
  if (matches.length === 0) {
    return `${NO_MATCHES}${text}`
  }
  return matches.join(LINE_BREAK)
}
