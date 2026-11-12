import { type ContextEventResult } from "@earendil-works/pi-coding-agent"
import { RESPONSE_INTEGRATION_REMINDER } from "./constants"

export function expectedResponseRulesResult(): ContextEventResult {
  return {
    messages: [
      {
        role: "user",
        timestamp: 0,
        content: [
          { type: "text", text: "Olá" },
          { type: "text", text: RESPONSE_INTEGRATION_REMINDER },
        ],
      },
    ],
  }
}
