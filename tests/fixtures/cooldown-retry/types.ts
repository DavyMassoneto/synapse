import { type Api, type ProviderId, type Usage } from "@earendil-works/pi-ai"

export interface CooldownAssistantFields {
  role: "assistant"
  api: Api
  provider: ProviderId
  model: string
  usage: Usage
  timestamp: number
}
