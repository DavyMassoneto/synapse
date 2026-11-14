import { type ExtensionAPI, type ExtensionContext, type MessageEndEvent } from "@earendil-works/pi-coding-agent"
import { type TeamLead } from "#synapse/modules"
import { type MemberModelContext } from "../model-selection"

export interface TeamLeadContextAttached {
  kind: "context-attached"
  context: AgentTeamContext
}

export interface TeamLeadContextDetached {
  kind: "context-detached"
}

export type TeamLeadContextState = TeamLeadContextAttached | TeamLeadContextDetached

export type AgentTeamContext = Pick<ExtensionContext, "cwd" | "mode" | "hasUI" | "model" | "thinkingLevel" | "isIdle"> &
  AgentTeamContextPorts

export interface AgentTeamContextPorts extends Pick<MemberModelContext, "modelRegistry"> {
  ui: AgentTeamUi
  sessionManager: Pick<ExtensionContext["sessionManager"], AgentTeamSessionOperation>
}

export type AgentTeamLeadHost = Pick<ExtensionAPI, "sendMessage" | "appendEntry">

export type TeamLeadWidgetFactory = Parameters<ExtensionContext["ui"]["setWidget"]>[1]

export type TeamLeadWidgetContent = string[] | TeamLeadWidgetFactory

export interface AgentTeamUi {
  notify: ExtensionContext["ui"]["notify"]
  setWidget(key: string, content?: TeamLeadWidgetContent): void
}

export type AgentTeamSessionOperation = "getBranch" | "getSessionId"

export type PiTeamLeadSession = TeamLead & PiTeamLeadLifecycle

export interface PiTeamLeadLifecycle {
  attach(context: AgentTeamContext): void
  detach(): void
  context(): AgentTeamContext
  recordMessage(event: MessageEndEvent): void
}
