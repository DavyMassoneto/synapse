import { type AssistantMessage, type ImageContent } from "@earendil-works/pi-ai"

export type TextBlocks = Array<ImageContent | AssistantMessage["content"][number]>
