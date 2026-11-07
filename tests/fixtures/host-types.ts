import type {
  AdvisorBeforeStartHandler,
  AdvisorSessionStartHandler,
  AdvisorShutdownHandler,
  AdvisorToolResultHandler,
  AdvisorTurnEndHandler,
} from "#synapse/integration";

export type AdvisorEventRegistration =
  | ["session_start", AdvisorSessionStartHandler]
  | ["session_shutdown", AdvisorShutdownHandler]
  | ["before_agent_start", AdvisorBeforeStartHandler]
  | ["tool_result", AdvisorToolResultHandler]
  | ["turn_end", AdvisorTurnEndHandler];
