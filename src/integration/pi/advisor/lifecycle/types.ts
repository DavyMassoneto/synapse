import {
  type BeforeAgentStartEvent,
  type BeforeAgentStartEventResult,
  type ExtensionAPI,
  type SessionShutdownEvent,
  type SessionStartEvent,
  type ToolResultEvent,
  type ToolResultEventResult,
  type TurnEndEvent,
  type TurnEndEventResult,
} from "@earendil-works/pi-coding-agent"
import { type AdvisorContext } from "../host"

export type AdvisorToolActivation = Pick<ExtensionAPI, "getActiveTools" | "setActiveTools">

export type Unsubscribe = () => void

export type AdvisorSessionStartHandler = (event: SessionStartEvent, context: AdvisorContext) => void | Promise<void>

export type AdvisorShutdownHandler = (event: SessionShutdownEvent, context: AdvisorContext) => void | Promise<void>

export type BeforeStartOutcome = BeforeAgentStartEventResult | undefined

export type AdvisorBeforeStartHandler = (
  event: BeforeAgentStartEvent,
  context: AdvisorContext,
) => BeforeStartOutcome | Promise<BeforeStartOutcome>

export type ToolResultOutcome = ToolResultEventResult | undefined

export type AdvisorToolResultHandler = (
  event: ToolResultEvent,
  context: AdvisorContext,
) => ToolResultOutcome | Promise<ToolResultOutcome>

export type TurnEndOutcome = TurnEndEventResult | undefined

export type AdvisorTurnEndHandler = (
  event: TurnEndEvent,
  context: AdvisorContext,
) => TurnEndOutcome | Promise<TurnEndOutcome>

export interface EventSubscriber {
  on(event: "session_start", handler: AdvisorSessionStartHandler): Unsubscribe
  on(event: "session_shutdown", handler: AdvisorShutdownHandler): Unsubscribe
  on(event: "before_agent_start", handler: AdvisorBeforeStartHandler): Unsubscribe
  on(event: "tool_result", handler: AdvisorToolResultHandler): Unsubscribe
  on(event: "turn_end", handler: AdvisorTurnEndHandler): Unsubscribe
}

export interface LifecycleHost extends EventSubscriber, AdvisorToolActivation {}
