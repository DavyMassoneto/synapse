import { type AdvisorService } from "#synapse/modules/advisor/internal"
import { type TestStorage } from "./test-storage"

export interface ServiceScenario {
  storage: TestStorage
  advisor: AdvisorService
}
