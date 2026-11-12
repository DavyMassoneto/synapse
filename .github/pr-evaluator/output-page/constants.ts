import { Type } from "typebox"

export const READ_DIFF = "read_diff"
export const MAX_PAGE_LINES = 400
export const MAX_OUTPUT_BYTES = 65_536
export const LINE_BREAK = "\n"
export const INVALID_RANGE = "O intervalo termina antes de começar."
export const OUTPUT_LIMIT_ERROR = `A página excede ${MAX_OUTPUT_BYTES} bytes; reduza o intervalo ou refine a busca.`
export const TOTAL_LINES_LABEL = "Total de linhas: "
export const DIFF_DESCRIPTION = `Lê o diff completo anotado em páginas de até ${MAX_PAGE_LINES} linhas e ${MAX_OUTPUT_BYTES} bytes. As coordenadas R/L são as âncoras dos apontamentos; os números das páginas não são âncoras. Continue até o fim indicado pelo total de linhas.`
export const PageSchema = Type.Object(
  {
    startLine: Type.Integer({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER }),
    endLine: Type.Integer({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER }),
  },
  { additionalProperties: false },
)
