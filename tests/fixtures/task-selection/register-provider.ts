import { type ExtensionAPI } from "@earendil-works/pi-coding-agent"
import {
  requireEnvironment,
  SCRIPTED_PROVIDER_API,
  SCRIPTED_PROVIDER_API_KEY,
  SCRIPTED_PROVIDER_BASE_URL,
  SCRIPTED_PROVIDER_MODEL_DEFINITION,
  SCRIPTED_PROVIDER_MODEL_VARIABLE,
  SCRIPTED_PROVIDER_PROVIDER_VARIABLE,
  SCRIPTED_PROVIDER_SCRIPT_SCHEMA,
  SCRIPTED_PROVIDER_SCRIPT_VARIABLE,
} from "../scripted-provider"
import { readJsonFile } from "../validated-json"
import { SelectionScriptedProvider } from "./provider"

export default function registerSelectionProvider(pi: ExtensionAPI): void {
  const script = readJsonFile(requireEnvironment(SCRIPTED_PROVIDER_SCRIPT_VARIABLE), SCRIPTED_PROVIDER_SCRIPT_SCHEMA)
  const scripted = new SelectionScriptedProvider(script)
  const provider = requireEnvironment(SCRIPTED_PROVIDER_PROVIDER_VARIABLE)
  const model = requireEnvironment(SCRIPTED_PROVIDER_MODEL_VARIABLE)
  pi.registerProvider(provider, {
    api: SCRIPTED_PROVIDER_API,
    apiKey: SCRIPTED_PROVIDER_API_KEY,
    baseUrl: SCRIPTED_PROVIDER_BASE_URL,
    models: [{ ...SCRIPTED_PROVIDER_MODEL_DEFINITION, id: model, name: model }],
    streamSimple: scripted.stream.bind(scripted),
  })
}
