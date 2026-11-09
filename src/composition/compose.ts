import { createAdvisor } from "../modules"
import { type AdvisorComposition } from "./types"

export function compose(configPath: string): AdvisorComposition {
  const controller = new AbortController()
  return {
    advisor: createAdvisor(configPath),
    signal: controller.signal,
    shutdown: controller.abort.bind(controller),
  }
}
