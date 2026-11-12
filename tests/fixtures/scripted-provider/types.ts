import { type Static } from "typebox"
import { type PI_PROCESS_SCRIPT_SCHEMA, type PI_PROCESS_STEPS_SCHEMA, type PI_PROCESS_TRACKS_SCHEMA } from "./constants"

export type PiProcessScript = Static<typeof PI_PROCESS_SCRIPT_SCHEMA>

export type PiProcessSteps = Static<typeof PI_PROCESS_STEPS_SCHEMA>

export type PiProcessStep = PiProcessSteps[number]

export type PiProcessTracks = Static<typeof PI_PROCESS_TRACKS_SCHEMA>

export interface PiProcessSelectedStep {
  step: PiProcessStep
  id: string
}
