import { execFileSync } from "node:child_process"
import { DIFF_BUFFER_BYTES, GIT_DIFF_ARGUMENTS } from "./constants"
import { isBufferOverflow } from "./predicates"

export function readDiff(baseSha: string, headSha: string): string {
  try {
    return execFileSync("git", [...GIT_DIFF_ARGUMENTS, `${baseSha}...${headSha}`], {
      encoding: "utf8",
      maxBuffer: DIFF_BUFFER_BYTES,
    })
  } catch (error) {
    if (error instanceof Error && isBufferOverflow(error)) {
      throw new Error(`O diff excede ${DIFF_BUFFER_BYTES} bytes; o diff não é truncado, reduza a PR.`, { cause: error })
    }
    throw error
  }
}
