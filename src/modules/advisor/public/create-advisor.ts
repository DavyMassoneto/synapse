import { FileConfig } from "@/modules/advisor/adapters";
import { AdvisorService } from "@/modules/advisor/internal";
import { type Advisor } from "@/modules/advisor/public/types";

export function createAdvisor(path: string): Advisor {
  const storage = new FileConfig(path);
  const loaded = storage.load();
  return new AdvisorService(storage, loaded);
}
