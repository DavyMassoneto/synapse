import { Type } from "typebox"
import { THINKING_LEVELS } from "#synapse/modules/advisor/public/contracts"
import { thinkingLiteral } from "./thinking-schema"

export const thinkingSchema = Type.Union(THINKING_LEVELS.map(thinkingLiteral))

export const configSchema = Type.Object({
  model: Type.Optional(Type.String()),
  thinking: Type.Optional(thinkingSchema),
})

export const CONFIG_DIAGNOSTICS = {
  readFailed: "Não foi possível ler a configuração do advisor.",
  invalid: "Configuração do advisor inválida; revise advisor.json.",
  writeAndCleanupFailed: "Falha ao gravar a configuração do advisor e ao remover o arquivo temporário.",
}
