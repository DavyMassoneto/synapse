import { TEAM_EXECUTION_SECTION } from "#synapse/integration/pi/agent-team"
import { SELECTION_SYSTEM_ROLE } from "./constants"
import { SELECTION_EXTERNAL_SECTION } from "./external-extension"
import { readSelectionRequests } from "./read-requests"
import { type SelectionRequest, type SelectionRequestContext } from "./types"

export function selectionRequestContexts(directory: string): SelectionRequestContext[] {
  return readSelectionRequests(directory).map(projectSelectionRequestContext)
}

function projectSelectionRequestContext(request: SelectionRequest): SelectionRequestContext {
  let selected = ""
  let external = false
  for (const message of request.messages) {
    if (message.role === SELECTION_SYSTEM_ROLE) {
      if (message.sections?.[TEAM_EXECUTION_SECTION]) {
        selected = message.sections[TEAM_EXECUTION_SECTION]
      }
      if (message.sections && SELECTION_EXTERNAL_SECTION in message.sections) {
        external = Boolean(message.sections[SELECTION_EXTERNAL_SECTION])
      }
    }
  }
  return { selected, external }
}
