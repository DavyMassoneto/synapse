import { type ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { readJsonFile } from "../validated-json"
import {
  PI_PROCESS_API,
  PI_PROCESS_API_KEY,
  PI_PROCESS_BASE_URL,
  PI_PROCESS_MODEL_DEFINITION,
  PI_PROCESS_PROVIDER,
  PI_PROCESS_SCRIPT_VARIABLE,
} from "./constants"
import { requireEnvironment } from "./require-environment"
import { PI_PROCESS_SCRIPT_SCHEMA } from "./schemas"
import { ScriptedModelProvider } from "./scripted-model-provider"

export default function registerPiProcessProvider(pi: ExtensionAPI): void {
  const steps = readJsonFile(requireEnvironment(PI_PROCESS_SCRIPT_VARIABLE), PI_PROCESS_SCRIPT_SCHEMA)
  const scripted = new ScriptedModelProvider(steps)
  pi.registerProvider(PI_PROCESS_PROVIDER, {
    api: PI_PROCESS_API,
    apiKey: PI_PROCESS_API_KEY,
    baseUrl: PI_PROCESS_BASE_URL,
    models: [PI_PROCESS_MODEL_DEFINITION],
    streamSimple: scripted.stream.bind(scripted),
  })
}
