import { LINE_BREAK, MAX_PAGE_LINES, type PageRequest } from "#evaluator/repository-inspection"
import { DIFF_INCOMPLETE } from "./constants"

export class DiffCoverage {
  private readonly lines = new Set<number>()
  private readonly total: number

  constructor(diff: string) {
    this.total = diff.split(LINE_BREAK).length
  }

  record(request: PageRequest): void {
    const end = Math.min(request.endLine, request.startLine + MAX_PAGE_LINES - 1, this.total)
    for (let line = request.startLine; line <= end; line += 1) {
      this.lines.add(line)
    }
  }

  ensureComplete(): void {
    for (let line = 1; line <= this.total; line += 1) {
      if (!this.lines.has(line)) {
        throw new Error(`${DIFF_INCOMPLETE}${line}`)
      }
    }
  }
}
