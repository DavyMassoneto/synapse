import {
  JSON_OBJECT_END,
  JSON_OBJECT_START,
  JSON_QUOTE,
  SIMCTL_INVALID,
  SIMCTL_NAME,
  SIMCTL_STATE,
  SIMCTL_UDID,
  SIMCTL_VALID,
} from "./constants"
import { type IphoneJsonCursor } from "./cursor"
import { type IphoneSimctlDeviceReading, type IphoneSimctlText } from "./types"
import { type IphoneJsonValueSkipper } from "./value-skipper"

export class IphoneSimctlDeviceReader {
  private readonly cursor: IphoneJsonCursor
  private readonly skipper: IphoneJsonValueSkipper

  constructor(cursor: IphoneJsonCursor, skipper: IphoneJsonValueSkipper) {
    this.cursor = cursor
    this.skipper = skipper
  }

  read(): IphoneSimctlDeviceReading {
    if (!this.cursor.accept(JSON_OBJECT_START)) {
      this.skipper.skip()
      return { kind: SIMCTL_INVALID }
    }
    let udid: IphoneSimctlText = { kind: SIMCTL_INVALID }
    let name: IphoneSimctlText = { kind: SIMCTL_INVALID }
    let state: IphoneSimctlText = { kind: SIMCTL_INVALID }
    let pending = !this.cursor.accept(JSON_OBJECT_END)
    while (pending) {
      const key = this.cursor.property()
      switch (key) {
        case SIMCTL_UDID:
          udid = this.text()
          break
        case SIMCTL_NAME:
          name = this.text()
          break
        case SIMCTL_STATE:
          state = this.text()
          break
        default:
          this.skipper.skip()
      }
      pending = this.cursor.next(JSON_OBJECT_END)
    }
    return this.device(udid, name, state)
  }

  private text(): IphoneSimctlText {
    if (this.cursor.peek() === JSON_QUOTE) {
      return { kind: SIMCTL_VALID, text: this.cursor.string(true) }
    }
    this.skipper.skip()
    return { kind: SIMCTL_INVALID }
  }

  private device(udid: IphoneSimctlText, name: IphoneSimctlText, state: IphoneSimctlText): IphoneSimctlDeviceReading {
    if (udid.kind === SIMCTL_VALID && name.kind === SIMCTL_VALID && state.kind === SIMCTL_VALID) {
      return { kind: SIMCTL_VALID, device: { udid: udid.text, name: name.text, state: state.text } }
    }
    return { kind: SIMCTL_INVALID }
  }
}
