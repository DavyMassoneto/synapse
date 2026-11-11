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

function numberedPage(content: string, request: ReadFileRequest): string {
  const numbered: string[] = []
  const last = Math.min(request.endLine, request.startLine + MAX_READ_LINES - 1)
  let start = 0
  let line = 1
  while (start <= content.length && line <= last) {
    const boundary = content.indexOf(LINE_BREAK, start)
    const end = boundary < 0 ? content.length : boundary
    if (line >= request.startLine) {
      numbered.push(`${line}${LINE_NUMBER_BREAK}${content.slice(start, end)}`)
    }
    start = end + 1
    line += 1
  }
  if (line <= request.endLine && start <= content.length) {
    numbered.push(`${MORE_LINES}${line}`)
  }
  return numbered.join(LINE_BREAK)
}

export function readFile(snapshot: RepositorySnapshot, request: ReadFileRequest): string {
  if (!snapshot.files.has(request.path)) {
    return `${UNKNOWN_PATH}${request.path}`
  }
  if (request.endLine < request.startLine) {
    return INVALID_RANGE
  }
  const content = runGit([GIT_SHOW, `${snapshot.sha}${REVISION_SEPARATOR}${request.path}`], FILE_SUBJECT)
  return numberedPage(content, request)
}
