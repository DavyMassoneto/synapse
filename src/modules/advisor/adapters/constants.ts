import { Type } from "typebox"
import { THINKING_LEVELS } from "#synapse/modules/advisor/public/contracts"

export const thinkingLevelSchema = Type.Union(THINKING_LEVELS.map((level) => Type.Literal(level)))

export const configSchema = Type.Object({
  model: Type.Optional(Type.String()),
  thinking: Type.Optional(thinkingLevelSchema),
})

export const CONFIG_READ_FAILED = "Não foi possível ler a configuração do advisor."

export const CONFIG_INVALID = "Configuração do advisor inválida; revise advisor.json."

export const CONFIG_WRITE_AND_CLEANUP_FAILED =
  "Falha ao gravar a configuração do advisor e ao remover o arquivo temporário."

export const MISSING_FILE_CODE = "ENOENT"

export const CONFIG_ENCODING = "utf8"

export const CONFIG_INDENT = 2

export const CONFIG_FILE_END = "\n"

export const TEMPORARY_EXTENSION = ".tmp"

export const CREATE_ONLY = "wx"
