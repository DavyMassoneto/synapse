import { type WorkerEnvironment } from "./types"
export const MAX_EXECUTION_MS = 2_400_000
export const TIMEOUT_ERROR_CODE = "ETIMEDOUT"
export const MILLISECONDS_PER_MINUTE = 60_000
export const TIME_EXCEEDED = `O agente excedeu ${MAX_EXECUTION_MS / MILLISECONDS_PER_MINUTE} minutos; nenhuma review foi publicada.`
export const WORKER_PATH = ".github/pr-evaluator/review-agent/worker.ts"
export const WORKER_ARGUMENTS = ["--import", "tsx", WORKER_PATH]
export const WORKER_ENCODING = "utf8"
export const WORKER_BUFFER_BYTES = 33_554_432
export const WORKER_FAILURE = "O processo do agente falhou; nenhuma review foi publicada."
export const WORKER_ENVIRONMENT: WorkerEnvironment = { PATH: process.env.PATH, LANG: "C.UTF-8" }
export const MODEL_CONTEXT_TOKENS = 1_000_000
export const MAX_OUTPUT_TOKENS = 16_384
