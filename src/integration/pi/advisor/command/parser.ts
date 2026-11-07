import type { AdvisorCommandInput } from "./parser-types.ts";

export function parseAdvisorCommand(args: string): AdvisorCommandInput {
  const input = args.trim();
  if (input === "off") {
    return { kind: "disable" };
  }
  const [command, ...rest] = input.split(/\s+/);
  if (command === "thinking") {
    return { kind: "thinking", level: rest.join(" ") };
  }
  return { kind: "select", query: input };
}
