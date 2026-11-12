import { execFileSync } from "node:child_process"
import {
  COMMIT_SUFFIX,
  EMPTY_TEXT,
  FILES_ACTION,
  GIT_BUFFER_BYTES,
  GIT_COMMAND,
  GIT_ENCODING,
  GIT_ENVIRONMENT,
  GIT_PREFIX,
  GIT_TIMEOUT_MS,
  HISTORY_ACTION,
  HISTORY_ARGUMENTS,
  INSPECTION_FAILED,
  INVALID_PATH,
  INVALID_RANGE,
  LINE_BREAK,
  LIST_ARGUMENTS,
  MAX_OUTPUT_BYTES,
  MAX_PAGE_LINES,
  NO_MATCHES,
  OUTPUT_LIMIT_ERROR,
  READ_ACTION,
  ROOT_ARGUMENTS,
  SEARCH_ACTION,
  SEARCH_ARGUMENTS,
  SHOW_ARGUMENTS,
  TOTAL_LINES_LABEL,
  VERIFY_COMMIT_ARGUMENTS,
} from "./constants"
import { InspectionFailure } from "./inspection-failure"
import { type InspectionContext, type InspectionRequest, type PageRequest } from "./types"

export function inspectionRoot(): string {
  return execFileSync(GIT_COMMAND, ROOT_ARGUMENTS, {
    encoding: GIT_ENCODING,
    env: GIT_ENVIRONMENT,
    stdio: ["ignore", "pipe", "pipe"],
  }).trim()
}

function git(args: string[]): string {
  try {
    return execFileSync(GIT_COMMAND, [...GIT_PREFIX, ...args], {
      cwd: inspectionRoot(),
      encoding: GIT_ENCODING,
      maxBuffer: GIT_BUFFER_BYTES,
      timeout: GIT_TIMEOUT_MS,
      env: GIT_ENVIRONMENT,
      stdio: ["ignore", "pipe", "pipe"],
    })
  } catch (error) {
    if (error instanceof Error && "status" in error && error.status === 1 && args[0] === SEARCH_ARGUMENTS[0]) {
      return NO_MATCHES
    }
    throw new InspectionFailure(INSPECTION_FAILED, { cause: error })
  }
}

export function inspectionPage(text: string, request: PageRequest): string {
  if (request.endLine < request.startLine) {
    throw new Error(INVALID_RANGE)
  }
  const lines = text.split(LINE_BREAK)
  const end = Math.min(request.endLine, request.startLine + MAX_PAGE_LINES - 1, lines.length)
  const page: string[] = [`${TOTAL_LINES_LABEL}${lines.length}`]
  for (let line = request.startLine; line <= end; line += 1) {
    page.push(`${line}  ${lines[line - 1]}`)
  }
  const output = page.join(LINE_BREAK)
  if (Buffer.byteLength(output) > MAX_OUTPUT_BYTES) {
    throw new Error(OUTPUT_LIMIT_ERROR)
  }
  return output
}

function listFiles(sha: string, prefix: string): string {
  const matching: string[] = []
  for (const path of git([...LIST_ARGUMENTS, sha]).split(LINE_BREAK)) {
    if (path.startsWith(prefix)) {
      matching.push(path)
    }
  }
  return matching.join(LINE_BREAK)
}

function requirePath(sha: string, path: string): void {
  const paths = git([...LIST_ARGUMENTS, sha, "--", path]).split(LINE_BREAK)
  if (!path || !paths.includes(path)) {
    throw new Error(INVALID_PATH)
  }
}

export function verifySnapshot(sha: string): void {
  git([...VERIFY_COMMIT_ARGUMENTS, `${sha}${COMMIT_SUFFIX}`])
  if (!git([...LIST_ARGUMENTS, sha]).trim()) {
    throw new InspectionFailure(INSPECTION_FAILED)
  }
}

export function inspectRepository(context: InspectionContext, request: InspectionRequest): string {
  let output = EMPTY_TEXT
  switch (request.action) {
    case FILES_ACTION:
      output = listFiles(context.sha, request.path)
      break
    case READ_ACTION:
      requirePath(context.sha, request.path)
      output = git([...SHOW_ARGUMENTS, `${context.sha}:${request.path}`])
      break
    case SEARCH_ACTION:
      output = git([...SEARCH_ARGUMENTS, request.text, context.sha, "--"])
      break
    case HISTORY_ACTION:
      output = git([...HISTORY_ARGUMENTS, context.sha, "--", request.path])
      break
  }
  return inspectionPage(output, request)
}
