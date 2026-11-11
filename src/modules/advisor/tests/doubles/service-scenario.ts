import { serviceFor } from "./test-advisor"
import { TestStorage } from "./test-storage"
import { type ServiceScenario } from "./types"

export function serviceScenario(): ServiceScenario {
  const storage = new TestStorage()
  return { storage, advisor: serviceFor(storage) }
}
