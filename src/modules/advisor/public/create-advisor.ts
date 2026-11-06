import { type Advisor } from "@/modules";
import { loadConfig, saveConfig } from "@/modules/advisor/adapters";
import { AdvisorService } from "@/modules/advisor/internal";

export function createAdvisor(): Advisor {
  return new AdvisorService({ load: loadConfig, save: saveConfig });
}
