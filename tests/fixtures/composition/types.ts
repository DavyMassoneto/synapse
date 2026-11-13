import {
  type AdvisorTool,
  type AgentTeamBeforeStartHandler,
  type AgentTeamMessageHandler,
  type AgentTeamSettledHandler,
  type AgentTeamShutdownHandler,
  type AgentTeamStartHandler,
  type AgentTeamToolDefinition,
  type AgentTeamTurnHandler,
  type CooldownMessageEndHandler,
  type ResponseRulesContextHandler,
} from "#synapse/integration"
import { type TeamWidgetContent, type TeamWidgetOptions } from "../agent-team"
import { type AdvisorEventRegistration } from "../host"

export type SynapseCollectedTool = AdvisorTool | AgentTeamToolDefinition

export type SynapseEventRegistration =
  | AdvisorEventRegistration
  | ["message_end", CooldownMessageEndHandler]
  | ["context", ResponseRulesContextHandler]

export type SynapseTeamEventRegistration =
  | ["session_start", AgentTeamStartHandler]
  | ["session_shutdown", AgentTeamShutdownHandler]
  | ["before_agent_start", AgentTeamBeforeStartHandler]
  | ["turn_start", AgentTeamTurnHandler]
  | ["message_end", AgentTeamMessageHandler]
  | ["agent_settled", AgentTeamSettledHandler]

export type SynapseCollectedRegistration = SynapseEventRegistration | SynapseTeamEventRegistration

export type SynapseMessageHandler = AgentTeamMessageHandler | CooldownMessageEndHandler

export interface CompositionWidget {
  key: string
  content?: TeamWidgetContent
  options?: TeamWidgetOptions
}

export type CompositionToolsByName = Map<string, SynapseCollectedTool>
