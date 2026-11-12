import { type RouterCandidate, type RouterChoiceQuestion } from "#synapse/modules/model-router/public/contracts"
import {
  ROUTER_CANDIDATE_EVIDENCE,
  ROUTER_EFFORT_CRITERIA,
  ROUTER_EFFORT_QUESTION,
  ROUTER_EFFORT_QUESTION_NAME,
  ROUTER_INVALID_EFFORT,
  ROUTER_MODEL_QUESTION,
  ROUTER_MODEL_QUESTION_NAME,
  ROUTER_SELECTION_POLICY,
} from "./constants"

export function describeRouterCandidate(model: RouterCandidate): string {
  return JSON.stringify({ ...model, evidence: ROUTER_CANDIDATE_EVIDENCE })
}

export function modelRouterQuestion(candidates: readonly RouterCandidate[]): RouterChoiceQuestion {
  return {
    name: ROUTER_MODEL_QUESTION_NAME,
    instructions: ROUTER_SELECTION_POLICY + ROUTER_MODEL_QUESTION,
    options: candidates.map((model) => ({ id: model.id, criteria: describeRouterCandidate(model) })),
  }
}

function effortCriteria(level: string): string {
  switch (level) {
    case "off":
    case "minimal":
    case "low":
    case "medium":
    case "high":
    case "xhigh":
    case "max":
      return ROUTER_EFFORT_CRITERIA[level]
    default:
      throw new Error(ROUTER_INVALID_EFFORT)
  }
}

export function effortRouterQuestion(candidate: RouterCandidate): RouterChoiceQuestion {
  return {
    name: ROUTER_EFFORT_QUESTION_NAME,
    instructions: ROUTER_SELECTION_POLICY + ROUTER_EFFORT_QUESTION,
    options: candidate.efforts.map((level) => ({ id: level, criteria: effortCriteria(level) })),
  }
}
