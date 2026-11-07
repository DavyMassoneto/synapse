import type { AdvisorResult } from "#synapse/modules/advisor/public/contracts";
import type { ConfigLoadResult } from "./contracts";
import { DEFAULT_THINKING } from "./defaults";

export function initialConfiguration(loaded: ConfigLoadResult): AdvisorResult {
  if (loaded.kind === "invalid") {
    return { kind: "failure", message: loaded.message };
  }
  if (loaded.kind === "loaded") {
    return {
      kind: "success",
      config: {
        model: loaded.config.model || undefined,
        thinking: loaded.config.thinking ?? DEFAULT_THINKING,
      },
    };
  }
  return { kind: "success", config: { thinking: DEFAULT_THINKING } };
}
