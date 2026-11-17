import { type ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { SELECTION_EXCLUDED_FAILURE } from "./constants"

export default function registerSelectionExcluded(_pi: ExtensionAPI): void {
  throw new Error(SELECTION_EXCLUDED_FAILURE)
}
