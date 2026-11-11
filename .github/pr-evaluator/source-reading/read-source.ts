import { execFileSync } from "node:child_process"
import {
  FILE_BREAK,
  FILE_HEADER,
  GIT_LIST_ARGUMENTS,
  GIT_SHOW_COMMAND,
  MAX_SOURCE_BYTES,
  PATH_TERMINATOR,
  SOURCE_BUFFER_BYTES,
  SOURCE_ENCODING,
} from "./constants"
import { isBufferOverflow, isSourceFile } from "./predicates"

function runGit(args: string[]): string {
  try {
    return execFileSync("git", args, { encoding: SOURCE_ENCODING, maxBuffer: SOURCE_BUFFER_BYTES })
  } catch (error) {
    if (error instanceof Error && isBufferOverflow(error)) {
      throw new Error(`Um arquivo de código excede ${SOURCE_BUFFER_BYTES} bytes; o código não é truncado.`, {
        cause: error,
      })
    }
    throw error
  }
}

export function readSource(headSha: string): string {
  const files: string[] = []
  let bytes = 0
  for (const path of runGit([...GIT_LIST_ARGUMENTS, headSha]).split(PATH_TERMINATOR)) {
    if (isSourceFile(path)) {
      const file = `${FILE_HEADER}${path}${FILE_BREAK}${runGit([GIT_SHOW_COMMAND, `${headSha}:${path}`])}`
      bytes += Buffer.byteLength(file, SOURCE_ENCODING)
      if (bytes > MAX_SOURCE_BYTES) {
        throw new Error(`O código do commit excede ${MAX_SOURCE_BYTES} bytes; o código não é truncado.`)
      }
      files.push(file)
    }
  }
  return files.join(FILE_BREAK)
}
