import { LINE_BREAK, renderPage } from "#evaluator/output-page"
import {
  COMMIT_SUFFIX,
  EMPTY_TEXT,
  FILES_ACTION,
  HISTORY_ACTION,
  HISTORY_ARGUMENTS,
  INSPECTION_FAILED,
  INVALID_PATH,
  LIST_ARGUMENTS,
  NO_MATCHES,
  READ_ACTION,
  SEARCH_ACTION,
  SEARCH_ARGUMENTS,
  SHOW_ARGUMENTS,
  VERIFY_COMMIT_ARGUMENTS,
} from "./constants"
import { inspectionGit } from "./git"
import { InspectionFailure } from "./inspection-failure"
import { isNoMatch } from "./predicates"
import { type InspectionContext, type InspectionRequest } from "./types"

function listFiles(context: InspectionContext, prefix: string): string {
  const matching: string[] = []
  for (const path of inspectionGit(context, [...LIST_ARGUMENTS, context.sha]).split(LINE_BREAK)) {
    if (path.startsWith(prefix)) {
      matching.push(path)
    }
  }
  return matching.join(LINE_BREAK)
}

function requirePath(context: InspectionContext, path: string): void {
  const paths = inspectionGit(context, [...LIST_ARGUMENTS, context.sha, "--", path]).split(LINE_BREAK)
  if (!path || !paths.includes(path)) {
    throw new Error(INVALID_PATH)
  }
}

function searchCode(context: InspectionContext, text: string): string {
  try {
    return inspectionGit(context, [...SEARCH_ARGUMENTS, text, context.sha, "--"])
  } catch (error) {
    if (error instanceof InspectionFailure && isNoMatch(error)) {
      return NO_MATCHES
    }
    throw error
  }
}

export function verifySnapshot(context: InspectionContext): void {
  inspectionGit(context, [...VERIFY_COMMIT_ARGUMENTS, `${context.sha}${COMMIT_SUFFIX}`])
  if (!inspectionGit(context, [...LIST_ARGUMENTS, context.sha]).trim()) {
    throw new InspectionFailure(INSPECTION_FAILED)
  }
}

export function inspectRepository(context: InspectionContext, request: InspectionRequest): string {
  let output = EMPTY_TEXT
  switch (request.action) {
    case FILES_ACTION:
      output = listFiles(context, request.path)
      break
    case READ_ACTION:
      requirePath(context, request.path)
      output = inspectionGit(context, [...SHOW_ARGUMENTS, `${context.sha}:${request.path}`])
      break
    case SEARCH_ACTION:
      output = searchCode(context, request.text)
      break
    case HISTORY_ACTION:
      output = inspectionGit(context, [...HISTORY_ARGUMENTS, context.sha, "--", request.path])
      break
  }
  return renderPage(output.split(LINE_BREAK), request).text
}
