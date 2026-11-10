import { type ReviewResult } from "#evaluator/review-result"

export function reportVerdict(result: ReviewResult): void {
  console.log(`Veredito: ${result.verdict}; ${result.findings.length} apontamento(s)`)
}
