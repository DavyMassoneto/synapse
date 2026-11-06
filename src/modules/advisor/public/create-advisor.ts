import type { Advisor } from "@/modules";
import { loadConfig, saveConfig } from "@/modules/advisor/adapters";
import { createService } from "@/modules/advisor/internal";

export function createAdvisor(): Advisor {
  return createService({ load: loadConfig, save: saveConfig });
}
