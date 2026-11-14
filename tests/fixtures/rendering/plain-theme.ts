import { type ThemeColor } from "@earendil-works/pi-coding-agent"
import { type AdvisorRenderTheme } from "#synapse/integration/pi/advisor"

export class PlainTheme implements AdvisorRenderTheme {
  fg(_color: ThemeColor, text: string): string {
    return text
  }

  bold(text: string): string {
    return text
  }
}
