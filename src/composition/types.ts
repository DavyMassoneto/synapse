import { type Advisor } from "#synapse/modules/advisor/public"

export interface AdvisorComposition {
  advisor: Advisor
  signal: AbortSignal
  shutdown(): void
}
