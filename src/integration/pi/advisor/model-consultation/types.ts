import { type AssistantMessage, type ImageContent } from "@earendil-works/pi-ai"

export interface PiThinkingBudgets {
  off: number
  minimal: number
  low: number
  medium: number
  high: number
  xhigh: number
  max: number
}

export type TextBlocks = Array<ImageContent | AssistantMessage["content"][number]>
