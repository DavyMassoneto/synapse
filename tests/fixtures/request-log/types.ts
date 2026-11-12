import { type Static } from "typebox"
import { type PI_REQUEST_LOG_SCHEMA } from "./constants"

export type PiProcessRequestLog = Static<typeof PI_REQUEST_LOG_SCHEMA>
