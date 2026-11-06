import { THINKING, type Config, type ConfigPort } from "../public/contracts.ts";
import { TIMING, REMINDER, ADVISOR_SYSTEM, clip, buildTranscript } from "./policy.ts";
import type { ModelPort, TranscriptMessage } from "../public/contracts.ts";
export function createService(config: ConfigPort) {
  let turns = 0;
  return {
    config: { ...config, thinkingLevels: THINKING }, timing: TIMING,
    reset() { turns = 0; },
    turn(completed: boolean, hasTools: boolean) {
      if (!completed || !config.load().model) return undefined;
      if (++turns < 5 || !hasTools) return undefined;
      turns = 0; return REMINDER;
    },
    async consult(input: { config: Config; system: string; messages: TranscriptMessage[]; contextWindow: number; signal?: AbortSignal }, model: ModelPort) {
      const cfg = input.config;
      if (!cfg.model) throw new Error("no advisor model configured");
      const system = clip(input.system, 40000);
      const budget = Math.max(20000, (input.contextWindow - 26000) * 3 - system.length);
      const transcript = buildTranscript(input.messages, budget);
      const prompt = ["<executor_system_prompt>", system, "</executor_system_prompt>", "", "<transcript>", transcript, "</transcript>", "", "The executor just called advisor(). Give your guidance now."].join(String.fromCharCode(10));
      return model({ system: ADVISOR_SYSTEM, prompt, model: cfg.model, thinking: cfg.thinking, signal: input.signal });
    },
  };
}
