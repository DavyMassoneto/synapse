import { type Finding } from "#synapse/review"

export function replyJson(findings: Finding[], coverage: string[]): string {
  return JSON.stringify({ coverage, findings })
}
