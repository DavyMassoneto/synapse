import { type Advisor } from "#synapse/modules"
import { ADVISOR_NAME } from "../tool"
import { CompletionCatalog } from "./catalog"
import { AdvisorCommand } from "./command"
import { COMMAND_DESCRIPTION } from "./constants"
import { type CommandHost } from "./types"

export function registerCommand(pi: CommandHost, advisor: Advisor): void {
  const command = new AdvisorCommand(pi, advisor)
  const catalog = new CompletionCatalog()
  pi.on("session_start", (_event, context) => catalog.refresh(context))
  pi.registerCommand(ADVISOR_NAME, {
    description: COMMAND_DESCRIPTION,
    getArgumentCompletions: catalog.completions.bind(catalog),
    handler: command.handle.bind(command),
  })
}
