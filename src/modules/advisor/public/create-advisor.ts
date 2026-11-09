import { FileConfig } from "../adapters"
import { AdvisorService } from "../internal"
import { type Advisor } from "./contracts"

export function createAdvisor(path: string): Advisor {
  const storage = new FileConfig(path)
  const loaded = storage.load()
  return new AdvisorService(storage, loaded)
}
