import {
  JSON_ARRAY_END,
  JSON_ARRAY_START,
  JSON_OBJECT_END,
  JSON_OBJECT_START,
  SIMCTL_DEVICES,
  SIMCTL_INVALID,
  SIMCTL_VALID,
} from "./constants"
import { IphoneJsonCursor } from "./cursor"
import { IphoneSimctlDeviceReader } from "./device-reader"
import { orderIphoneSimctlRuntimes } from "./runtime-reading"
import { IphoneSimctlSyntaxError } from "./syntax-error"
import { type IphoneSimctlReading, type IphoneSimctlRuntimeGroups, type IphoneSimulatorDevice } from "./types"
import { IphoneJsonValueSkipper } from "./value-skipper"

export class IphoneSimctlDeviceListReader {
  private readonly cursor: IphoneJsonCursor
  private readonly skipper: IphoneJsonValueSkipper
  private readonly deviceReader: IphoneSimctlDeviceReader

  constructor(source: string) {
    this.cursor = new IphoneJsonCursor(source)
    this.skipper = new IphoneJsonValueSkipper(this.cursor)
    this.deviceReader = new IphoneSimctlDeviceReader(this.cursor, this.skipper)
  }

  read(): IphoneSimctlReading {
    try {
      const reading = this.root()
      this.cursor.finish()
      return reading
    } catch (error) {
      if (error instanceof IphoneSimctlSyntaxError) {
        return { kind: SIMCTL_INVALID }
      }
      throw error
    }
  }

  private root(): IphoneSimctlReading {
    this.cursor.expect(JSON_OBJECT_START)
    let reading: IphoneSimctlReading = { kind: SIMCTL_INVALID }
    let pending = !this.cursor.accept(JSON_OBJECT_END)
    while (pending) {
      const key = this.cursor.property()
      if (key === SIMCTL_DEVICES) {
        reading = this.runtimes()
      } else {
        this.skipper.skip()
      }
      pending = this.cursor.next(JSON_OBJECT_END)
    }
    return reading
  }

  private runtimes(): IphoneSimctlReading {
    if (!this.cursor.accept(JSON_OBJECT_START)) {
      this.skipper.skip()
      return { kind: SIMCTL_INVALID }
    }
    const groups: IphoneSimctlRuntimeGroups = new Map()
    let pending = !this.cursor.accept(JSON_OBJECT_END)
    while (pending) {
      const key = this.cursor.property()
      groups.set(key, this.group())
      pending = this.cursor.next(JSON_OBJECT_END)
    }
    return orderIphoneSimctlRuntimes(groups)
  }

  private group(): IphoneSimctlReading {
    if (!this.cursor.accept(JSON_ARRAY_START)) {
      this.skipper.skip()
      return { kind: SIMCTL_INVALID }
    }
    const devices: IphoneSimulatorDevice[] = []
    let valid = true
    let pending = !this.cursor.accept(JSON_ARRAY_END)
    while (pending) {
      const reading = this.deviceReader.read()
      if (reading.kind === SIMCTL_VALID) {
        devices.push(reading.device)
      } else {
        valid = false
      }
      pending = this.cursor.next(JSON_ARRAY_END)
    }
    if (valid) {
      return { kind: SIMCTL_VALID, devices }
    }
    return { kind: SIMCTL_INVALID }
  }
}
