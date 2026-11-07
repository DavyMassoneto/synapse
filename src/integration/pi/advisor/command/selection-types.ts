import { type Cancelled } from "@/modules";

export interface ModelSelected {
  kind: "selected";
  model: string;
}

export interface AdvisorDisabled {
  kind: "disabled";
}

export type ModelSelection = ModelSelected | AdvisorDisabled | Cancelled;
