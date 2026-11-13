import {
  type AdvisorHost,
  type CooldownRetryHost,
  type ModelRouterHost,
  type ResponseRulesHost,
} from "#synapse/integration"

export type SynapseHost = AdvisorHost & CooldownRetryHost & ResponseRulesHost & ModelRouterHost
