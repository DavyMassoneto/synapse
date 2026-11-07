import {
  type BeforeAgentStartEvent,
  type BeforeAgentStartEventResult,
  type ExtensionAPI,
  type RegisteredCommand,
  type SessionShutdownEvent,
  type SessionStartEvent,
  type ToolResultEvent,
  type ToolResultEventResult,
  type TurnEndEvent,
  type TurnEndEventResult,
} from "@earendil-works/pi-coding-agent";
import { type AdvisorContext } from "./context-types.ts";
import { type AdvisorTool } from "./tool-types.ts";

export interface AdvisorCommandDefinition
  extends Pick<RegisteredCommand, "description" | "getArgumentCompletions"> {
  handler(args: string, context: AdvisorContext): Promise<void>;
}

export interface AdvisorHost extends Pick<ExtensionAPI, "getActiveTools" | "setActiveTools"> {
  registerTool(tool: AdvisorTool): void;
  registerCommand(name: string, command: AdvisorCommandDefinition): void;
  on(event: "session_start", handler: AdvisorSessionStartHandler): () => void;
  on(event: "session_shutdown", handler: AdvisorShutdownHandler): () => void;
  on(event: "before_agent_start", handler: AdvisorBeforeStartHandler): () => void;
  on(event: "tool_result", handler: AdvisorToolResultHandler): () => void;
  on(event: "turn_end", handler: AdvisorTurnEndHandler): () => void;
}

export type AdvisorSessionStartHandler = (
  event: SessionStartEvent,
  context: AdvisorContext,
) => void | Promise<void>;
export type AdvisorShutdownHandler = (
  event: SessionShutdownEvent,
  context: AdvisorContext,
) => void | Promise<void>;
export type AdvisorBeforeStartHandler = (
  event: BeforeAgentStartEvent,
  context: AdvisorContext,
) => BeforeAgentStartEventResult | undefined | Promise<BeforeAgentStartEventResult | undefined>;
export type AdvisorToolResultHandler = (
  event: ToolResultEvent,
  context: AdvisorContext,
) => ToolResultEventResult | undefined | Promise<ToolResultEventResult | undefined>;
export type AdvisorTurnEndHandler = (
  event: TurnEndEvent,
  context: AdvisorContext,
) => TurnEndEventResult | undefined | Promise<TurnEndEventResult | undefined>;
