import {
  type BeforeAgentStartEvent,
  type SessionShutdownEvent,
  type SessionStartEvent,
  type TurnEndEvent,
} from "@earendil-works/pi-coding-agent"

import {
  type AdvisorBeforeStartHandler,
  type AdvisorCommandDefinition,
  type AdvisorSessionStartHandler,
  type AdvisorShutdownHandler,
  type AdvisorTurnEndHandler,
} from "#synapse/integration"

export type TurnEndResult = Awaited<ReturnType<AdvisorTurnEndHandler>>

export type CommandCompletions = NonNullable<AdvisorCommandDefinition["getArgumentCompletions"]>

export type AdvisorEventRegistration =
  | ["session_start", AdvisorSessionStartHandler]
  | ["session_shutdown", AdvisorShutdownHandler]
  | ["before_agent_start", AdvisorBeforeStartHandler]
  | ["turn_end", AdvisorTurnEndHandler]

export type CollectedSessionStart<C> = (event: SessionStartEvent, context: C) => Promise<void> | void

export type CollectedSessionShutdown<C> = (event: SessionShutdownEvent, context: C) => Promise<void> | void

export type CollectedBeforeStart<C> = (event: BeforeAgentStartEvent, context: C) => Promise<void> | void

export type CollectedTurnEnd<C> = (event: TurnEndEvent, context: C) => Promise<TurnEndResult> | TurnEndResult

export type HostSessionRegistration<C> =
  | ["session_start", CollectedSessionStart<C>]
  | ["session_shutdown", CollectedSessionShutdown<C>]
  | ["before_agent_start", CollectedBeforeStart<C>]
  | ["turn_end", CollectedTurnEnd<C>]
