import { type CooldownMessageEndHandler } from "#synapse/integration"
import { type AdvisorEventRegistration } from "../host"

export type SynapseEventRegistration = AdvisorEventRegistration | ["message_end", CooldownMessageEndHandler]
