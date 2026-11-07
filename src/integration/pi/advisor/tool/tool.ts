import { type AgentToolUpdateCallback } from "@earendil-works/pi-coding-agent";
import {
  ADVISOR_MESSAGES,
  ADVISOR_TOOL_DESCRIPTION,
  ADVISOR_TOOL_SNIPPET,
} from "@/integration/pi/advisor/presentation";
import { renderAdvisorCall, renderAdvisorResult } from "@/integration/pi/advisor/rendering";
import { type Advisor } from "@/modules";
import { type AdvisorContext } from "../context-types.ts";
import { type AdvisorHost } from "../host-types.ts";
import { advisorUnavailable } from "./diagnostics.ts";
import { AdvisorModel } from "./model.ts";
import { advisorParameters } from "./tool-schema.ts";
import {
  type AdvisorToolDetails,
  type AdvisorToolInput,
  type AdvisorToolResult,
} from "./tool-types.ts";
import { captureTranscript } from "./transcript.ts";

class AdvisorToolHandler {
  constructor(
    private readonly advisor: Advisor,
    private readonly lifetime: AbortSignal,
  ) {}

  async execute(
    _id: string,
    _params: AdvisorToolInput,
    signal: AbortSignal | undefined,
    onUpdate: AgentToolUpdateCallback<AdvisorToolDetails> | undefined,
    context: AdvisorContext,
  ): AdvisorToolResult {
    const callSignal = signal ? AbortSignal.any([signal, this.lifetime]) : this.lifetime;
    if (callSignal.aborted) {
      return {
        content: [{ type: "text", text: ADVISOR_MESSAGES.cancelled }],
        details: {},
        isError: true,
      };
    }

    try {
      onUpdate?.({ content: [{ type: "text", text: ADVISOR_MESSAGES.progress }], details: {} });

      const advisorModel = new AdvisorModel(context.modelRegistry);
      const result = await this.advisor.consult(
        {
          system: context.getSystemPrompt(),
          messages: captureTranscript(context),
          signal: callSignal,
        },
        advisorModel,
      );

      if (result.kind === "cancelled") {
        return {
          content: [{ type: "text", text: ADVISOR_MESSAGES.cancelled }],
          details: {},
          isError: true,
        };
      }
      if (result.kind === "failure") {
        return { content: [{ type: "text", text: result.message }], details: {}, isError: true };
      }
      return {
        content: [{ type: "text", text: result.response.text }],
        details: { model: result.model },
        usage: result.response.usage,
      };
    } catch (error) {
      if (callSignal.aborted) {
        return {
          content: [{ type: "text", text: ADVISOR_MESSAGES.cancelled }],
          details: {},
          isError: true,
        };
      }
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: advisorUnavailable(message),
          },
        ],
        details: {},
        isError: true,
      };
    }
  }
}

export function registerTool(pi: AdvisorHost, advisor: Advisor, lifetime: AbortSignal): void {
  const handler = new AdvisorToolHandler(advisor, lifetime);
  pi.registerTool({
    name: "advisor",
    label: "Advisor",
    executionMode: "sequential",
    parameters: advisorParameters,
    description: ADVISOR_TOOL_DESCRIPTION,
    promptSnippet: ADVISOR_TOOL_SNIPPET,
    renderCall: renderAdvisorCall,
    renderResult: renderAdvisorResult,
    execute: handler.execute.bind(handler),
  });
}
