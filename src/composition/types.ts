import {
  type AdvisorHost,
  type AgentTeamHost,
  type CapabilityPresenceHost,
  type CooldownRetryHost,
  type ModelRouterHost,
  type PiComputerHost,
  type PiIphoneExecutionHost,
  type PiIphoneHost,
  type ResponseRulesHost,
} from "#synapse/integration"

export type SynapseHost = AdvisorHost &
  CooldownRetryHost &
  ResponseRulesHost &
  ModelRouterHost &
  AgentTeamHost &
  PiIphoneHost &
  PiIphoneExecutionHost &
  PiComputerHost

export type SynapseCooldownHost = CooldownRetryHost & CapabilityPresenceHost
export type SynapseRulesHost = ResponseRulesHost & CapabilityPresenceHost
export type SynapseRouterHost = ModelRouterHost & CapabilityPresenceHost
export type SynapseIphoneHost = PiIphoneHost & PiIphoneExecutionHost
