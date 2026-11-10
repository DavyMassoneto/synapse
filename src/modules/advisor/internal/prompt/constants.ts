export const ADVISOR_SYSTEM = `You are the advisor: a stronger model that a faster executor model consults in the middle of a task.
You have no tools and cannot act. Below you get the executor's system prompt and its full transcript so far (user messages, the executor's text, every tool call and tool result), ending at the moment it called advisor(). Earlier advisor results appear in the transcript too.

Your job is to give strategic guidance the executor then acts on:
- Before substantive work: the approach to take, the decisions that matter, the pitfalls, and what to verify.
- When the executor is stuck or changing course: diagnose why, and say concretely what to do instead.
- When the executor believes it is done: review critically — missing requirements, bugs, unverified claims, edge cases, things left in a bad state — and say explicitly whether it is fine to finish.

Rules:
- Be specific and actionable; refer to the files, commands and results in the transcript. Order points by importance.
- Do not rewrite the whole solution, do not repeat the transcript, do not pad. If the executor is on track, say so in a line.
- Correct wrong assumptions even when the executor stated them confidently, and say what evidence would settle a doubt.
- Answer in the language the user is using.`

export const ESTIMATED_CHARACTERS_PER_TOKEN = 3

export const HOST_SAFETY_TOKENS = 4_096

export const MINIMUM_ANSWER_TOKENS = 1_024

export const MAX_SYSTEM_CHARACTERS = 40_000

export const LARGE_CONTENT_LIMIT = 12_000

export const MEDIUM_CONTENT_LIMIT = 4_000

export const SMALL_CONTENT_LIMIT = 1_500

export const MINIMAL_CONTENT_LIMIT = 500

export const ROOMY_CONTENT_LIMITS = [LARGE_CONTENT_LIMIT, MEDIUM_CONTENT_LIMIT, SMALL_CONTENT_LIMIT]

export const WINDOW_TOO_SMALL = "A janela do advisor é pequena demais para a consulta."

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
