import { type Advisor } from "#synapse/modules/index.js";

export interface AdvisorLifecycle {
  signal: AbortSignal;
  shutdown(): void;
}

export interface AdvisorRegistrationPort {
  register(advisor: Advisor, lifecycle: AdvisorLifecycle): void;
}
