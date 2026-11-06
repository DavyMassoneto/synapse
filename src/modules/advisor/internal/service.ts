import { type Advisor, type ConfigPort } from "@/modules";
import {
  ADVISOR_SYSTEM,
  buildTranscript,
  clip,
  REMINDER,
  TIMING,
} from "@/modules/advisor/internal";

export function createService(config: ConfigPort): Advisor {
  let turns = 0;

  return {
    config,
    timing: TIMING,

    reset() {
      turns = 0;
    },

    turn(completed, hasTools) {
      if (!completed || !config.load().model) {
        return undefined;
      }

      turns += 1;
      if (turns < 5 || !hasTools) {
        return undefined;
      }

      turns = 0;
      return REMINDER;
    },

    async consult(input, model) {
      if (!input.config.model) {
        throw new Error("no advisor model configured");
      }

      const system = clip(input.system, 40_000);
      const budget = Math.max(20_000, (input.contextWindow - 26_000) * 3 - system.length);
      const transcript = buildTranscript(input.messages, budget);
      const prompt = [
        "<executor_system_prompt>",
        system,
        "</executor_system_prompt>",
        "",
        "<transcript>",
        transcript,
        "</transcript>",
        "",
        "The executor just called advisor(). Give your guidance now.",
      ].join("\n");

      return model({
        system: ADVISOR_SYSTEM,
        prompt,
        model: input.config.model,
        thinking: input.config.thinking,
        signal: input.signal,
      });
    },
  };
}
