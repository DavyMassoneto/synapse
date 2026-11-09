import { type AdvisorHost } from "../contracts"

export type AdvisorToolActivation = Pick<AdvisorHost, "getActiveTools" | "setActiveTools">
