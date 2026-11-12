import { type OpenedMember } from "#synapse/modules/agent-team"

export type TeamTestResolve = () => void

export type TeamTestOpenResolve = (opened: OpenedMember) => void
