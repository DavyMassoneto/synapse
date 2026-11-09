import { type Advisor } from "../modules"

export interface AdvisorLifecycle {
  signal: AbortSignal
  shutdown(): void
}

export interface AdvisorComposition extends AdvisorLifecycle {
  advisor: Advisor
}
