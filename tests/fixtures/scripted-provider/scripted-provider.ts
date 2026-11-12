import { type ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { readJsonFile } from "../validated-json"
import {
  SCRIPTED_PROVIDER_API,
  SCRIPTED_PROVIDER_API_KEY,
  SCRIPTED_PROVIDER_BASE_URL,
  SCRIPTED_PROVIDER_MODEL_DEFINITION,
  SCRIPTED_PROVIDER_PROVIDER,
  SCRIPTED_PROVIDER_SCRIPT_VARIABLE,
} from "./constants"
import { requireEnvironment } from "./require-environment"
import { SCRIPTED_PROVIDER_SCRIPT_SCHEMA } from "./schemas"
import { ScriptedProvider } from "./scripted-model-provider"

export default function registerScriptedProvider(pi: ExtensionAPI): void {
  const steps = readJsonFile(requireEnvironment(SCRIPTED_PROVIDER_SCRIPT_VARIABLE), SCRIPTED_PROVIDER_SCRIPT_SCHEMA)
  const scripted = new ScriptedProvider(steps)
  pi.registerProvider(SCRIPTED_PROVIDER_PROVIDER, {
    api: SCRIPTED_PROVIDER_API,
    apiKey: SCRIPTED_PROVIDER_API_KEY,
    baseUrl: SCRIPTED_PROVIDER_BASE_URL,
    models: [SCRIPTED_PROVIDER_MODEL_DEFINITION],
    streamSimple: scripted.stream.bind(scripted),
  })
}
