import { AdvisorService } from "#synapse/modules/advisor/internal"
import { TestStorage } from "./test-storage"
import { type ServiceScenario } from "./types"

export function serviceScenario(): ServiceScenario {
  const storage = new TestStorage()
  return { storage, advisor: new AdvisorService(storage, storage.load()) }
}
