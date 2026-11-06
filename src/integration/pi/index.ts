import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { compose } from "../../composition/index.ts";
import { registerIphone } from "./iphone.ts";
export default function (pi: ExtensionAPI) { registerIphone(pi, compose().iphone); }
