import { type Finding } from "../review"
import { fillTemplate } from "../templates"
import { BULLET_FINDING } from "./constants"
import { labelOf, type RuleLabels } from "./labels"

export function renderBullet(labels: RuleLabels, finding: Finding): string {
  return fillTemplate(BULLET_FINDING, [labelOf(labels, finding.rule), finding.body])
}
