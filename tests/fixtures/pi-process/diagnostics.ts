import {
  PI_PROCESS_BUFFER_FAILURE,
  PI_PROCESS_DIAGNOSTIC_ACCEPTED,
  PI_PROCESS_DIAGNOSTIC_FAILURE,
  PI_PROCESS_DIAGNOSTIC_OVERLAP,
  PI_PROCESS_LOAD_FAILURE,
  PI_PROCESS_LOADING_ERROR,
  PI_PROCESS_MAX_BUFFER_BYTES,
} from "./constants"
import { type PiProcessDiagnostic } from "./types"

export class PiProcessDiagnostics {
  private bufferedText = ""
  private bytes = 0
  private loadingFailure = false

  get text(): string {
    return this.bufferedText
  }

  receive(chunk: string): PiProcessDiagnostic {
    this.bytes += Buffer.byteLength(chunk)
    if (this.bytes > PI_PROCESS_MAX_BUFFER_BYTES) {
      return { kind: PI_PROCESS_DIAGNOSTIC_FAILURE, error: new Error(PI_PROCESS_BUFFER_FAILURE) }
    }
    const boundary = this.bufferedText.slice(-PI_PROCESS_DIAGNOSTIC_OVERLAP)
    this.bufferedText += chunk
    return this.detect(boundary + chunk)
  }

  private detect(text: string): PiProcessDiagnostic {
    if (!this.loadingFailure && PI_PROCESS_LOADING_ERROR.test(text)) {
      this.loadingFailure = true
      return { kind: PI_PROCESS_DIAGNOSTIC_FAILURE, error: new Error(`${PI_PROCESS_LOAD_FAILURE}${this.bufferedText}`) }
    }
    return { kind: PI_PROCESS_DIAGNOSTIC_ACCEPTED }
  }
}
