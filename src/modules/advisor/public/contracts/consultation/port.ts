import type { ThinkingLevel } from "../config";
import type { ModelRequest } from "./request";
import type { ResolvedModel } from "./resolved";
import type { ModelResponse } from "./response";

export interface ModelPort {
  resolve(model: string, thinking: ThinkingLevel, signal?: AbortSignal): Promise<ResolvedModel>;
  consult(resolved: ResolvedModel, request: ModelRequest): Promise<ModelResponse>;
}
