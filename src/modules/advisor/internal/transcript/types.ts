import { type TranscriptMessage } from "#synapse/modules/advisor/public/contracts"

export interface FixedMessage {
  kind: "fixed"
  text: string
}

export interface ResizableMessage {
  kind: "resizable"
  message: TranscriptMessage
}

export type PreparedMessage = FixedMessage | ResizableMessage

export interface TranscriptFits {
  kind: "fits"
  text: string
}

export interface TranscriptOverflow {
  kind: "overflow"
}

export type FittedTranscript = TranscriptFits | TranscriptOverflow
