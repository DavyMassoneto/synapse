import { homedir } from "node:os";
import { join } from "node:path";
import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { compose } from "@/composition";
import { PiHost } from "@/integration";

export default function registerSynapse(pi: ExtensionAPI): void {
  compose(new PiHost(pi), join(homedir(), ".pi", "agent", "advisor.json"));
}
