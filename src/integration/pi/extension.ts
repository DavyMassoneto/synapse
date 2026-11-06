import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { compose } from "@/composition";
import { registerAdvisor } from "@/integration";

export default function registerSynapse(pi: ExtensionAPI): void {
  registerAdvisor(pi, compose());
}
