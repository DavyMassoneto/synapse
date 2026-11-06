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
      const status = this.advisor.status();
      if (status.kind === "failure") {
        throw new Error(status.message);
      }
      const config = status.status;
      if (!config.model) {
        throw new Error("no advisor model configured");
      }

      const slash = config.model.indexOf("/");
      if (slash <= 0 || slash === config.model.length - 1) {
        throw new Error(`invalid advisor model: ${config.model}`);
      }

      const provider = config.model.slice(0, slash);
      const modelId = config.model.slice(slash + 1);
      const model = context.modelRegistry.find(provider, modelId);

      if (!model) {
        throw new Error(`advisor model not found: ${config.model}`);
      }
      if (!context.modelRegistry.hasConfiguredAuth(model)) {
        throw new Error(`no credentials for ${config.model}`);
      }

      onUpdate?.({
        content: [{ type: "text", text: `Consulting ${config.model}...` }],
        details: {},
      });
      const callSignal = signal ? AbortSignal.any([signal, this.lifetime]) : this.lifetime;
      callSignal.throwIfAborted();

      const advisorModel = new AdvisorModel(context, model);
      const result = await this.advisor.consult(
        {
          system: context.getSystemPrompt(),
          messages: captureTranscript(context),
          contextWindow: model.contextWindow,
          signal: callSignal,
        },
        advisorModel.consult.bind(advisorModel),
      );

      return {
        content: [{ type: "text", text: result.text }],
        details: { model: config.model },
        usage: result.usage,
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
