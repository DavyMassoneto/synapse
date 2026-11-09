import { join } from "node:path"
import { type ChatMessage, type ModelCaller } from "../client"
import { retry } from "../retry"
import { readText } from "../source"
import { buildVerifyQuestion } from "./build-verify-question"
import { MAX_PARSE_ATTEMPTS, PROMPTS_DIR, ROLE_SYSTEM, ROLE_USER, VERIFY_BATCH_SIZE, VERIFY_FILE } from "./constants"
import { parseVerdicts } from "./parse-verdicts"
import { isModelError } from "./predicates"
import { type Finding } from "./types"

async function refutedNumbers(caller: ModelCaller, userMessage: string, batch: Finding[]): Promise<number[]> {
  const system = readText(join(PROMPTS_DIR, VERIFY_FILE))
  const messages: ChatMessage[] = [
    { role: ROLE_SYSTEM, content: system },
    { role: ROLE_USER, content: userMessage },
    { role: ROLE_USER, content: buildVerifyQuestion(batch) },
  ]
  const policy = { attempts: MAX_PARSE_ATTEMPTS, backoffMs: 0, isRetryable: isModelError }
  return (await retry(async () => parseVerdicts(await caller(messages)), policy)).refuted
}

export async function verifyFindings(
  caller: ModelCaller,
  userMessage: string,
  findings: Finding[],
): Promise<Finding[]> {
  const kept: Finding[] = []
  for (let start = 0; start < findings.length; start += VERIFY_BATCH_SIZE) {
    const batch = findings.slice(start, start + VERIFY_BATCH_SIZE)
    const refuted = await refutedNumbers(caller, userMessage, batch)
    kept.push(...batch.filter((_, index) => !refuted.includes(index + 1)))
  }
  return kept
}
