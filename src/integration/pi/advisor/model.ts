import { type Api, type Model } from "@earendil-works/pi-ai";
import { type ExtensionToolContext } from "@earendil-works/pi-coding-agent";
import { ADVISOR_MESSAGES } from "@/integration/pi/advisor/presentation";
import { type ModelRequest, type ModelResponse } from "@/modules";

export class AdvisorModel {
  constructor(private readonly context: ExtensionToolContext) {}

  private model: Model<Api> | undefined;

  async contextWindow(reference: string, signal?: AbortSignal): Promise<number> {
    signal?.throwIfAborted();
    const separator = reference.indexOf("/");
    if (separator <= 0 || separator === reference.length - 1) {
      throw new Error(ADVISOR_MESSAGES.invalidReference);
    }

    const provider = reference.slice(0, separator);
    const modelId = reference.slice(separator + 1);
    const model = this.context.modelRegistry.find(provider, modelId);
    if (!model) {
      throw new Error(`Modelo advisor não encontrado: ${reference}`);
    }
    if (!this.context.modelRegistry.hasConfiguredAuth(model)) {
      throw new Error(`Credenciais ausentes para ${reference}`);
    }

    this.model = model;
    return model.contextWindow;
  }

  async consult(request: ModelRequest): Promise<ModelResponse> {
    const model = this.model;
    if (!model) {
      throw new Error(ADVISOR_MESSAGES.modelNotResolved);
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

    if (reply.stopReason === "aborted") {
      return { kind: "cancelled" };
    }
    if (reply.stopReason === "error") {
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

    const usage = reply.usage;
    return {
      kind: "success",
      text,
      usage: {
        input: usage.input,
        output: usage.output,
        cacheRead: usage.cacheRead,
        cacheWrite: usage.cacheWrite,
        totalTokens: usage.totalTokens,
        cost: {
          input: usage.cost.input,
          output: usage.cost.output,
          cacheRead: usage.cost.cacheRead,
          cacheWrite: usage.cost.cacheWrite,
          total: usage.cost.total,
        },
      },
    };
  }
}
