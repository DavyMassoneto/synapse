import { type AdvisorHost, type CooldownRetryHost, type ResponseRulesHost } from "#synapse/integration"

export type SynapseHost = AdvisorHost & CooldownRetryHost & ResponseRulesHost
