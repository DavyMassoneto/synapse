export const ESTIMATED_CHARACTERS_PER_TOKEN = 3

export const HOST_SAFETY_TOKENS = 4_096

export const MINIMUM_ANSWER_TOKENS = 1_024

export const MAX_SYSTEM_CHARACTERS = 40_000

export const WINDOW_TOO_SMALL = "A janela do advisor é pequena demais para a consulta."

export const PROMPT_PREFIX = "<executor_system_prompt>\n"

export const TRANSCRIPT_PREFIX = "\n</executor_system_prompt>\n\n<transcript>\n"

export const PROMPT_SUFFIX = "\n</transcript>\n\nThe executor just called advisor(). Give your guidance now."
