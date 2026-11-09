import { join } from "node:path"
import { type ChatMessage, type ModelCaller } from "#synapse/client"
import { retry } from "#synapse/retry"
import { LINE_BREAK } from "#synapse/separators"
import { readText } from "#synapse/source"
import { fillTemplate } from "#synapse/templates"
import { type Finding, isModelError, MAX_PARSE_ATTEMPTS, parseVerdicts, ROLE_SYSTEM, ROLE_USER } from "../model"
import { PROMPTS_DIR } from "../prompt"
import { VERIFY_BATCH_SIZE, VERIFY_FILE, VERIFY_LINE, VERIFY_QUESTION } from "./constants"

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

export function buildVerifyQuestion(findings: Finding[]): string {
  const lines = findings.map((finding, index) =>
    fillTemplate(VERIFY_LINE, [String(index + 1), finding.rule, finding.path, String(finding.line), finding.body]),
  )
  return [VERIFY_QUESTION, ...lines].join(LINE_BREAK)
}
