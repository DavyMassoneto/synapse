import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  AdvisorModel,
  type AdvisorTool,
  advisorParameters,
  captureTranscript,
  createRenderers,
} from "@/integration";
import { type Advisor } from "@/modules";

class AdvisorToolHandler {
  constructor(
    private readonly advisor: Advisor,
    private readonly lifetime: AbortController,
  ) {}

  async execute(...args: Parameters<AdvisorTool["execute"]>): ReturnType<AdvisorTool["execute"]> {
    const [_id, _params, signal, onUpdate, context] = args;
    try {
      const config = this.advisor.config.load();
      if (!config.model) {
        throw new Error("no advisor model configured");
      }

      const slash = config.model.indexOf("/");
      const model =
        slash > 0
          ? context.modelRegistry.find(config.model.slice(0, slash), config.model.slice(slash + 1))
          : undefined;

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
      const callSignal = signal
        ? AbortSignal.any([signal, this.lifetime.signal])
        : this.lifetime.signal;
      callSignal.throwIfAborted();

      const advisorModel = new AdvisorModel(context, model);
      const result = await this.advisor.consult(
        {
          config,
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

export function registerTool(pi: ExtensionAPI, advisor: Advisor, lifetime: AbortController): void {
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
