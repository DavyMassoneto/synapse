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
    try {
      onUpdate?.({ content: [{ type: "text", text: "Consultando advisor..." }], details: {} });
      const callSignal = signal ? AbortSignal.any([signal, this.lifetime]) : this.lifetime;

      const advisorModel = new AdvisorModel(context);
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
          content: [{ type: "text", text: "Consulta ao advisor cancelada." }],
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
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Advisor unavailable: ${message}. Continue without advice.`,
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
    description:
      "Consult a stronger advisor for strategic guidance. No parameters. The active conversation is sent to the configured provider, subject to context limits; images are omitted.",
    promptSnippet: "Consult a stronger advisor model with the conversation (no parameters)",
    ...createRenderers(advisor),
    execute: handler.execute.bind(handler),
  });
}
