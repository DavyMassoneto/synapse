export interface Failure {
  kind: "failure";
  message: string;
}

export interface Cancelled {
  kind: "cancelled";
}
