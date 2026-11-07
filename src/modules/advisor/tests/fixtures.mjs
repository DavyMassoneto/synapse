import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createJiti } = require("jiti");
const jiti = createJiti(import.meta.url, { tsconfigPaths: true });
export const { AdvisorService } = await jiti.import("../internal/service.ts");

export class TestStorage {
  constructor(model = "provider/model", thinking = "low") {
    this.model = model;
    this.thinking = thinking;
    this.failSave = false;
  }

  load() {
    return { kind: "loaded", config: { model: this.model, thinking: this.thinking } };
  }

  save() {
    if (this.failSave) {
      throw new Error("disco indisponível");
    }
  }
}

export class TestModel {
  calls = 0;
  captured = undefined;
  resolvedReference = undefined;
  controller = undefined;
  cancelAt = undefined;
  failure = false;
  cancelled = false;
  gate = undefined;
  window = 40_000;

  async resolve(reference) {
    this.calls += 1;
    this.resolvedReference = reference;
    if (this.cancelAt === "resolve") {
      this.controller.abort();
    }
    if (this.gate) {
      await this.gate;
    }
    return {
      reference,
      contextWindow: this.window,
      maxOutputTokens: 32_000,
      reasoningTokens: 2_048,
      effectiveThinking: "low",
    };
  }

  async consult(resolved, request) {
    this.resolved = resolved;
    this.captured = request;
    if (this.cancelAt === "execute") {
      this.controller.abort();
    }
    if (this.failure) {
      throw new Error("provider error");
    }
    if (this.cancelled) {
      return { kind: "cancelled" };
    }
    return { kind: "success", text: "advice" };
  }
}
