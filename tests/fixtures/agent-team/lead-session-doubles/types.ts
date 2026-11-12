import { type ExtensionContext } from "@earendil-works/pi-coding-agent"
import { type AgentTeamLeadHost } from "#synapse/integration"

export type TeamWidgetFactory = Parameters<ExtensionContext["ui"]["setWidget"]>[1]

export type TeamWidgetContent = string[] | TeamWidgetFactory

export type TeamWidgetOptions = Parameters<ExtensionContext["ui"]["setWidget"]>[2]

export type TeamRecordedNotice = Parameters<AgentTeamLeadHost["sendMessage"]>

export type TeamRecordedEntry = Parameters<AgentTeamLeadHost["appendEntry"]>
