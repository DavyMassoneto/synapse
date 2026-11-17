import { type ExtensionFactory } from "@earendil-works/pi-coding-agent"
import { mountScriptedProvider } from "./register-provider"
import { ScriptedProvider } from "./scripted-model-provider"

const registerScriptedProvider: ExtensionFactory = mountScriptedProvider.bind(undefined, ScriptedProvider)

export default registerScriptedProvider
