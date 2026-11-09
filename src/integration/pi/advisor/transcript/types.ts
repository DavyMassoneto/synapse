import { type ImageContent, type TextContent } from "@earendil-works/pi-ai"
import { type TranscriptMessage } from "#synapse/modules"

export type MessageContent = string | (TextContent | ImageContent)[]

export type ConvertedMessage = TranscriptMessage | undefined
