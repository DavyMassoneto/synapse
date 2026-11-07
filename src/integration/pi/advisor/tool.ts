import {
  type AgentToolUpdateCallback,
  type ExtensionAPI,
  type ExtensionToolContext,
} from "@earendil-works/pi-coding-agent";
import {
  AdvisorModel,
  type AdvisorToolDetails,
  type AdvisorToolInput,
  type AdvisorToolResult,
  advisorParameters,
  captureTranscript,
  createRenderers,
} from "@/integration";
import { ADVISOR_MESSAGES } from "@/integration/pi/advisor/presentation";
import { type Advisor } from "@/modules";

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
    context: ExtensionToolContext,
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
            text: `Advisor indisponível: ${message}.`,
          },
        ],
        details: {},
        isError: true,
      };
    }
  }
}

export function registerTool(pi: ExtensionAPI, advisor: Advisor, lifetime: AbortSignal): void {
  const handler = new AdvisorToolHandler(advisor, lifetime);
  pi.registerTool({
    name: "advisor",
    label: "Advisor",
    executionMode: "sequential",
    parameters: advisorParameters,
    description: ADVISOR_MESSAGES.description,
    promptSnippet: ADVISOR_MESSAGES.snippet,
    ...createRenderers(),
    execute: handler.execute.bind(handler),
  });
}
