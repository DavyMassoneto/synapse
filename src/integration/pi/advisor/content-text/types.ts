import { type AssistantMessage, type ImageContent } from "@earendil-works/pi-ai"

export type MessageContentBlocks = Array<ImageContent | AssistantMessage["content"][number]>
