import { IPHONE_HTTP_URL_PATTERN } from "./constants"

export function isIphoneHttpUrl(value: string): boolean {
  return URL.canParse(value) && IPHONE_HTTP_URL_PATTERN.test(value)
}
