import { type ExecFileSyncOptions } from "node:child_process"
import { Type } from "typebox"
import { MAX_OUTPUT_BYTES, MAX_PAGE_LINES } from "#evaluator/output-page"
import { type GitEnvironment } from "./types"

export const INSPECT_REPOSITORY = "inspect_repository"
export const GIT_TIMEOUT_MS = 30_000
export const ROOT_ARGUMENTS = ["rev-parse", "--show-toplevel"]
export const VERIFY_COMMIT_ARGUMENTS = ["cat-file", "-e"]
export const COMMIT_SUFFIX = "^{commit}"
export const INSPECTION_FAILED = "A inspeção do commit falhou; nenhuma review pode ser publicada."
export const GIT_PREFIX = ["--no-pager", "--literal-pathspecs", "-c", "core.quotepath=false"]
export const LIST_ARGUMENTS = ["ls-tree", "-r", "--name-only"]
export const SEARCH_ARGUMENTS = ["grep", "-n", "-I", "-F", "-e"]
export const MAX_HISTORY_COMMITS = 40
export const HISTORY_ARGUMENTS = ["log", "--no-patch", "--format=%H %s", "-n", String(MAX_HISTORY_COMMITS)]
export const SHOW_ARGUMENTS = ["show", "--no-ext-diff", "--no-textconv"]
export const INVALID_PATH = "O caminho não pertence ao commit avaliado."
export const NO_MATCHES = "Nenhuma ocorrência."
export const FILES_ACTION = "files"
export const READ_ACTION = "read"
export const SEARCH_ACTION = "search"
export const HISTORY_ACTION = "history"
export const INSPECTION_DESCRIPTION = `Investiga somente o commit avaliado: files lista caminhos por prefixo; read lê path; search busca text literal; history consulta até ${MAX_HISTORY_COMMITS} commits ancestrais de path. Todos os campos são obrigatórios: use texto vazio nos não aplicáveis. startLine/endLine paginam a saída numerada, até ${MAX_PAGE_LINES} linhas e ${MAX_OUTPUT_BYTES} bytes. Nenhum comando ou arquivo da PR é executado.`
export const InspectionSchema = Type.Object(
  {
    action: Type.Union([
      Type.Literal(FILES_ACTION),
      Type.Literal(READ_ACTION),
      Type.Literal(SEARCH_ACTION),
      Type.Literal(HISTORY_ACTION),
    ]),
    path: Type.String(),
    text: Type.String(),
    startLine: Type.Integer({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER }),
    endLine: Type.Integer({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER }),
  },
  { additionalProperties: false },
)
export const GIT_ENVIRONMENT: GitEnvironment = {
  PATH: process.env.PATH,
  LANG: "C.UTF-8",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_ATTR_NOSYSTEM: "1",
  GIT_TERMINAL_PROMPT: "0",
}

export const NO_MATCH_EXIT_CODE = 1

export const GIT_STDIO: NonNullable<ExecFileSyncOptions["stdio"]> = ["ignore", "pipe", "pipe"]
