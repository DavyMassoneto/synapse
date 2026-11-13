import { type ClassifierModel } from "@earendil-works/pi-ai"

export const ROUTER_FIXTURE_CLASSIFIER: ClassifierModel<"typesafe"> = {
  type: "classifier",
  api: "typesafe",
  provider: "typesafe",
  id: "jev-latest",
  name: "Jev",
  baseUrl: "https://example.invalid",
  input: ["text"],
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  contextWindow: 100000,
}

export const ROUTER_FIXTURE_HOST_MISSING = "Modelo virtual não registrado."

export const ROUTER_TEST_VIRTUAL_PROVIDER = "jev"

export const ROUTER_TEST_VIRTUAL_ID = "auto"

export const ROUTER_TEST_HIGH = "high"

export const ROUTER_TEST_USER = "user"

export const ROUTER_TEST_PROVIDER = "omniroute"

export const ROUTER_TEST_FAILED = "failed"

export const ROUTER_TEST_RETRY = "retry"

export const ROUTER_TEST_LOW = "low"

export const ROUTER_TEST_ASSISTANT = "assistant"

export const ROUTER_TEST_ERROR = "error"

export const ROUTER_TEST_PREVIOUS = "previous"

export const ROUTER_TEST_CONTINUATION = "continuation"

export const ROUTER_TEST_MEDIUM = "medium"

export const ROUTER_TEST_TEXT_ONLY = "text-only"

export const ROUTER_TEST_TEXT = "text"

export const ROUTER_TEST_IMAGE = "image"

export const ROUTER_TEST_OTHER_PROVIDER = "other"

export const ROUTER_TEST_IMAGE_MODEL = "image-model"

export const ROUTER_TEST_FIRST = "first"

export const ROUTER_TEST_SECOND = "second"

export const ROUTER_TEST_FALLBACK = "cx/gpt-6.1-sol"

export const ROUTER_TEST_CLASSIFIER_PROVIDER = "typesafe"

export const ROUTER_TEST_CLASSIFIER_MODEL = "jev-latest"

export const ROUTER_TEST_STOP = "stop"

export const ROUTER_TEST_CHOICE = "choice"

export const ROUTER_TEST_MODEL_QUESTION = "model"

export const ROUTER_TEST_AVAILABLE_MODELS_COMMAND = "get_available_models"

export const ROUTER_TEST_LAST_TEXT_COMMAND = "get_last_assistant_text"

export const ROUTER_TEST_ABORTED_REASON = "aborted"

export const ROUTER_TEST_PROMPT = "Olá\u2028mundo\u2029!"

export const ROUTER_TEST_REPLY = "ok"

export const ROUTER_TEST_INVESTIGATION = "Investigue"

export const ROUTER_TEST_CONTEXT_WINDOW = 100000

export const ROUTER_TEST_FAILURE_MESSAGE = "erro"

export const ROUTER_TEST_FALLBACK_PATTERN = /^Fallback técnico:/

export const ROUTER_TEST_UNAVAILABLE_FALLBACK = "fallback conservador indisponível"

export const ROUTER_TEST_UNAVAILABLE_SELECTION = "Modelo ou nível escolhido indisponível"

export const ROUTER_TEST_ABORT_ERROR = "AbortError"

export const ROUTER_TEST_MESSAGE_END = "message_end"
