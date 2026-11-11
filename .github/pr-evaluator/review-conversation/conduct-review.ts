import { type Configuration } from "#evaluator/configuration"
import { type ChatMessage, type ChatRequest, callModel, USER_ROLE } from "#evaluator/provider-client"
import { openSnapshot } from "#evaluator/repository-inspection"
import { type ReviewResult, SUBMIT_REVIEW } from "#evaluator/review-result"
import { ARRAY_BRACKET_BALANCE_BYTES, MAX_ROUNDS, NO_SUBMISSION, REVIEW_TOOLS, SUBMITTED_ROUND } from "./constants"
import { ensureConversationLimit, reviewMessagesBytes } from "./conversation-limit"
import { describeReviewRound } from "./describe-round"
import { handleReviewRound } from "./handle-round"
import { ensureRoundToolLimit } from "./round-tool-limit"

function roundRequest(messages: ChatMessage[], round: number, mustSubmit: boolean): ChatRequest {
  if (mustSubmit || round === MAX_ROUNDS) {
    return { messages, tools: REVIEW_TOOLS, forcedTool: SUBMIT_REVIEW }
  }
  return { messages, tools: REVIEW_TOOLS }
}

export async function conductReview(configuration: Configuration, prompt: string): Promise<ReviewResult> {
  const snapshot = openSnapshot(configuration.github.headSha)
  const messages: ChatMessage[] = [{ role: USER_ROLE, content: prompt }]
  let bytes = reviewMessagesBytes(messages)
  let mustSubmit = false
  for (let round = 1; round <= MAX_ROUNDS; round += 1) {
    ensureConversationLimit(bytes)
    const reply = await callModel(configuration.model, roundRequest(messages, round, mustSubmit))
    ensureRoundToolLimit(reply)
    console.log(describeReviewRound(round, reply))
    const outcome = handleReviewRound(snapshot, reply)
    if (outcome.kind === SUBMITTED_ROUND) {
      return outcome.review
    }
    mustSubmit = outcome.mustSubmit
    bytes += reviewMessagesBytes(outcome.messages) - ARRAY_BRACKET_BALANCE_BYTES
    messages.push(...outcome.messages)
  }
  throw new Error(NO_SUBMISSION)
}
