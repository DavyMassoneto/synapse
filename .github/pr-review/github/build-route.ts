import { type Settings } from "../settings"
import { fillTemplate } from "../templates"

export function buildRoute(template: string, settings: Settings, extra: string[]): string {
  return fillTemplate(template, [settings.repo, ...extra])
}
