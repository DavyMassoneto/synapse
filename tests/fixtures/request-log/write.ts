import { appendFileSync } from "node:fs"
import { type TranscriptContext } from "@earendil-works/pi-ai"
import { PI_REQUEST_LOG_NEWLINE } from "./constants"

export function logRequest(path: string, context: TranscriptContext): void {
  appendFileSync(path, `${JSON.stringify(context)}${PI_REQUEST_LOG_NEWLINE}`)
}
