import { defineTool } from "@earendil-works/pi-coding-agent"
import { type TSchema } from "typebox"
import { type TeamRegisteredTool, type TeamToolRegistration } from "./types"

export function registeredTeamTool<T extends TSchema>(registration: TeamToolRegistration<T>): TeamRegisteredTool {
  return { ...defineTool({ ...registration, label: registration.name }), name: registration.name }
}
