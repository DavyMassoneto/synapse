import { JSON_ARRAY_INDEX_MAXIMUM } from "./constants"

export function isIphoneJsonArrayIndex(key: string): boolean {
  const index = Number(key)
  return Number.isInteger(index) && index >= 0 && index <= JSON_ARRAY_INDEX_MAXIMUM && String(index) === key
}
