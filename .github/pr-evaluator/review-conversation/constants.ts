import { type ToolDefinition } from "#evaluator/provider-client"
import { INSPECTION_TOOLS } from "#evaluator/repository-inspection"
import { SUBMIT_REVIEW_TOOL } from "#evaluator/review-result"

export const MAX_ROUNDS = 40

export const REVIEW_TOOLS: ToolDefinition[] = [...INSPECTION_TOOLS, SUBMIT_REVIEW_TOOL]

export const ASSISTANT_ROLE = "assistant"

export const TOOL_ROLE = "tool"

export const ROUND_LABEL = "Rodada "

export const PROMPT_TOKENS_LABEL = ": tokens de entrada "

export const CACHED_TOKENS_LABEL = ", lidos do cache "

export const NO_SUBMISSION = `O modelo não entregou a avaliação em ${MAX_ROUNDS} rodadas`

export const COMPLETION_TOKENS_LABEL = ", tokens de saída "

export const TOOL_CALLS_LABEL = ", chamadas de ferramenta "

export const USAGE_NOT_REPORTED = "não informado"

export const SUBMITTED_ROUND = "submitted"

export const CONTINUING_ROUND = "continuing"

export const MAX_CONVERSATION_BYTES = 872_000

export const MAX_ROUND_TOOL_CALLS = 16

export const CONVERSATION_TOO_LARGE = "A conversa excede o limite de bytes: "

export const TOO_MANY_TOOL_CALLS = "A resposta excede o limite de chamadas de ferramenta: "
