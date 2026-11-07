import { type ModelRegistry } from "@earendil-works/pi-coding-agent";

export type AdvisorModelRegistry = Pick<
  ModelRegistry,
  "find" | "hasConfiguredAuth" | "streamSimple"
>;
