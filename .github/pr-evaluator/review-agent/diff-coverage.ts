import { LINE_BREAK, type PageRequest, renderPage } from "#evaluator/output-page"
import { DIFF_INCOMPLETE } from "./constants"
import { ReviewFailure } from "./review-failure"

export class DiffCoverage {
  private readonly read = new Set<number>()
  private readonly lines: string[]

  constructor(diff: string) {
    this.lines = diff.split(LINE_BREAK)
  }

  page(request: PageRequest): string {
    const page = renderPage(this.lines, request)
    for (let line = page.startLine; line <= page.endLine; line += 1) {
      this.read.add(line)
    }
    return page.text
  }

  ensureComplete(): void {
    for (let line = 1; line <= this.lines.length; line += 1) {
      if (!this.read.has(line)) {
        throw new ReviewFailure(`${DIFF_INCOMPLETE}${line}`)
      }
    }
  }
}
