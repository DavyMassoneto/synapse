import { type ImageContent, type TextContent } from "@earendil-works/pi-ai"
import { type ContextEvent, type ContextEventResult, type ExtensionHandler } from "@earendil-works/pi-coding-agent"

export interface ResponseRulesTextFound {
  kind: "found"
  text: string
}

export interface ResponseRulesTextAbsent {
  kind: "absent"
}

export type ResponseRulesTextResult = ResponseRulesTextFound | ResponseRulesTextAbsent

export interface ResponseRulesApplied {
  kind: "applied"
  messages: ContextEvent["messages"]
}

export interface ResponseRulesNotApplied {
  kind: "absent"
}

export type ResponseRulesApplyResult = ResponseRulesApplied | ResponseRulesNotApplied

export type ResponseRulesBlocks = (TextContent | ImageContent)[]

export type ResponseRulesContent = string | ResponseRulesBlocks

export type ResponseRulesContextOutcome = ReturnType<ExtensionHandler<ContextEvent, ContextEventResult>>

export type ResponseRulesContextHandler = (event: ContextEvent) => ResponseRulesContextOutcome

export type ResponseRulesUnsubscribe = () => void

export interface ResponseRulesHost {
  on(event: "context", handler: ResponseRulesContextHandler): ResponseRulesUnsubscribe
}
