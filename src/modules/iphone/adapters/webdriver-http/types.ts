import { type Static } from "typebox"
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

export type IphoneHttpSessionValue = Static<(typeof IPHONE_HTTP_SESSION_SCHEMA.properties.value.anyOf)[0]>

export type IphoneHttpElementValue = Static<(typeof IPHONE_HTTP_ELEMENT_SCHEMA.properties.value.anyOf)[0]>

export type IphoneHttpRectValue = Static<(typeof IPHONE_HTTP_RECT_SCHEMA.properties.value.anyOf)[0]>

export type IphoneHttpStringValue = Static<(typeof IPHONE_HTTP_STRING_SCHEMA.properties.value.anyOf)[0]>

export type IphoneHttpMobileTerminateValue = Static<
  (typeof IPHONE_HTTP_MOBILE_TERMINATE_SCHEMA.properties.value.anyOf)[0]
>

export type IphoneHttpMobileLaunchValue = Static<(typeof IPHONE_HTTP_MOBILE_LAUNCH_SCHEMA.properties.value.anyOf)[0]>

export type IphoneHttpEmptyValue = Static<(typeof IPHONE_HTTP_EMPTY_SCHEMA.properties.value.anyOf)[0]>

export type IphoneHttpMobileResultValue = Static<(typeof IPHONE_HTTP_MOBILE_RESULT_SCHEMA.properties.value.anyOf)[0]>

export type IphoneHttpInfoValue = Static<(typeof IPHONE_HTTP_INFO_SCHEMA.properties.value.anyOf)[0]>

export type IphoneHttpResponseSchema =
  | typeof IPHONE_HTTP_SESSION_SCHEMA
  | typeof IPHONE_HTTP_ELEMENT_SCHEMA
  | typeof IPHONE_HTTP_RECT_SCHEMA
  | typeof IPHONE_HTTP_STRING_SCHEMA
  | typeof IPHONE_HTTP_MOBILE_TERMINATE_SCHEMA
  | typeof IPHONE_HTTP_MOBILE_LAUNCH_SCHEMA
  | typeof IPHONE_HTTP_EMPTY_SCHEMA
  | typeof IPHONE_HTTP_MOBILE_RESULT_SCHEMA
  | typeof IPHONE_HTTP_INFO_SCHEMA

export type IphoneHttpResponseValue =
  | IphoneHttpSessionValue
  | IphoneHttpElementValue
  | IphoneHttpRectValue
  | IphoneHttpStringValue
  | IphoneHttpMobileTerminateValue
  | IphoneHttpMobileLaunchValue
  | IphoneHttpEmptyValue
  | IphoneHttpMobileResultValue
  | IphoneHttpInfoValue

export type IphoneHttpMobileSchema =
  | typeof IPHONE_HTTP_MOBILE_TERMINATE_SCHEMA
  | typeof IPHONE_HTTP_MOBILE_LAUNCH_SCHEMA
  | typeof IPHONE_HTTP_MOBILE_RESULT_SCHEMA
