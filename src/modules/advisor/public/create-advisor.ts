import { FileConfig } from "@/modules/advisor/adapters";
import { AdvisorService } from "@/modules/advisor/internal";
import { type Advisor } from "@/modules/advisor/public";

export function createAdvisor(path: string): Advisor {
  return new AdvisorService(new FileConfig(path));
}
