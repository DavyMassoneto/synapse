import { LINE_BREAK } from "../separators"
import { INLINE_MARKER } from "./constants"
import { renderBullet } from "./render-bullet"
import { type LineGroup, type RuleLabels } from "./types"

export function renderInline(labels: RuleLabels, group: LineGroup): string {
  const bullets = group.findings.map((finding) => renderBullet(labels, finding))
  return [INLINE_MARKER, ...bullets].join(LINE_BREAK)
}
