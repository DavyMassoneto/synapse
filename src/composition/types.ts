import {
  type AdvisorHost,
  type AgentTeamHost,
  type CooldownRetryHost,
  type ModelRouterHost,
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
  PiIphoneExecutionHost

export type SynapseMemberHost = CooldownRetryHost & ResponseRulesHost & ModelRouterHost
