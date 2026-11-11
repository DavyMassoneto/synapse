import { type ToolExecutionMode } from "@earendil-works/pi-coding-agent"

export const ADVISOR_NAME = "advisor"

export const ADVISOR_LABEL = "Advisor"

export const ADVISOR_EXECUTION_MODE: ToolExecutionMode = "sequential"

export const ADVISOR_TOOL_DESCRIPTION =
  "Consult a reviewer model for strategic guidance. The active conversation is sent to the configured provider, subject to context limits; images are omitted."

export const ADVISOR_TOOL_SNIPPET = "Consult a reviewer model with the conversation, without parameters"

export const TOOL_PROGRESS = "Consultando advisor..."

export const TOOL_CANCELLED = "Consulta ao advisor cancelada."
