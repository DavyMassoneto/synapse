import type { Context, ModelsSimpleStreamOptions } from "@earendil-works/pi-ai";
import type { ModelRequest, ResolvedModel } from "#synapse/modules";

export function consultationContext(request: ModelRequest): Context {
  return {
    systemPrompt: request.system,
    messages: [
      { role: "user", content: [{ type: "text", text: request.prompt }], timestamp: Date.now() },
    ],
  };
}

export function consultationOptions(
  resolved: ResolvedModel,
  request: ModelRequest,
): ModelsSimpleStreamOptions {
  const options: ModelsSimpleStreamOptions = { signal: request.signal };
  if (resolved.effectiveThinking !== "off") {
    options.reasoning = resolved.effectiveThinking;
  }
  return options;
}
