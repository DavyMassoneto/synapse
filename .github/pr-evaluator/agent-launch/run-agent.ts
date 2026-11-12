import { spawnSync } from "node:child_process"
import { type ModelConfiguration } from "#evaluator/configuration"
import {
  MAX_EXECUTION_MS,
  TIME_EXCEEDED,
  TIMEOUT_ERROR_CODE,
  WORKER_ARGUMENTS,
  WORKER_BUFFER_BYTES,
  WORKER_ENCODING,
  WORKER_ENVIRONMENT,
  WORKER_FAILURE,
} from "#evaluator/review-configuration"
import { parseReviewResult, type ReviewResult } from "#evaluator/review-result"

export function runReviewAgent(model: ModelConfiguration, sha: string, diff: string, prompt: string): ReviewResult {
  const result = spawnSync(process.execPath, WORKER_ARGUMENTS, {
    input: JSON.stringify({ model, sha, diff, prompt }),
    encoding: WORKER_ENCODING,
    maxBuffer: WORKER_BUFFER_BYTES,
    timeout: MAX_EXECUTION_MS,
    env: { ...WORKER_ENVIRONMENT },
  })
  process.stderr.write(result.stderr)
  if (result.error && "code" in result.error && result.error.code === TIMEOUT_ERROR_CODE) {
    throw new Error(TIME_EXCEEDED)
  }
  if (result.status !== 0 || result.error) {
    throw new Error(WORKER_FAILURE, { cause: result.error })
  }
  return parseReviewResult(result.stdout)
}
