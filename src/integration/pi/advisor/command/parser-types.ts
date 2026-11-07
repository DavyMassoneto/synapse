export interface DisableCommand {
  kind: "disable";
}
export interface ThinkingCommand {
  kind: "thinking";
  level: string;
}
export interface SelectCommand {
  kind: "select";
  query: string;
}
export type AdvisorCommandInput = DisableCommand | ThinkingCommand | SelectCommand;
