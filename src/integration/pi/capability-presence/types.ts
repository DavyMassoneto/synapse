import { type ExtensionAPI } from "@earendil-works/pi-coding-agent"

export type CapabilityPresenceHost = Pick<ExtensionAPI, "events">

export interface PresentCapabilities {
  cooldownRetry: boolean
  responseRules: boolean
  modelRouter: boolean
}
