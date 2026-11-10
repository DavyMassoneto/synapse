import { DIFF_BUFFER_BYTES } from "./constants"
import { isBufferOverflow } from "./predicates"
import { runGitDiff } from "./run-git-diff"

export function readDiff(baseSha: string, headSha: string): string {
  try {
    return runGitDiff(baseSha, headSha)
  } catch (error) {
    if (error instanceof Error && isBufferOverflow(error)) {
      throw new Error(`O diff excede ${DIFF_BUFFER_BYTES} bytes; o diff não é truncado, reduza a PR.`, { cause: error })
    }
    throw error
  }
}
