import { runGit } from "#evaluator/git-output"
import {
  FILE_BREAK,
  FILE_HEADER,
  FILE_SUBJECT,
  GIT_LIST_ARGUMENTS,
  GIT_SHOW_COMMAND,
  LISTING_SUBJECT,
  MAX_SOURCE_BYTES,
  PATH_TERMINATOR,
  SOURCE_ENCODING,
} from "./constants"
import { isSourceFile } from "./predicates"

function readSourceFile(headSha: string, path: string): string {
  return `${FILE_HEADER}${path}${FILE_BREAK}${runGit([GIT_SHOW_COMMAND, `${headSha}:${path}`], FILE_SUBJECT)}`
}

function ensureWithinSourceLimit(bytes: number): void {
  if (bytes > MAX_SOURCE_BYTES) {
    throw new Error(`O código do commit excede ${MAX_SOURCE_BYTES} bytes; o código não é truncado.`)
  }
}

export function readSource(headSha: string): string {
  const files: string[] = []
  let bytes = 0
  for (const path of runGit([...GIT_LIST_ARGUMENTS, headSha], LISTING_SUBJECT).split(PATH_TERMINATOR)) {
    if (isSourceFile(path)) {
      const file = readSourceFile(headSha, path)
      bytes += Buffer.byteLength(file, SOURCE_ENCODING)
      ensureWithinSourceLimit(bytes)
      files.push(file)
    }
  }
  return files.join(FILE_BREAK)
}
