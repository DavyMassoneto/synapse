import { type Finding, type Reply } from "../model"
import {
  COMMENT_BREAK,
  CRITERION_LABELS,
  KIND_LABELS,
  MARKER_PREFIX,
  MARKER_SUFFIX,
  SECTION_BREAK,
  VERDICT_LABELS,
} from "./constants"

export function reviewMarker(headSha: string): string {
  return `${MARKER_PREFIX}${headSha}${MARKER_SUFFIX}`
}

function findingBody(finding: Finding): string {
  const title = `**${CRITERION_LABELS[finding.criterion]} · ${KIND_LABELS[finding.kind]}** · ${finding.rule}`
  return [title, finding.evidence, `**Impacto:** ${finding.impact}`, `**Correção:** ${finding.fix}`].join(SECTION_BREAK)
}

export function commentBody(findings: Finding[]): string {
  return findings.map(findingBody).join(COMMENT_BREAK)
}

function unplacedItem(finding: Finding): string {
  const label = CRITERION_LABELS[finding.criterion]
  return `- \`${finding.path}:${finding.line}\` (${label} · ${KIND_LABELS[finding.kind]}, ${finding.rule}): ${finding.evidence} Correção: ${finding.fix}`
}

function unplacedSection(unplaced: Finding[]): string[] {
  if (unplaced.length === 0) {
    return []
  }
  return [["### Apontamentos sem linha no diff", ...unplaced.map(unplacedItem)].join("\n")]
}

export function reviewBody(reply: Reply, unplaced: Finding[], inlineCount: number, headSha: string): string {
  return [
    reviewMarker(headSha),
    `## Avaliação automática: ${VERDICT_LABELS[reply.verdict]}`,
    reply.summary,
    `${inlineCount} comentário(s) nas linhas do diff e ${unplaced.length} apontamento(s) sem linha no diff.`,
    ...unplacedSection(unplaced),
  ].join(SECTION_BREAK)
}
