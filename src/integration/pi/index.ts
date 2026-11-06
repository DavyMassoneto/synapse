import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { compose } from "@/composition/index.ts";
import { registerAdvisor } from "@/integration/pi/advisor.ts";

export default function registerSynapse(pi: ExtensionAPI): void {
  registerAdvisor(pi, compose());
}
