import { type Finding } from "../review"
import { fillTemplate } from "../templates"
import { BULLET_FINDING, BULLET_LOCATED } from "./constants"
import { labelOf } from "./label-of"
import { type RuleLabels } from "./types"

export function renderBullet(labels: RuleLabels, finding: Finding): string {
  return fillTemplate(BULLET_FINDING, [labelOf(labels, finding.rule), finding.body])
}

export function renderLocatedBullet(labels: RuleLabels, finding: Finding): string {
  const location = [finding.path, String(finding.line), labelOf(labels, finding.rule), finding.body]
  return fillTemplate(BULLET_LOCATED, location)
}
