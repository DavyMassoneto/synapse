import { PI_IPHONE_INVALID_ARGUMENTS, PI_IPHONE_MS_PER_SECOND } from "./constants"

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

export function iphoneMilliseconds(defaultMs: number, seconds?: number): number {
  if (typeof seconds === "number") {
    return seconds * PI_IPHONE_MS_PER_SECOND
  }
  return defaultMs
}
