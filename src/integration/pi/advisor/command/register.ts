import { type Advisor } from "#synapse/modules"
import { ADVISOR_NAME, type AdvisorHost } from "../host"
import { type ModelCatalog } from "./catalog"
import { AdvisorCommand } from "./command"
import { COMMAND_TEXT } from "./constants"

export function registerCommand(pi: AdvisorHost, advisor: Advisor, catalog: ModelCatalog): void {
  const command = new AdvisorCommand(pi, advisor)
  pi.registerCommand(ADVISOR_NAME, {
    description: COMMAND_TEXT.description,
    getArgumentCompletions: catalog.completions.bind(catalog),
    handler: command.handle.bind(command),
  })
}
