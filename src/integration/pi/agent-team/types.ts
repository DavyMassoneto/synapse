import {
  type BeforeAgentStartEvent,
  type ExtensionAPI,
  type ExtensionContext,
  type ExtensionFactory,
  type MessageEndEvent,
  type SessionShutdownEvent,
  type SessionStartEvent,
  type TurnStartEvent,
} from "@earendil-works/pi-coding-agent"
import { type AgentTeam, type MemberSessions, type TeamClock, type TeamLead } from "#synapse/modules"
import { type TeamRegisteredTool } from "./tools"

export type AgentTeamHost = AgentTeamEventsHost & Pick<ExtensionAPI, "sendMessage" | "appendEntry"> & AgentTeamToolHost

export interface AgentTeamEventsHost {
  on(event: "session_start", handler: AgentTeamStartHandler): AgentTeamUnsubscribe
  on(event: "session_shutdown", handler: AgentTeamShutdownHandler): AgentTeamUnsubscribe
  on(event: "before_agent_start", handler: AgentTeamBeforeStartHandler): AgentTeamUnsubscribe
  on(event: "turn_start", handler: AgentTeamTurnHandler): AgentTeamUnsubscribe
  on(event: "message_end", handler: AgentTeamMessageHandler): AgentTeamUnsubscribe
  on(event: "agent_settled", handler: AgentTeamSettledHandler): AgentTeamUnsubscribe
}

export type AgentTeamUnsubscribe = () => void

export type AgentTeamStartHandler = (event: SessionStartEvent, context: AgentTeamContext) => Promise<void>

export type AgentTeamShutdownHandler = (event: SessionShutdownEvent) => Promise<void>

export type AgentTeamBeforeStartHandler = (event: BeforeAgentStartEvent, context: AgentTeamContext) => void

export type AgentTeamTurnHandler = (event: TurnStartEvent, context: AgentTeamContext) => void

export type AgentTeamMessageHandler = (event: MessageEndEvent) => void

export type AgentTeamSettledHandler = () => void

export type AgentTeamMount = (lead: TeamLead, sessions: MemberSessions, clock: TeamClock) => AgentTeam

export type AgentTeamMemberExtension = ExtensionFactory

export type AgentTeamContext = Pick<ExtensionContext, "cwd" | "mode" | "hasUI" | "model" | "thinkingLevel" | "isIdle"> &
  AgentTeamContextPorts

export interface AgentTeamContextPorts {
  ui: AgentTeamUi
  sessionManager: Pick<ExtensionContext["sessionManager"], AgentTeamSessionOperation>
  modelRegistry: Pick<ExtensionContext["modelRegistry"], AgentTeamRegistryOperation>
}

export type AgentTeamLeadHost = Pick<AgentTeamHost, "sendMessage" | "appendEntry">

export type TeamLeadWidgetFactory = Parameters<ExtensionContext["ui"]["setWidget"]>[1]

export type TeamLeadWidgetContent = string[] | TeamLeadWidgetFactory

export interface AgentTeamUi {
  notify: ExtensionContext["ui"]["notify"]
  setWidget(key: string, content?: TeamLeadWidgetContent): void
}

export type AgentTeamSessionOperation = "getBranch" | "getSessionId"

export type AgentTeamRegistryOperation = "getAvailable" | "find" | "hasConfiguredAuth"

export interface AgentTeamToolHost {
  registerTool(tool: AgentTeamToolDefinition): void
}

export type AgentTeamToolDefinition = Omit<TeamRegisteredTool, "renderCall" | "renderResult">

export interface TeamLeadContextAttached {
  kind: "context-attached"
  context: AgentTeamContext
}

export interface TeamLeadContextDetached {
  kind: "context-detached"
}

export type TeamLeadContextState = TeamLeadContextAttached | TeamLeadContextDetached

export type PiTeamLeadSession = TeamLead & PiTeamLeadLifecycle

export interface PiTeamLeadLifecycle {
  attach(context: AgentTeamContext): void
  detach(): void
  context(): AgentTeamContext
  recordMessage(event: MessageEndEvent): void
}
