import { type ExtensionFactory } from "@earendil-works/pi-coding-agent";
import registerSynapse from "#synapse/entry.js";

export const extensionFactory: ExtensionFactory = registerSynapse;
