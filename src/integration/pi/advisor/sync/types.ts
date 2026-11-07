import { type AdvisorHost } from "#synapse/integration/pi/advisor/index.js";

export type AdvisorToolActivation = Pick<AdvisorHost, "getActiveTools" | "setActiveTools">;
