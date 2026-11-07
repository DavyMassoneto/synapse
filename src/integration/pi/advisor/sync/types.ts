import { type AdvisorHost } from "#synapse/integration/pi/advisor/contracts";

export type AdvisorToolActivation = Pick<AdvisorHost, "getActiveTools" | "setActiveTools">;
