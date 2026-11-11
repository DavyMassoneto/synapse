import { runGit } from "#evaluator/git-output"
import { DIFF_SUBJECT, GIT_DIFF_ARGUMENTS } from "./constants"

export function readDiff(baseSha: string, headSha: string): string {
  return runGit([...GIT_DIFF_ARGUMENTS, `${baseSha}...${headSha}`], DIFF_SUBJECT)
}
