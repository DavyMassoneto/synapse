import { type AdvisorHost, type AdvisorTool } from "#synapse/integration/pi/advisor"
import {
  type AgentTeamBeforeStartHandler,
  type AgentTeamHost,
  type AgentTeamMessageHandler,
  type AgentTeamSettledHandler,
  type AgentTeamShutdownHandler,
  type AgentTeamStartHandler,
  type AgentTeamToolDefinition,
  type AgentTeamTurnHandler,
  type TeamLeadWidgetContent,
} from "#synapse/integration/pi/agent-team"
import {
  type PiComputerHost,
  type PiComputerShutdown,
  type PiComputerToolDefinition,
} from "#synapse/integration/pi/computer-use"
import { type CooldownMessageEndHandler, type CooldownRetryHost } from "#synapse/integration/pi/cooldown-retry"
import {
  type PiIphoneExecutionHost,
  type PiIphoneHost,
  type PiIphoneShutdownHandler,
  type PiIphoneToolDefinition,
} from "#synapse/integration/pi/iphone"
import { type ModelRouterHost } from "#synapse/integration/pi/model-router"
import { type ResponseRulesContextHandler, type ResponseRulesHost } from "#synapse/integration/pi/response-rules"
import { type TeamWidgetOptions } from "../agent-team"
import { type AdvisorEventRegistration } from "../host"

export type SynapseHost = AdvisorHost &
  CooldownRetryHost &
  ResponseRulesHost &
  ModelRouterHost &
  AgentTeamHost &
  PiIphoneHost &
  PiIphoneExecutionHost &
  PiComputerHost

export type SynapseCollectedTool =
  | AdvisorTool
  | AgentTeamToolDefinition
  | PiIphoneToolDefinition
  | PiComputerToolDefinition

export type SynapseEventRegistration =
  | AdvisorEventRegistration
  | ["message_end", CooldownMessageEndHandler]
  | ["context", ResponseRulesContextHandler]

export type SynapseTeamEventRegistration =
  | ["session_start", AgentTeamStartHandler]
  | ["session_shutdown", AgentTeamShutdownHandler]
  | ["session_shutdown", PiIphoneShutdownHandler]
  | ["session_shutdown", PiComputerShutdown]
  | ["before_agent_start", AgentTeamBeforeStartHandler]
  | ["turn_start", AgentTeamTurnHandler]
  | ["message_end", AgentTeamMessageHandler]
  | ["agent_settled", AgentTeamSettledHandler]

export type SynapseCollectedRegistration = SynapseEventRegistration | SynapseTeamEventRegistration

export type SynapseMessageHandler = AgentTeamMessageHandler | CooldownMessageEndHandler

export interface CompositionWidget {
  key: string
  content?: TeamLeadWidgetContent
  options?: TeamWidgetOptions
}

export type CompositionExecuteArguments = Parameters<PiIphoneExecutionHost["exec"]>

export type CompositionExecuteResult = Awaited<ReturnType<PiIphoneExecutionHost["exec"]>>

export type CompositionToolsByName = Map<string, SynapseCollectedTool>
