import { type Advisor } from "#synapse/modules";

export interface AdvisorLifecycle {
  signal: AbortSignal;
  shutdown(): void;
}

export interface AdvisorRegistrationPort {
  register(advisor: Advisor, lifecycle: AdvisorLifecycle): void;
}
