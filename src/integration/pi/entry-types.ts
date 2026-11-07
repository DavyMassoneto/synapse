import type { AdvisorHost } from "#synapse/integration/pi/advisor";

export type PiExtension = (pi: AdvisorHost) => void;
export type PiInstance = Parameters<PiExtension>[0];
