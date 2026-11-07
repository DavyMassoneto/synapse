import { FileConfig } from "#synapse/modules/advisor/adapters/index.js";
import { AdvisorService } from "#synapse/modules/advisor/internal/index.js";
import { type Advisor } from "./advisor.ts";

export function createAdvisor(path: string): Advisor {
  const storage = new FileConfig(path);
  const loaded = storage.load();
  return new AdvisorService(storage, loaded);
}
