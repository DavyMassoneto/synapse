import { type AgentToolResult } from "@earendil-works/pi-coding-agent"
import { type AdvisorToolDetails } from "#synapse/integration"

export const RENDER_RESULT: AgentToolResult<AdvisorToolDetails> = {
  content: [{ type: "text", text: "line0\nline1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9" }],
  details: { model: "provider/original" },
}

export const TEST_USAGE = {
  input: 1,
  output: 2,
  cacheRead: 3,
  cacheWrite: 4,
  totalTokens: 10,
  cost: { input: 0.1, output: 0.2, cacheRead: 0.3, cacheWrite: 0.4, total: 1 },
}
