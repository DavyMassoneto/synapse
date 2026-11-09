import { type Theme } from "@earendil-works/pi-coding-agent"
import { ADVISOR_NAME } from "#synapse/integration"

export function themeLabel(theme: Theme): string {
  return theme.fg("accent", ADVISOR_NAME)
}
