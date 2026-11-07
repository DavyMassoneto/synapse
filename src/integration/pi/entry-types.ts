import { type AdvisorHost } from "#synapse/integration/pi/advisor/index.js";

export type PiExtension = (pi: AdvisorHost) => void;
export type PiInstance = Parameters<PiExtension>[0];
