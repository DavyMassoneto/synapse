import { execFileSync } from "node:child_process"
import { DIFF_BUFFER_BYTES, GIT_DIFF_ARGUMENTS } from "./constants"

export function runGitDiff(baseSha: string, headSha: string): string {
  return execFileSync("git", [...GIT_DIFF_ARGUMENTS, `${baseSha}...${headSha}`], {
    encoding: "utf8",
    maxBuffer: DIFF_BUFFER_BYTES,
  })
}
