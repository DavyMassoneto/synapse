import { type CooldownMessageEndHandler, type ResponseRulesContextHandler } from "#synapse/integration"
import { type AdvisorEventRegistration } from "../host"

export type SynapseEventRegistration =
  | AdvisorEventRegistration
  | ["message_end", CooldownMessageEndHandler]
  | ["context", ResponseRulesContextHandler]
