import { type AgentMessage } from "@earendil-works/pi-agent-core"
import { type ImageContent, type SystemMessage, type TextContent } from "@earendil-works/pi-ai"
import { type ExtensionContext } from "@earendil-works/pi-coding-agent"

export type ContentBlock = TextContent | ImageContent

export type MessageContent = string | ContentBlock[]

export type ConversationMessage = Exclude<AgentMessage, SystemMessage>

export type AdvisorSession = Pick<ExtensionContext["sessionManager"], "buildSessionProjection">

export interface TranscriptSource {
  sessionManager: AdvisorSession
}
