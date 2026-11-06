export interface ModelSelected {
  kind: "selected";
  model: string;
}

export interface AdvisorDisabled {
  kind: "disabled";
}

export interface SelectionCancelled {
  kind: "cancelled";
}

export type ModelSelection = ModelSelected | AdvisorDisabled | SelectionCancelled;
