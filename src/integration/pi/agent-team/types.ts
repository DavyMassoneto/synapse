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
import {
  type TEAM_PI_AGENT_SETTLED,
  type TEAM_PI_BEFORE_AGENT_START,
  type TEAM_PI_CONTEXT_ATTACHED,
  type TEAM_PI_CONTEXT_DETACHED,
  type TEAM_PI_MESSAGE_END,
  type TEAM_PI_SESSION_SHUTDOWN,
  type TEAM_PI_SESSION_START,
  type TEAM_PI_TURN_START,
} from "./constants"
import { type TeamRegisteredTool } from "./tools"

export type AgentTeamHost = AgentTeamEventsHost & Pick<ExtensionAPI, "sendMessage" | "appendEntry"> & AgentTeamToolHost

export interface AgentTeamEventsHost {
  on(event: typeof TEAM_PI_SESSION_START, handler: AgentTeamStartHandler): AgentTeamUnsubscribe
  on(event: typeof TEAM_PI_SESSION_SHUTDOWN, handler: AgentTeamShutdownHandler): AgentTeamUnsubscribe
  on(event: typeof TEAM_PI_BEFORE_AGENT_START, handler: AgentTeamBeforeStartHandler): AgentTeamUnsubscribe
  on(event: typeof TEAM_PI_TURN_START, handler: AgentTeamTurnHandler): AgentTeamUnsubscribe
  on(event: typeof TEAM_PI_MESSAGE_END, handler: AgentTeamMessageHandler): AgentTeamUnsubscribe
  on(event: typeof TEAM_PI_AGENT_SETTLED, handler: AgentTeamSettledHandler): AgentTeamUnsubscribe
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
  kind: typeof TEAM_PI_CONTEXT_ATTACHED
  context: AgentTeamContext
}

export interface TeamLeadContextDetached {
  kind: typeof TEAM_PI_CONTEXT_DETACHED
}

export type TeamLeadContextState = TeamLeadContextAttached | TeamLeadContextDetached

export type PiTeamLeadSession = TeamLead & PiTeamLeadLifecycle

export interface PiTeamLeadLifecycle {
  attach(context: AgentTeamContext): void
  detach(): void
  context(): AgentTeamContext
  recordMessage(event: MessageEndEvent): void
}
