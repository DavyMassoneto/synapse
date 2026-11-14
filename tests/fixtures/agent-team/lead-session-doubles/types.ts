import { type ExtensionContext } from "@earendil-works/pi-coding-agent"
import { type AgentTeamLeadHost } from "#synapse/integration"

export type TeamWidgetOptions = Parameters<ExtensionContext["ui"]["setWidget"]>[2]

export type TeamRecordedNotice = Parameters<AgentTeamLeadHost["sendMessage"]>

export type TeamRecordedEntry = Parameters<AgentTeamLeadHost["appendEntry"]>

export type TeamExtensionShutdownRelease = () => void
