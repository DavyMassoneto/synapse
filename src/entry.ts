import { homedir } from "node:os";
import { join } from "node:path";
import { compose } from "@/composition";
import { PiHost, type PiInstance } from "@/integration";

export default function registerSynapse(pi: PiInstance): void {
  compose(new PiHost(pi), join(homedir(), ".pi", "agent", "advisor.json"));
}
