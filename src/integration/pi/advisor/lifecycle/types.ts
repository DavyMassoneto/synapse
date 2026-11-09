import { type AdvisorHost } from "../host"

export type AdvisorToolActivation = Pick<AdvisorHost, "getActiveTools" | "setActiveTools">
