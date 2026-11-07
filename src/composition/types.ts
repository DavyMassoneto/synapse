import { type Advisor } from "@/modules";

export interface AdvisorLifecycle {
  signal: AbortSignal;
  shutdown(): void;
}

export interface AdvisorRegistrationPort {
  register(advisor: Advisor, lifecycle: AdvisorLifecycle): void;
}
