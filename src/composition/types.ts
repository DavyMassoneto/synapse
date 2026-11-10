import { type Advisor } from "../modules"

export interface AdvisorComposition {
  advisor: Advisor
  signal: AbortSignal
  shutdown(): void
}
