import { type SessionEntry } from "@earendil-works/pi-coding-agent"
import { type AgentTeamContext } from "#synapse/integration"
import { type TeamWidgetContent, type TeamWidgetOptions } from "../agent-team"
import { TestContext, TestSession, TestUI } from "../context"
import { COMPOSITION_RPC_MODE, COMPOSITION_SESSION_ID, COMPOSITION_THINKING_LEVEL } from "./constants"
import { type CompositionWidget } from "./types"

export class CompositionSession extends TestSession {
  getBranch(): SessionEntry[] {
    return []
  }

  getSessionId(): string {
    return COMPOSITION_SESSION_ID
  }
}

export class CompositionUI extends TestUI {
  readonly widgets: CompositionWidget[] = []

  setWidget(key: string, content?: TeamWidgetContent, options?: TeamWidgetOptions): void {
    this.widgets.push({ key, content, options })
  }
}

export class CompositionContext extends TestContext implements AgentTeamContext {
  override readonly sessionManager = new CompositionSession()

  override readonly ui = new CompositionUI()

  readonly cwd = process.cwd()

  readonly mode = COMPOSITION_RPC_MODE

  readonly thinkingLevel = COMPOSITION_THINKING_LEVEL

  readonly model = this.modelRegistry.model

  isIdle(): boolean {
    return true
  }
}
