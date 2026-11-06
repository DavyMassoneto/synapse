import { type Advisor } from "@/modules";

export interface HostPort {
  register(advisor: Advisor, signal: AbortSignal, shutdown: () => void): void;
}
