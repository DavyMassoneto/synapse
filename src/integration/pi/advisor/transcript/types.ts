import { type AgentMessage } from "@earendil-works/pi-agent-core"
import { type ImageContent, type SystemMessage, type TextContent } from "@earendil-works/pi-ai"

export type ContentBlock = TextContent | ImageContent

export type MessageContent = string | ContentBlock[]

export type ConversationMessage = Exclude<AgentMessage, SystemMessage>
