import { type Api, type Model } from "@earendil-works/pi-ai";
import { type ExtensionToolContext } from "@earendil-works/pi-coding-agent";
import { type ModelRequest, type ModelResponse } from "@/modules";

export class AdvisorModel {
  constructor(private readonly context: ExtensionToolContext) {}

  private model: Model<Api> | undefined;

  async contextWindow(reference: string, signal?: AbortSignal): Promise<number> {
    signal?.throwIfAborted();
    const separator = reference.indexOf("/");
    if (separator <= 0 || separator === reference.length - 1) {
      throw new Error("invalid advisor model reference");
    }

    const provider = reference.slice(0, separator);
    const modelId = reference.slice(separator + 1);
    const model = this.context.modelRegistry.find(provider, modelId);
    if (!model) {
      throw new Error(`advisor model not found: ${reference}`);
    }
    if (!this.context.modelRegistry.hasConfiguredAuth(model)) {
      throw new Error(`no credentials for ${reference}`);
    }

    this.model = model;
    return model.contextWindow;
  }

  async consult(request: ModelRequest): Promise<ModelResponse> {
    const model = this.model;
    if (!model) {
      throw new Error("advisor model not resolved");
    }
    const reasoning = request.thinking !== "off" && model.reasoning ? request.thinking : undefined;
    const reply = await this.context.modelRegistry
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

    const parts: string[] = [];
    for (const block of reply.content) {
      if (block.type === "text") {
        parts.push(block.text);
      }
    }
    const text = parts.join("\n").trim();
    if (!text) {
      throw new Error("advisor returned no text");
    }

    return { text, usage: reply.usage };
  }
}
