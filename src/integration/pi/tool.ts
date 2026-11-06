import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { advisorParameters, captureTranscript, createRenderers } from "@/integration";
import type { Advisor } from "@/modules";

export function registerTool(pi: ExtensionAPI, advisor: Advisor, lifetime: AbortController): void {
  pi.registerTool({
    name: "advisor",
    label: "Advisor",
    executionMode: "sequential",
    parameters: advisorParameters,
    description:
      "Consult a stronger advisor for strategic guidance. No parameters. The active conversation is sent to the configured provider, subject to context limits; images are omitted.",
    promptSnippet: "Consult a stronger advisor model with the conversation (no parameters)",

    ...createRenderers(advisor),

    async execute(_id, _params, signal, onUpdate, context) {
      try {
        const config = advisor.config.load();
        if (!config.model) {
          throw new Error("no advisor model configured");
        }

        const slash = config.model.indexOf("/");
        const model =
          slash > 0
            ? context.modelRegistry.find(
                config.model.slice(0, slash),
                config.model.slice(slash + 1),
              )
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
        const callSignal = signal ? AbortSignal.any([signal, lifetime.signal]) : lifetime.signal;
        callSignal.throwIfAborted();

        const result = await advisor.consult(
          {
            config,
            system: context.getSystemPrompt(),
            messages: captureTranscript(context),
            contextWindow: model.contextWindow,
            signal: callSignal,
          },
          async (request) => {
            const reasoning =
              request.thinking !== "off" && model.reasoning ? request.thinking : undefined;
            const reply = await context.modelRegistry
              .streamSimple(
                model,
                {
                  systemPrompt: request.system,
                  messages: [
                    {
                      role: "user",
                      content: [{ type: "text", text: request.prompt }],
                      timestamp: Date.now(),
                    },
                  ],
                },
                { signal: request.signal, reasoning },
              )
              .result();

            if (reply.stopReason === "error" || reply.stopReason === "aborted") {
              throw new Error(reply.errorMessage ?? reply.stopReason);
            }

            const text = reply.content
              .filter((block) => block.type === "text")
              .map((block) => block.text)
              .join("\n")
              .trim();
            if (!text) {
              throw new Error("advisor returned no text");
            }

            return { text, usage: reply.usage };
          },
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
    },
  });
}
