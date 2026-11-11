import { runGit } from "#evaluator/git-output"
import {
  FILE_SUBJECT,
  GIT_SHOW,
  INVALID_RANGE,
  LINE_BREAK,
  LINE_NUMBER_BREAK,
  MAX_READ_LINES,
  MORE_LINES,
  REVISION_SEPARATOR,
  UNKNOWN_PATH,
} from "./constants"
import { type ReadFileRequest, type RepositorySnapshot } from "./types"

function numberedLines(lines: string[], start: number, last: number): string[] {
  const numbered: string[] = []
  for (let line = start; line <= last; line += 1) {
    numbered.push(`${line}${LINE_NUMBER_BREAK}${lines[line - 1]}`)
  }
  return numbered
}

export function readFile(snapshot: RepositorySnapshot, request: ReadFileRequest): string {
  if (!snapshot.files.has(request.path)) {
    return `${UNKNOWN_PATH}${request.path}`
  }
  if (request.endLine < request.startLine) {
    return INVALID_RANGE
  }
  const lines = runGit([GIT_SHOW, `${snapshot.sha}${REVISION_SEPARATOR}${request.path}`], FILE_SUBJECT).split(
    LINE_BREAK,
  )
  const wanted = Math.min(request.endLine, lines.length)
  const last = Math.min(wanted, request.startLine + MAX_READ_LINES - 1)
  const numbered = numberedLines(lines, request.startLine, last)
  if (last < wanted) {
    numbered.push(`${MORE_LINES}${last + 1}`)
  }
  return numbered.join(LINE_BREAK)
}
