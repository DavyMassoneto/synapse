import { type AgentToolUpdateCallback } from "@earendil-works/pi-coding-agent";
import { ADVISOR_NAME } from "@/integration/pi/advisor/identifiers";
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

function toolFailure(message: string): Awaited<AdvisorToolResult> {
  return { content: [{ type: "text", text: message }], details: {}, isError: true };
}

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
      return toolFailure(ADVISOR_MESSAGES.cancelled);
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
        return toolFailure(ADVISOR_MESSAGES.cancelled);
      }
      if (result.kind === "failure") {
        return toolFailure(result.message);
      }
      return {
        content: [{ type: "text", text: result.response.text }],
        details: { model: result.model },
        usage: result.response.usage,
      };
    } catch (error) {
      if (callSignal.aborted) {
        return toolFailure(ADVISOR_MESSAGES.cancelled);
      }
      const message = error instanceof Error ? error.message : String(error);
      return toolFailure(advisorUnavailable(message));
    }
  }
}

export function registerTool(pi: AdvisorHost, advisor: Advisor, lifetime: AbortSignal): void {
  const handler = new AdvisorToolHandler(advisor, lifetime);
  pi.registerTool({
    name: ADVISOR_NAME,
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
