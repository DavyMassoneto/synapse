export const ESTIMATED_CHARACTERS_PER_TOKEN = 3

export const HOST_SAFETY_TOKENS = 4_096

export const MINIMUM_ANSWER_TOKENS = 1_024

export const MAX_SYSTEM_CHARACTERS = 40_000

export const LARGE_CONTENT_LIMIT = 12_000

export const MEDIUM_CONTENT_LIMIT = 4_000

export const SMALL_CONTENT_LIMIT = 1_500

export const MINIMAL_CONTENT_LIMIT = 500

export const CONTENT_LIMITS: number[] = [
  LARGE_CONTENT_LIMIT,
  MEDIUM_CONTENT_LIMIT,
  SMALL_CONTENT_LIMIT,
  MINIMAL_CONTENT_LIMIT,
]

export const NO_BUDGET = 0

export const HEAD_FRACTION = 0.6

export const SEPARATOR = "\n\n"

export const PROMPT_PREFIX = "<executor_system_prompt>\n"

export const TRANSCRIPT_PREFIX = "\n</executor_system_prompt>\n\n<transcript>\n"

export const PROMPT_SUFFIX = "\n</transcript>\n\nThe executor just called advisor(). Give your guidance now."

export const CLIPPED_CONTENT = "\n[... conteúdo omitido ...]\n"

export const OMITTED_MESSAGES = "[... mensagens anteriores omitidas ...]"

export const TOOL_RESULT_LABEL = "tool_result"

export const SHELL_LABEL = "user ran shell"

export const CONTEXT_LABEL = "context"

export const SUMMARY_LABEL = "[summary of earlier conversation]"

export const IMAGE_OMITTED = "[image omitted]"

export const TOOL_CALL_LABEL = "tool_call"

export const ERROR_LABEL = " (error)"
