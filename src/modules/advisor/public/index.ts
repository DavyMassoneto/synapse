import { loadConfig, saveConfig } from "@/modules/advisor/adapters/config.ts";
import { createService } from "@/modules/advisor/internal/service.ts";
import type { Advisor } from "@/modules/advisor/public/contracts.ts";

export { THINKING_LEVELS } from "@/modules/advisor/internal/thinking.ts";

export function createAdvisor(): Advisor {
  return createService({ load: loadConfig, save: saveConfig });
}
