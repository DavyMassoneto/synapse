import { execFileSync } from "node:child_process"
import { GIT_BUFFER_BYTES, GIT_COMMAND, GIT_ENCODING } from "./constants"
import { isBufferOverflow } from "./predicates"

export function runGit(args: string[], subject: string): string {
  try {
    return execFileSync(GIT_COMMAND, args, { encoding: GIT_ENCODING, maxBuffer: GIT_BUFFER_BYTES })
  } catch (error) {
    if (error instanceof Error && isBufferOverflow(error)) {
      throw new Error(`${subject} excede ${GIT_BUFFER_BYTES} bytes; nada é truncado.`, { cause: error })
    }
    throw error
  }
}
