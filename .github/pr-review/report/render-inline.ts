import { LINE_BREAK } from "../separators"
import { INLINE_MARKER } from "./constants"
import { type RuleLabels } from "./labels"
import { type LineGroup } from "./placement"
import { renderBullet } from "./render-bullets"

export function renderInline(labels: RuleLabels, group: LineGroup): string {
  const bullets = group.findings.map((finding) => renderBullet(labels, finding))
  return [INLINE_MARKER, ...bullets].join(LINE_BREAK)
}
