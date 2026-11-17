import { type ScriptedProviderScript } from "../scripted-provider"
import { SELECTION_MEMBER_MARKER } from "./constants"
import { SELECTION_LEAD_STEPS, SELECTION_MEMBER_STEPS } from "./lifecycle-script"

export const SELECTION_SCRIPT_SCENARIO: ScriptedProviderScript = {
  tracks: [{ marker: SELECTION_MEMBER_MARKER, steps: SELECTION_MEMBER_STEPS }, { steps: SELECTION_LEAD_STEPS }],
}
