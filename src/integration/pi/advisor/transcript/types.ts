import { type AgentMessage } from "@earendil-works/pi-agent-core"
import { type ImageContent, type SystemMessage, type TextContent } from "@earendil-works/pi-ai"

export type MessageContent = string | (TextContent | ImageContent)[]

export type ConversationMessage = Exclude<AgentMessage, SystemMessage>
