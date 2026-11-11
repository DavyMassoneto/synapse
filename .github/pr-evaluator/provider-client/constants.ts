export const MAX_OUTPUT_TOKENS = 128_000

export const MODEL_TEMPERATURE = 0

export const MODEL_TIMEOUT_MS = 2_400_000

export const CHAT_PATH = "/chat/completions"

export const CHAT_METHOD = "POST"

export const AUTHORIZATION_HEADER = "Authorization"

export const BEARER_PREFIX = "Bearer "

export const CONTENT_TYPE_HEADER = "Content-Type"

export const JSON_CONTENT_TYPE = "application/json"

export const CACHE_CONTROL_HEADER = "Cache-Control"

export const NO_CACHE_DIRECTIVE = "no-cache"

export const RETRY_DELAY_MS = 20_000

export const SERVER_ERROR_STATUS = 500

export const MODEL_ORIGIN = "Modelo"

export const EMPTY_BODY = "O modelo respondeu sem corpo"

export const STOP_FINISH = "stop"

export const TOOL_CALLS_FINISH = "tool_calls"

export const FUNCTION_TYPE = "function"

export const USER_ROLE = "user"

export const INCOMPLETE_TOOL_CALL = "O modelo pediu uma ferramenta sem identificador ou sem nome"

export const UNEXPECTED_FINISH = "A resposta do modelo não terminou normalmente (término: "

export const UNEXPECTED_FINISH_END = ")"

export const MISSING_FINISH = "A resposta do modelo não terminou normalmente (o fluxo acabou sem indicar o término)"
