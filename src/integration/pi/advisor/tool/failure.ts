import { type AdvisorToolResult } from "#synapse/integration/pi/advisor/contracts";

export function toolFailure(message: string): Awaited<AdvisorToolResult> {
  return { content: [{ type: "text", text: message }], details: {}, isError: true };
}
