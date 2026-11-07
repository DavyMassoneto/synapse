import { type AdvisorHost } from "@/integration/pi/advisor";

export type PiExtension = (pi: AdvisorHost) => void;
export type PiInstance = Parameters<PiExtension>[0];
