import { FileConfig } from "#synapse/modules/advisor/adapters";
import { AdvisorService } from "#synapse/modules/advisor/internal";
import { type Advisor } from "#synapse/modules/advisor/public";

export function createAdvisor(path: string): Advisor {
  const storage = new FileConfig(path);
  const loaded = storage.load();
  return new AdvisorService(storage, loaded);
}
