import { type AnnotatedDiff } from "#evaluator/changes"
import { type Configuration } from "#evaluator/configuration"
import { callModel } from "#evaluator/provider-client"
import { buildPrompt, loadContext } from "#evaluator/review-request"
import { parseReviewResult } from "#evaluator/review-result"
import { publishIfCurrent } from "./publish-if-current"

export async function evaluate(configuration: Configuration, diff: AnnotatedDiff): Promise<void> {
  const prompt = buildPrompt(loadContext(process.cwd()), diff.text)
  const result = parseReviewResult(await callModel(configuration.model, prompt))
  console.log(`Veredito: ${result.verdict}; ${result.findings.length} apontamento(s)`)
  await publishIfCurrent(configuration, diff, result)
}
