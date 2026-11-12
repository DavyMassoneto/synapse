import { type Static } from "typebox"
import { type PI_REQUEST_LOG_SCHEMA } from "./schemas"

export type PiProcessRequestLog = Static<typeof PI_REQUEST_LOG_SCHEMA>
