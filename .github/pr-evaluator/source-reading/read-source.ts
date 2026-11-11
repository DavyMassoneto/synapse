import { execFileSync } from "node:child_process"
import {
  FILE_BREAK,
  FILE_HEADER,
  GIT_LIST_ARGUMENTS,
  GIT_SHOW_COMMAND,
  PATH_TERMINATOR,
  SOURCE_BUFFER_BYTES,
  SOURCE_ENCODING,
} from "./constants"
import { isSourceFile } from "./predicates"

function runGit(args: string[]): string {
  return execFileSync("git", args, { encoding: SOURCE_ENCODING, maxBuffer: SOURCE_BUFFER_BYTES })
}

export function readSource(headSha: string): string {
  const files: string[] = []
  for (const path of runGit([...GIT_LIST_ARGUMENTS, headSha]).split(PATH_TERMINATOR)) {
    if (isSourceFile(path)) {
      files.push(`${FILE_HEADER}${path}${FILE_BREAK}${runGit([GIT_SHOW_COMMAND, `${headSha}:${path}`])}`)
    }
  }
  return files.join(FILE_BREAK)
}
