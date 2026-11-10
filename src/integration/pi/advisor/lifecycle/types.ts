import {
  type BeforeAgentStartEvent,
  type ExtensionAPI,
  type ExtensionHandler,
  type SessionShutdownEvent,
  type SessionStartEvent,
  type ToolResultEvent,
  type TurnEndEvent,
  type TurnEndEventResult,
} from "@earendil-works/pi-coding-agent"
import { type AdvisorContext } from "../host-context"

export type AdvisorToolActivation = Pick<ExtensionAPI, "getActiveTools" | "setActiveTools">

export type Unsubscribe = () => void

export type AdvisorSessionStartHandler = (event: SessionStartEvent, context: AdvisorContext) => void | Promise<void>

export type AdvisorShutdownHandler = (event: SessionShutdownEvent, context: AdvisorContext) => void | Promise<void>

export type AdvisorBeforeStartHandler = (event: BeforeAgentStartEvent, context: AdvisorContext) => void | Promise<void>

export type AdvisorToolResultHandler = (event: ToolResultEvent, context: AdvisorContext) => void | Promise<void>

export type TurnEndOutcome = ReturnType<ExtensionHandler<TurnEndEvent, TurnEndEventResult>>

export type AdvisorTurnEndHandler = (event: TurnEndEvent, context: AdvisorContext) => TurnEndOutcome

export interface EventSubscriber {
  on(event: "session_start", handler: AdvisorSessionStartHandler): Unsubscribe
  on(event: "session_shutdown", handler: AdvisorShutdownHandler): Unsubscribe
  on(event: "before_agent_start", handler: AdvisorBeforeStartHandler): Unsubscribe
  on(event: "tool_result", handler: AdvisorToolResultHandler): Unsubscribe
  on(event: "turn_end", handler: AdvisorTurnEndHandler): Unsubscribe
}

export type LifecycleHost = EventSubscriber & AdvisorToolActivation
