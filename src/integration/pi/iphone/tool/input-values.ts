import { type IphonePoint } from "#synapse/modules"
import { PI_IPHONE_INVALID_ARGUMENTS, PI_IPHONE_MS_PER_SECOND } from "./constants"
import { type PiIphoneInput, type PiIphonePointOption } from "./types"

export function iphoneRequiredText(value?: string): string {
  if (!value?.trim()) {
    throw new Error(PI_IPHONE_INVALID_ARGUMENTS)
  }
  return value
}

export function iphoneNumber(fallback: number, value?: number): number {
  if (typeof value === "number") {
    return value
  }
  return fallback
}

export function iphoneInputPoint(input: PiIphoneInput): IphonePoint {
  if (typeof input.element === "number" || input.text) {
    return { x: 0, y: 0 }
  }
  if (typeof input.x !== "number" || typeof input.y !== "number") {
    throw new Error(PI_IPHONE_INVALID_ARGUMENTS)
  }
  return { x: input.x, y: input.y }
}

export function iphoneMilliseconds(defaultMs: number, seconds?: number): number {
  if (typeof seconds === "number") {
    return seconds * PI_IPHONE_MS_PER_SECOND
  }
  return defaultMs
}

export function iphoneOptionalPoint(input: PiIphoneInput): PiIphonePointOption {
  const option: PiIphonePointOption = {}
  if (typeof input.x === "number" || typeof input.y === "number") {
    option.point = iphoneInputPoint(input)
  }
  return option
}
