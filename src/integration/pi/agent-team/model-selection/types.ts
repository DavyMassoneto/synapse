import { type Api, type Model, type ModelThinkingLevel } from "@earendil-works/pi-ai"
import { type ExtensionContext } from "@earendil-works/pi-coding-agent"

export interface MemberModelSelection {
  model?: string
  thinking?: string
}

export type MemberModelContext = Pick<ExtensionContext, "cwd" | "model" | "thinkingLevel"> & MemberModelRegistryContext

export type MemberModelRegistryOperation = "getAvailable" | "find" | "hasConfiguredAuth"

export interface MemberModelRegistryContext {
  modelRegistry: Pick<ExtensionContext["modelRegistry"], MemberModelRegistryOperation>
}

export interface SelectedMemberModel {
  model: Model<Api>
  thinkingLevel: ModelThinkingLevel
}

export interface AvailableMemberModel {
  reference: string
  thinkingLevels: ModelThinkingLevel[]
}
