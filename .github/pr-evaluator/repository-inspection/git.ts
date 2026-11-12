import { execFileSync } from "node:child_process"
import { GIT_BUFFER_BYTES, GIT_COMMAND, GIT_ENCODING } from "#evaluator/git-output"
import { GIT_ENVIRONMENT, GIT_PREFIX, GIT_TIMEOUT_MS, INSPECTION_FAILED, ROOT_ARGUMENTS } from "./constants"
import { InspectionFailure } from "./inspection-failure"
import { type InspectionContext } from "./types"

export function inspectionRoot(): string {
  return execFileSync(GIT_COMMAND, ROOT_ARGUMENTS, {
    encoding: GIT_ENCODING,
    env: { ...GIT_ENVIRONMENT },
    stdio: ["ignore", "pipe", "pipe"],
  }).trim()
}

export function inspectionGit(context: InspectionContext, args: string[]): string {
  try {
    return execFileSync(GIT_COMMAND, [...GIT_PREFIX, ...args], {
      cwd: context.root,
      encoding: GIT_ENCODING,
      maxBuffer: GIT_BUFFER_BYTES,
      timeout: GIT_TIMEOUT_MS,
      env: { ...GIT_ENVIRONMENT },
      stdio: ["ignore", "pipe", "pipe"],
    })
  } catch (error) {
    throw new InspectionFailure(INSPECTION_FAILED, { cause: error })
  }
}
