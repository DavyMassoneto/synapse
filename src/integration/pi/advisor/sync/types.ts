import { type AdvisorHost } from "@/integration/pi/advisor";

export type AdvisorToolActivation = Pick<AdvisorHost, "getActiveTools" | "setActiveTools">;
