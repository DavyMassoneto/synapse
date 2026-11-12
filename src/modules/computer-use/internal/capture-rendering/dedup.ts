import {
  COMPUTER_TITLE_PRESENT,
  type ComputerCapture,
  type ComputerPresentImage,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_RENDER_DEDUP_MAX_STREAK } from "./constants"
import { type ComputerCaptureDedupState } from "./types"

export class ComputerCaptureDedup {
  private readonly lastShots = new Map<string, ComputerCaptureDedupState>()

  isRepeated(sessionId: string, capture: ComputerCapture, image: ComputerPresentImage): boolean {
    const state = this.state(capture, image)
    const previous = this.lastShots.get(sessionId)
    if (previous && this.matches(previous, state)) {
      previous.streak += 1
      return true
    }
    this.lastShots.set(sessionId, state)
    return false
  }

  reset(): void {
    this.lastShots.clear()
  }

  private state(capture: ComputerCapture, image: ComputerPresentImage): ComputerCaptureDedupState {
    return { image: image.data, mime: image.mime, target: this.target(capture), streak: 0 }
  }

  private target(capture: ComputerCapture): string {
    const title = capture.windowTitle.kind === COMPUTER_TITLE_PRESENT ? capture.windowTitle.title : ""
    return JSON.stringify([capture.app, title])
  }

  private matches(previous: ComputerCaptureDedupState, state: ComputerCaptureDedupState): boolean {
    return (
      previous.image === state.image &&
      previous.mime === state.mime &&
      previous.target === state.target &&
      previous.streak < COMPUTER_RENDER_DEDUP_MAX_STREAK
    )
  }
}
