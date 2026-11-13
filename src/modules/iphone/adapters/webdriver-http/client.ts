import { Value } from "typebox/value"
import { readIphoneHttpBody } from "./body"
import { IPHONE_HTTP_CONTENT_TYPE, IPHONE_HTTP_INVALID_RESPONSE, IPHONE_HTTP_JSON } from "./constants"
import { IphoneWebDriverError } from "./error"
import {
  type IPHONE_HTTP_ELEMENT_SCHEMA,
  type IPHONE_HTTP_EMPTY_SCHEMA,
  type IPHONE_HTTP_INFO_SCHEMA,
  type IPHONE_HTTP_MOBILE_LAUNCH_SCHEMA,
  type IPHONE_HTTP_MOBILE_RESULT_SCHEMA,
  type IPHONE_HTTP_MOBILE_TERMINATE_SCHEMA,
  type IPHONE_HTTP_RECT_SCHEMA,
  type IPHONE_HTTP_SESSION_SCHEMA,
  type IPHONE_HTTP_STRING_SCHEMA,
} from "./schemas"
import {
  type IphoneHttpElementValue,
  type IphoneHttpEmptyValue,
  type IphoneHttpInfoValue,
  type IphoneHttpMobileLaunchValue,
  type IphoneHttpMobileResultValue,
  type IphoneHttpMobileSchema,
  type IphoneHttpMobileTerminateValue,
  type IphoneHttpRectValue,
  type IphoneHttpResponseSchema,
  type IphoneHttpResponseValue,
  type IphoneHttpSessionValue,
  type IphoneHttpStringValue,
} from "./types"

export function requestIphoneWebDriver(
  url: string,
  method: string,
  body: string,
  signal: AbortSignal,
  timeoutMs: number,
  schema: typeof IPHONE_HTTP_SESSION_SCHEMA,
): Promise<IphoneHttpSessionValue>
export function requestIphoneWebDriver(
  url: string,
  method: string,
  body: string,
  signal: AbortSignal,
  timeoutMs: number,
  schema: typeof IPHONE_HTTP_ELEMENT_SCHEMA,
): Promise<IphoneHttpElementValue>
export function requestIphoneWebDriver(
  url: string,
  method: string,
  body: string,
  signal: AbortSignal,
  timeoutMs: number,
  schema: typeof IPHONE_HTTP_RECT_SCHEMA,
): Promise<IphoneHttpRectValue>
export function requestIphoneWebDriver(
  url: string,
  method: string,
  body: string,
  signal: AbortSignal,
  timeoutMs: number,
  schema: typeof IPHONE_HTTP_STRING_SCHEMA,
): Promise<IphoneHttpStringValue>
export function requestIphoneWebDriver(
  url: string,
  method: string,
  body: string,
  signal: AbortSignal,
  timeoutMs: number,
  schema: typeof IPHONE_HTTP_MOBILE_TERMINATE_SCHEMA,
): Promise<IphoneHttpMobileTerminateValue>
export function requestIphoneWebDriver(
  url: string,
  method: string,
  body: string,
  signal: AbortSignal,
  timeoutMs: number,
  schema: typeof IPHONE_HTTP_MOBILE_LAUNCH_SCHEMA,
): Promise<IphoneHttpMobileLaunchValue>
export function requestIphoneWebDriver(
  url: string,
  method: string,
  body: string,
  signal: AbortSignal,
  timeoutMs: number,
  schema: typeof IPHONE_HTTP_EMPTY_SCHEMA,
): Promise<IphoneHttpEmptyValue>
export function requestIphoneWebDriver(
  url: string,
  method: string,
  body: string,
  signal: AbortSignal,
  timeoutMs: number,
  schema: typeof IPHONE_HTTP_MOBILE_RESULT_SCHEMA,
): Promise<IphoneHttpMobileResultValue>
export function requestIphoneWebDriver(
  url: string,
  method: string,
  body: string,
  signal: AbortSignal,
  timeoutMs: number,
  schema: typeof IPHONE_HTTP_INFO_SCHEMA,
): Promise<IphoneHttpInfoValue>
export function requestIphoneWebDriver(
  url: string,
  method: string,
  body: string,
  signal: AbortSignal,
  timeoutMs: number,
  schema: IphoneHttpMobileSchema,
): Promise<IphoneHttpResponseValue>
export async function requestIphoneWebDriver(
  url: string,
  method: string,
  body: string,
  signal: AbortSignal,
  timeoutMs: number,
  schema: IphoneHttpResponseSchema,
): Promise<IphoneHttpResponseValue> {
  const options: RequestInit = {
    method,
    headers: { [IPHONE_HTTP_CONTENT_TYPE]: IPHONE_HTTP_JSON },
    signal: AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]),
  }
  if (body) {
    options.body = body
  }
  const response = await fetch(url, options)
  const text = await readIphoneHttpBody(response)
  signal.throwIfAborted()
  const parsed = Value.Parse(schema, JSON.parse(text))
  if (parsed.value && typeof parsed.value === "object" && "error" in parsed.value && "message" in parsed.value) {
    throw new IphoneWebDriverError(parsed.value.error, parsed.value.message)
  }
  if (!response.ok) {
    throw new Error(`${IPHONE_HTTP_INVALID_RESPONSE} HTTP ${response.status}`)
  }
  return parsed.value
}
