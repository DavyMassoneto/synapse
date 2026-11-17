import { type ScriptedProviderScript } from "../scripted-provider"
import {
  ADMISSION_REFUSAL_CALL,
  ADMISSION_REFUSAL_END,
  ADMISSION_REFUSAL_MEMBER_MARKER,
  ADMISSION_REFUSAL_MEMBER_STEPS,
  ADMISSION_REFUSAL_PREPARATION,
} from "./refusal-scenarios"
import { type AdmissionRefusalScenario } from "./types"

export function admissionRefusalScript(scenario: AdmissionRefusalScenario): ScriptedProviderScript {
  return {
    tracks: [
      { marker: ADMISSION_REFUSAL_MEMBER_MARKER, steps: ADMISSION_REFUSAL_MEMBER_STEPS },
      {
        steps: [
          ...ADMISSION_REFUSAL_PREPARATION,
          { ...ADMISSION_REFUSAL_CALL, argumentsJson: scenario.argumentsJson },
          ADMISSION_REFUSAL_END,
        ],
      },
    ],
  }
}
