import { type Settings } from "../settings"
import { callModel } from "./call-model"
import { type ChatMessage, type ModelCaller } from "./types"

export function createModelCaller(settings: Settings): ModelCaller {
  return (messages: ChatMessage[]) => callModel(settings, messages)
}
