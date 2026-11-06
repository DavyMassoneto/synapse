import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { compose } from "../../composition/index.ts";
import { registerAdvisor } from "./advisor.ts";
export default function (pi: ExtensionAPI) { registerAdvisor(pi, compose().advisor); }
