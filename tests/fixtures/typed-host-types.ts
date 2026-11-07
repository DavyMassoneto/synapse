import {
  type AdvisorBeforeStartHandler,
  type AdvisorSessionStartHandler,
  type AdvisorShutdownHandler,
  type AdvisorToolResultHandler,
  type AdvisorTurnEndHandler,
} from "#synapse/integration/index.js";

export type AdvisorEventRegistration =
  | ["session_start", AdvisorSessionStartHandler]
  | ["session_shutdown", AdvisorShutdownHandler]
  | ["before_agent_start", AdvisorBeforeStartHandler]
  | ["tool_result", AdvisorToolResultHandler]
  | ["turn_end", AdvisorTurnEndHandler];
