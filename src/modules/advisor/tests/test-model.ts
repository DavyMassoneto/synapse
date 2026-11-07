import type { ModelPort, ModelRequest, ModelResponse, ResolvedModel } from "../public";

export class TestModel implements ModelPort {
  calls = 0;
  captured: ModelRequest | undefined;
  resolved: ResolvedModel | undefined;
  resolvedReference: string | undefined;

  constructor(private readonly window = 40_000) {}

  async resolve(reference: string): Promise<ResolvedModel> {
    this.calls += 1;
    this.resolvedReference = reference;
    return {
      reference,
      contextWindow: this.window,
      maxOutputTokens: 32_000,
      reasoningTokens: 2_048,
      effectiveThinking: "low",
    };
  }

  async consult(resolved: ResolvedModel, request: ModelRequest): Promise<ModelResponse> {
    this.resolved = resolved;
    this.captured = request;
    return { kind: "success", text: "advice" };
  }
}
