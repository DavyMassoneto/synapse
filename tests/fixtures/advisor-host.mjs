import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { createJiti } = require("jiti");
const jiti = createJiti(import.meta.url, { tsconfigPaths: true });
const { registerAdvisor } = await jiti.import("../../src/integration/pi/advisor/advisor.ts");
const { createAdvisor } = await jiti.import("../../src/modules/advisor/public/index.ts");

export const usage = {
  input: 1,
  output: 2,
  cacheRead: 3,
  cacheWrite: 4,
  totalTokens: 10,
  cost: { input: 0.1, output: 0.2, cacheRead: 0.3, cacheWrite: 0.4, total: 1 },
};

class Registry {
  calls = 0;
  constructor(stopReason) {
    this.stopReason = stopReason;
  }
  find() {
    this.calls += 1;
    return {
      provider: "provider",
      id: "model",
      contextWindow: 40_000,
      maxTokens: 32_000,
      reasoning: true,
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    };
  }
  hasConfiguredAuth() {
    return true;
  }
  streamSimple() {
    return this;
  }
  async result() {
    return {
      stopReason: this.stopReason,
      content: [{ type: "text", text: "conselho" }],
      errorMessage: "stopped",
      usage,
    };
  }
}

class Session {
  projectionError = false;
  buildSessionProjection() {
    if (this.projectionError) {
      throw new Error("projection failed");
    }
    return { messages: [] };
  }
}

export class AdvisorHarness {
  handlers = new Map();
  lifecycle = new AbortController();
  session = new Session();

  constructor(stopReason) {
    this.directory = mkdtempSync(join(tmpdir(), "synapse-host-"));
    mkdirSync(this.directory, { recursive: true });
    const configPath = join(this.directory, "advisor.json");
    writeFileSync(configPath, JSON.stringify({ model: "provider/model", thinking: "low" }));
    this.advisor = createAdvisor(configPath);
    this.registry = new Registry(stopReason);
    this.context = {
      hasUI: false,
      scopedModels: [],
      getSystemPrompt: this.getSystemPrompt.bind(this),
      sessionManager: this.session,
      modelRegistry: this.registry,
    };
    registerAdvisor(
      this,
      this.advisor,
      this.lifecycle.signal,
      this.lifecycle.abort.bind(this.lifecycle),
    );
  }

  cleanup() {
    rmSync(this.directory, { recursive: true, force: true });
  }

  getSystemPrompt() {
    return "system";
  }
  on(name, handler) {
    const entries = this.handlers.get(name) ?? [];
    entries.push(handler);
    this.handlers.set(name, entries);
  }
  registerTool(definition) {
    this.tool = definition;
  }
  registerCommand(_name, definition) {
    this.command = definition;
  }
  getActiveTools() {
    return [];
  }
  setActiveTools() {}
}
