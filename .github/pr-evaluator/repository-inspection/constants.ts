import { Type } from "typebox"

export const INSPECT_REPOSITORY = "inspect_repository"
export const READ_DIFF = "read_diff"
export const TEXT = "text"
export const MAX_PAGE_LINES = 400
export const MAX_OUTPUT_BYTES = 65_536
export const GIT_TIMEOUT_MS = 30_000
export const GIT_BUFFER_BYTES = 8_388_608
export const LINE_BREAK = "\n"
export const EMPTY_TEXT = ""
export const GIT_COMMAND = "git"
export const ROOT_ARGUMENTS = ["rev-parse", "--show-toplevel"]
export const VERIFY_COMMIT_ARGUMENTS = ["cat-file", "-e"]
export const COMMIT_SUFFIX = "^{commit}"
export const INSPECTION_FAILED = "A inspeção do commit falhou; nenhuma review pode ser publicada."
export const GIT_ENCODING = "utf8"
export const GIT_PREFIX = ["--no-pager", "--literal-pathspecs", "-c", "core.quotepath=false"]
export const LIST_ARGUMENTS = ["ls-tree", "-r", "--name-only"]
export const SEARCH_ARGUMENTS = ["grep", "-n", "-I", "-F", "-e"]
export const HISTORY_ARGUMENTS = ["log", "--no-patch", "--format=%H %s", "-n", "40"]
export const SHOW_ARGUMENTS = ["show", "--no-ext-diff", "--no-textconv"]
export const OUTPUT_LIMIT_ERROR = "A página excede 65536 bytes; reduza o intervalo ou refine a busca."
export const INVALID_PATH = "O caminho não pertence ao commit avaliado."
export const INVALID_RANGE = "O intervalo termina antes de começar."
export const NO_MATCHES = "Nenhuma ocorrência."
export const FILES_ACTION = "files"
export const READ_ACTION = "read"
export const SEARCH_ACTION = "search"
export const HISTORY_ACTION = "history"
export const INSPECTION_DESCRIPTION =
  "Investiga somente o commit avaliado: files lista caminhos por prefixo; read lê path; search busca text literal; history consulta até 40 commits ancestrais de path. Todos os campos são obrigatórios: use texto vazio nos não aplicáveis. startLine/endLine paginam a saída numerada, até 400 linhas e 65536 bytes. Nenhum comando ou arquivo da PR é executado."
export const DIFF_DESCRIPTION =
  "Lê o diff completo anotado em páginas de até 400 linhas e 65536 bytes. As coordenadas R/L são as âncoras dos apontamentos; os números das páginas não são âncoras. Continue até o fim indicado pelo total de linhas."
export const PageSchema = Type.Object(
  {
    startLine: Type.Integer({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER }),
    endLine: Type.Integer({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER }),
  },
  { additionalProperties: false },
)
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
export const TOTAL_LINES_LABEL = "Total de linhas: "
export const GIT_ENVIRONMENT = {
  PATH: process.env.PATH,
  LANG: "C.UTF-8",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_ATTR_NOSYSTEM: "1",
  GIT_TERMINAL_PROMPT: "0",
}
