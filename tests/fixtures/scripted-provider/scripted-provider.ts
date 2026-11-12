import { type ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { readJsonFile } from "../validated-json"
import {
  PI_PROCESS_API,
  PI_PROCESS_API_KEY,
  PI_PROCESS_BASE_URL,
  PI_PROCESS_MODEL_DEFINITION,
  PI_PROCESS_MODEL_VARIABLE,
  PI_PROCESS_PROVIDER_VARIABLE,
  PI_PROCESS_SCRIPT_SCHEMA,
  PI_PROCESS_SCRIPT_VARIABLE,
} from "./constants"
import { requireEnvironment } from "./require-environment"
import { ScriptedModelProvider } from "./scripted-model-provider"

export default function registerPiProcessProvider(pi: ExtensionAPI): void {
  const steps = readJsonFile(requireEnvironment(PI_PROCESS_SCRIPT_VARIABLE), PI_PROCESS_SCRIPT_SCHEMA)
  const scripted = new ScriptedModelProvider(steps)
  const provider = requireEnvironment(PI_PROCESS_PROVIDER_VARIABLE)
  const model = requireEnvironment(PI_PROCESS_MODEL_VARIABLE)
  pi.registerProvider(provider, {
    api: PI_PROCESS_API,
    apiKey: PI_PROCESS_API_KEY,
    baseUrl: PI_PROCESS_BASE_URL,
    models: [{ ...PI_PROCESS_MODEL_DEFINITION, id: model, name: model }],
    streamSimple: scripted.stream.bind(scripted),
  })
}
