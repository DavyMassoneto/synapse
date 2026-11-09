import { type ModelPort, type ModelRequest, type ModelResponse, type ResolvedModel } from "../public"

export class TestModel implements ModelPort {
  calls = 0
  window = 40_000
  captured?: ModelRequest
  resolved?: ResolvedModel
  resolvedReference?: string

  async resolve(reference: string): Promise<ResolvedModel> {
    this.calls += 1
    this.resolvedReference = reference
    return {
      reference,
      contextWindow: this.window,
      maxOutputTokens: 32_000,
      reasoningTokens: 2_048,
      effectiveThinking: "low",
    }
  }

  async consult(resolved: ResolvedModel, request: ModelRequest): Promise<ModelResponse> {
    this.resolved = resolved
    this.captured = request
    return {
      kind: "success",
      text: "advice",
      usage: {
        input: 1,
        output: 1,
        cacheRead: 0,
        cacheWrite: 0,
        totalTokens: 2,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
      },
    }
  }
}
