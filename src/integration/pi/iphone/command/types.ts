import { type ExtensionCommandContext } from "@earendil-works/pi-coding-agent"

export interface PiIphoneCommandContext {
  ui: Pick<ExtensionCommandContext["ui"], "notify">
}
