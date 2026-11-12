import { type Static } from "typebox"
import { type PI_PROCESS_SCRIPT_SCHEMA } from "./constants"

export type PiProcessScript = Static<typeof PI_PROCESS_SCRIPT_SCHEMA>

export type PiProcessStep = PiProcessScript[number]
