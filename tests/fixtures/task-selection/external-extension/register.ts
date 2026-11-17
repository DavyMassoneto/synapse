import { type BeforeAgentStartEvent, type ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { SELECTION_EXTERNAL_BEFORE_START, SELECTION_EXTERNAL_ENABLED, SELECTION_EXTERNAL_SECTION } from "./constants"

function includeSelectionExternalSection(event: BeforeAgentStartEvent): void {
  event.systemPromptOptions.sections[SELECTION_EXTERNAL_SECTION] = SELECTION_EXTERNAL_ENABLED
}

export default function registerSelectionExternal(pi: ExtensionAPI): void {
  pi.on(SELECTION_EXTERNAL_BEFORE_START, includeSelectionExternalSection)
}
