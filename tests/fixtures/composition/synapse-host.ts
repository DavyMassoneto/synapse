import { type SynapseHost } from "#synapse/composition"
import {
  type AdvisorBeforeStartHandler,
  type AdvisorCommandDefinition,
  type AdvisorSessionStartHandler,
  type AdvisorShutdownHandler,
  type AdvisorTurnEndHandler,
  type AgentTeamBeforeStartHandler,
  type AgentTeamLeadHost,
  type AgentTeamMessageHandler,
  type AgentTeamSettledHandler,
  type AgentTeamShutdownHandler,
  type AgentTeamStartHandler,
  type AgentTeamTurnHandler,
  type CooldownMessageEndHandler,
  type PiIphoneShutdownHandler,
  type PiRouterVirtualModel,
  type ResponseRulesContextHandler,
  type Unsubscribe,
} from "#synapse/integration"
import { AdvisorHostCollector, HostSessionEvents } from "../host"
import {
  COMPOSITION_ADVISOR_NAME,
  COMPOSITION_BEFORE_AGENT_START,
  COMPOSITION_CONTEXT,
  COMPOSITION_CONTEXT_MISSING,
  COMPOSITION_EXECUTION_FORBIDDEN,
  COMPOSITION_MESSAGE_END,
  COMPOSITION_MODEL_MISSING,
  COMPOSITION_SESSION_SHUTDOWN,
  COMPOSITION_SESSION_START,
  COMPOSITION_TURN_END,
} from "./constants"
import { type CompositionContext } from "./context"
import {
  type CompositionExecuteArguments,
  type CompositionExecuteResult,
  type CompositionToolsByName,
  type SynapseCollectedRegistration,
  type SynapseCollectedTool,
  type SynapseMessageHandler,
} from "./types"

export class SynapseHostCollector implements SynapseHost {
  private readonly events = new HostSessionEvents<CompositionContext>()

  readonly starts = this.events.starts

  readonly shutdowns = this.events.shutdowns

  readonly beforeStarts = this.events.beforeStarts

  readonly turns = this.events.turns

  readonly messageEnds: SynapseMessageHandler[] = []

  private readonly advisor = new AdvisorHostCollector()

  get active(): string[] {
    return this.advisor.active
  }

  readonly contexts: ResponseRulesContextHandler[] = []

  readonly tools: CompositionToolsByName = new Map()

  private virtualModel?: PiRouterVirtualModel

  on(event: "session_shutdown", handler: PiIphoneShutdownHandler): Unsubscribe
  on(event: "session_start", handler: AdvisorSessionStartHandler): Unsubscribe
  on(event: "session_shutdown", handler: AdvisorShutdownHandler): Unsubscribe
  on(event: "before_agent_start", handler: AdvisorBeforeStartHandler): Unsubscribe
  on(event: "turn_end", handler: AdvisorTurnEndHandler): Unsubscribe
  on(event: "message_end", handler: CooldownMessageEndHandler): Unsubscribe
  on(event: "context", handler: ResponseRulesContextHandler): Unsubscribe
  on(event: "session_start", handler: AgentTeamStartHandler): Unsubscribe
  on(event: "session_shutdown", handler: AgentTeamShutdownHandler): Unsubscribe
  on(event: "before_agent_start", handler: AgentTeamBeforeStartHandler): Unsubscribe
  on(event: "turn_start", handler: AgentTeamTurnHandler): Unsubscribe
  on(event: "message_end", handler: AgentTeamMessageHandler): Unsubscribe
  on(event: "agent_settled", handler: AgentTeamSettledHandler): Unsubscribe
  on(...registration: SynapseCollectedRegistration): Unsubscribe {
    switch (registration[0]) {
      case COMPOSITION_MESSAGE_END:
        this.messageEnds.push(registration[1])
        return this.unsubscribe
      case COMPOSITION_CONTEXT:
        this.contexts.push(registration[1])
        return this.unsubscribe
      case COMPOSITION_SESSION_START:
      case COMPOSITION_SESSION_SHUTDOWN:
      case COMPOSITION_BEFORE_AGENT_START:
      case COMPOSITION_TURN_END:
        this.events.collect(registration)
        return this.unsubscribe
      default:
        return this.unsubscribe
    }
  }

  async exec(..._args: CompositionExecuteArguments): Promise<CompositionExecuteResult> {
    throw new Error(COMPOSITION_EXECUTION_FORBIDDEN)
  }

  registerTool(tool: SynapseCollectedTool): void {
    this.tools.set(tool.name, tool)
    if (tool.name === COMPOSITION_ADVISOR_NAME) {
      this.advisor.registerTool(tool)
    }
  }

  sendMessage(..._args: Parameters<AgentTeamLeadHost["sendMessage"]>): void {}

  appendEntry(..._args: Parameters<AgentTeamLeadHost["appendEntry"]>): void {}

  unsubscribe(): void {}

  readonly emitSessionStart = this.events.emitSessionStart.bind(this.events)

  readonly emitShutdown = this.events.emitShutdown.bind(this.events)

  readonly requireTool = this.advisor.requireTool.bind(this.advisor)

  readonly getActiveTools = this.advisor.getActiveTools.bind(this.advisor)

  readonly setActiveTools = this.advisor.setActiveTools.bind(this.advisor)

  registerCommand(name: string, command: AdvisorCommandDefinition): void {
    this.advisor.registerCommand(name, command)
  }

  requireContextHandler(): ResponseRulesContextHandler {
    const handler = this.contexts[0]
    if (handler) {
      return handler
    }
    throw new Error(COMPOSITION_CONTEXT_MISSING)
  }

  registerVirtualModel(model: PiRouterVirtualModel): void {
    this.virtualModel = model
  }

  requireVirtualModel(): PiRouterVirtualModel {
    if (this.virtualModel) {
      return this.virtualModel
    }
    throw new Error(COMPOSITION_MODEL_MISSING)
  }
}
