import { type Api, type Model } from "@earendil-works/pi-ai";
import { type ExtensionToolContext } from "@earendil-works/pi-coding-agent";
import { type ModelRequest, type ModelResponse } from "@/modules";

export class AdvisorModel {
  constructor(
    private readonly context: ExtensionToolContext,
    private readonly model: Model<Api>,
  ) {}

  async consult(request: ModelRequest): Promise<ModelResponse> {
    const reasoning =
      request.thinking !== "off" && this.model.reasoning ? request.thinking : undefined;
    const reply = await this.context.modelRegistry
      .streamSimple(
        this.model,
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

    let text = "";
    for (const block of reply.content) {
      if (block.type === "text") {
        text += `${block.text}\n`;
      }
    }
    text = text.trim();

    if (!text) {
      throw new Error("advisor returned no text");
    }

    return { text, usage: reply.usage };
  }
}
