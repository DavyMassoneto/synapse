import { type Api, type Model } from "@earendil-works/pi-ai"
import { type ExtensionContext, type SessionEntry } from "@earendil-works/pi-coding-agent"
import { type AgentTeamContext, type TeamLeadWidgetContent } from "#synapse/integration"
import { ToolsModelRegistry } from "../tools"
import {
  TEAM_SESSION_FIXTURE_RPC_MODE,
  TEAM_SESSION_FIXTURE_TEST_CWD,
  TEAM_SESSION_FIXTURE_TEST_LEAD,
  TEAM_SESSION_FIXTURE_THINKING_LEVEL,
} from "./constants"
import { type TeamWidgetOptions } from "./types"

export class TeamLeadContext implements AgentTeamContext {
  readonly cwd = TEAM_SESSION_FIXTURE_TEST_CWD

  readonly mode = TEAM_SESSION_FIXTURE_RPC_MODE

  readonly hasUI = true

  readonly model: Model<Api>

  readonly thinkingLevel = TEAM_SESSION_FIXTURE_THINKING_LEVEL

  readonly modelRegistry: ToolsModelRegistry

  readonly sessionManager = this

  readonly ui = this

  readonly notifications: string[] = []

  readonly widgets: string[] = []

  entries: SessionEntry[] = []

  constructor(model: Model<Api>) {
    this.model = model
    this.modelRegistry = new ToolsModelRegistry(model)
  }

  isIdle(): boolean {
    return true
  }

  getSessionId(): string {
    return TEAM_SESSION_FIXTURE_TEST_LEAD
  }

  getBranch(): SessionEntry[] {
    return this.entries
  }

  notify(...args: Parameters<ExtensionContext["ui"]["notify"]>): void {
    this.notifications.push(JSON.stringify(args))
  }

  setWidget(key: string, content?: TeamLeadWidgetContent, options?: TeamWidgetOptions): void {
    this.widgets.push(JSON.stringify([key, content, options]))
  }
}
