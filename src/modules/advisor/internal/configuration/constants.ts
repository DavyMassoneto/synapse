import { type ThinkingLevel } from "#synapse/modules/advisor/public/contracts"

export const DEFAULT_THINKING: ThinkingLevel = "high"

export const CONFIGURATION_DIAGNOSTICS = {
  saveFailed: "Não foi possível salvar a configuração do advisor.",
  invalidModel: "O modelo deve usar o formato provedor/id.",
  invalidThinking: "Nível de raciocínio inválido.",
}
