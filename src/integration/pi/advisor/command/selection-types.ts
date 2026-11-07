import { type Cancelled } from "#synapse/modules/index.js";

export interface ModelSelected {
  kind: "selected";
  model: string;
}

export interface AdvisorDisabled {
  kind: "disabled";
}

export type ModelSelection = ModelSelected | AdvisorDisabled | Cancelled;
