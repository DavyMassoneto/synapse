import { type ThemeColor } from "@earendil-works/pi-coding-agent"

export const COMMAND_TEXT = {
  title: "Modelo advisor",
  disabledOption: "(sem advisor)",
  disabled: "Advisor desligado",
  ambiguousModel: "Mais de um modelo corresponde; informe uma referência mais específica.",
  description: "Escolhe o modelo advisor ou o nível de raciocínio",
  disabledStatus: "desligado",
}

export const PREVIEW_LINES = 8

export const TEXT_PADDING = 0

export const RENDER_TEXT = {
  pending: "consultando...",
  success: "✓ conselho",
  title: "advisor ",
}

export const STATUS_PREFIX = "advisor: "

export const TITLE_COLOR: ThemeColor = "toolTitle"

export const PENDING_COLOR: ThemeColor = "warning"

export const ERROR_COLOR: ThemeColor = "error"

export const SUCCESS_COLOR: ThemeColor = "success"

export const ADDITIONAL_COLOR: ThemeColor = "dim"

export const ADVISOR_TOOL_DESCRIPTION =
  "Consult a reviewer model for strategic guidance. The active conversation is sent to the configured provider, subject to context limits; images are omitted."

export const ADVISOR_TOOL_SNIPPET = "Consult a reviewer model with the conversation, without parameters"

export const TOOL_TEXT = {
  progress: "Consultando advisor...",
  cancelled: "Consulta ao advisor cancelada.",
}
