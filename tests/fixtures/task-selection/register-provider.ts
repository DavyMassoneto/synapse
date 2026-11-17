import { type ExtensionAPI, type ExtensionContext, type SessionStartEvent } from "@earendil-works/pi-coding-agent"
import { mountScriptedProvider } from "../scripted-provider"
import { SELECTION_SESSION_START } from "./constants"
import { SelectionScriptedProvider } from "./provider"

async function prepareSelectionProvider(_event: SessionStartEvent, context: ExtensionContext): Promise<void> {
  await context.modelRegistry.refresh({ allowNetwork: false })
}

export default function registerSelectionProvider(pi: ExtensionAPI): void {
  pi.on(SELECTION_SESSION_START, prepareSelectionProvider)
  mountScriptedProvider(SelectionScriptedProvider, pi)
}
