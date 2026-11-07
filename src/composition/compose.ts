import { createAdvisor } from "../modules";
import { advisorConfigPath } from "./config-path";
import type { AdvisorComposition } from "./types";

export function compose(configPath = advisorConfigPath()): AdvisorComposition {
  const controller = new AbortController();
  return {
    advisor: createAdvisor(configPath),
    signal: controller.signal,
    shutdown: controller.abort.bind(controller),
  };
}
