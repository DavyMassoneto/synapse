import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";

export type PiExtension = (pi: ExtensionAPI) => void;
export type PiInstance = Parameters<PiExtension>[0];
