import {
  type AdvisorBeforeStartHandler,
  type AdvisorCommandDefinition,
  type AdvisorSessionStartHandler,
  type AdvisorShutdownHandler,
  type AdvisorToolResultHandler,
  type AdvisorTurnEndHandler,
} from "#synapse/integration"

export type TurnEndResult = Awaited<ReturnType<AdvisorTurnEndHandler>>

export type CommandCompletions = NonNullable<AdvisorCommandDefinition["getArgumentCompletions"]>

export type AdvisorEventRegistration =
  | ["session_start", AdvisorSessionStartHandler]
  | ["session_shutdown", AdvisorShutdownHandler]
  | ["before_agent_start", AdvisorBeforeStartHandler]
  | ["tool_result", AdvisorToolResultHandler]
  | ["turn_end", AdvisorTurnEndHandler]
