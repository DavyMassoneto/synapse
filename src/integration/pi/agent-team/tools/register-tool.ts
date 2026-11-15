import { defineTool } from "@earendil-works/pi-coding-agent"
import { type TSchema } from "typebox"
import { TEAM_TOOL_MODEL_ONLY } from "./constants"
import { type TeamRegisteredTool, type TeamToolRegistration } from "./types"

export function registeredTeamTool<T extends TSchema>(registration: TeamToolRegistration<T>): TeamRegisteredTool {
  return {
    ...defineTool({ ...registration, exposure: TEAM_TOOL_MODEL_ONLY, label: registration.name }),
    name: registration.name,
  }
}
