import { type AgentToolResult } from "@earendil-works/pi-agent-core"
import { type AgentSessionEvent, createAgentSession } from "@earendil-works/pi-coding-agent"
import { type PageRequest } from "#evaluator/output-page"
import {
  type InspectionContext,
  InspectionFailure,
  type InspectionRequest,
  inspectionRoot,
  inspectRepository,
  verifySnapshot,
} from "#evaluator/repository-inspection"
import { parseReviewResult, type ReviewResult } from "#evaluator/review-result"
import {
  FAILED,
  INSPECTION_REQUIRED,
  MAX_EXECUTION_MS,
  MAX_TURNS,
  NO_SUBMISSION,
  PENDING,
  READY,
  SUBMITTED,
  SUBMITTED_MESSAGE,
  TEXT,
  TIME_EXCEEDED,
  TURN_START,
  TURNS_EXCEEDED,
} from "./constants"
import { DiffCoverage } from "./diff-coverage"
import { ReviewFailure } from "./review-failure"
import { reviewSessionOptions } from "./session-options"
import { reviewTools } from "./tools"
import { type ReviewState, type ReviewSubmission, type SessionState, type WorkerInput } from "./types"
import { logReviewEvent } from "./usage-log"

export class ReviewRun {
  private state: ReviewState = { kind: PENDING }
  private turns = 0
  private inspected = false
  private readonly coverage: DiffCoverage
  private readonly context: InspectionContext
  private readonly input: WorkerInput
  private session: SessionState = { kind: PENDING }

  constructor(input: WorkerInput) {
    this.input = input
    this.context = { sha: input.sha, root: inspectionRoot() }
    this.coverage = new DiffCoverage(input.diff)
  }

  private async inspect(_id: string, request: InspectionRequest): Promise<AgentToolResult<string>> {
    this.ensurePending()
    try {
      const text = inspectRepository(this.context, request)
      this.inspected = true
      return { content: [{ type: TEXT, text }], details: text }
    } catch (error) {
      if (error instanceof InspectionFailure) {
        this.state = { kind: FAILED, message: error.message }
      }
      throw error
    }
  }

  private async diff(_id: string, request: PageRequest): Promise<AgentToolResult<string>> {
    this.ensurePending()
    const text = this.coverage.page(request)
    return { content: [{ type: TEXT, text }], details: text }
  }

  private async submit(_id: string, submission: ReviewSubmission): Promise<AgentToolResult<string>> {
    this.ensurePending()
    if (!this.inspected) {
      throw new ReviewFailure(INSPECTION_REQUIRED)
    }
    this.coverage.ensureComplete()
    const review = parseReviewResult(JSON.stringify(submission))
    this.state = { kind: SUBMITTED, review }
    return { content: [{ type: TEXT, text: SUBMITTED_MESSAGE }], details: SUBMITTED_MESSAGE, terminate: true }
  }

  private ensurePending(): void {
    if (this.state.kind === FAILED) {
      throw new ReviewFailure(this.state.message)
    }
    if (this.state.kind === SUBMITTED) {
      throw new ReviewFailure(SUBMITTED_MESSAGE)
    }
  }

  private observe(event: AgentSessionEvent): void {
    if (event.type === TURN_START) {
      this.startTurn()
    }
    logReviewEvent(event, this.turns)
  }

  private startTurn(): void {
    if (this.state.kind === SUBMITTED) {
      this.abortSession()
    } else {
      this.turns += 1
      if (this.turns > MAX_TURNS) {
        this.state = { kind: FAILED, message: TURNS_EXCEEDED }
        this.abortSession()
      }
    }
  }

  private abortSession(): void {
    if (this.session.kind === READY) {
      void this.session.value.abort()
    }
  }

  private timeout(): void {
    this.state = { kind: FAILED, message: TIME_EXCEEDED }
    this.abortSession()
  }

  async run(): Promise<ReviewResult> {
    verifySnapshot(this.context)
    const { session } = await createAgentSession(
      await reviewSessionOptions(
        this.input.model,
        reviewTools({ inspect: this.inspect.bind(this), diff: this.diff.bind(this), submit: this.submit.bind(this) }),
      ),
    )
    this.session = { kind: READY, value: session }
    const unsubscribe = session.subscribe(this.observe.bind(this))
    const timer = setTimeout(this.timeout.bind(this), MAX_EXECUTION_MS)
    try {
      await session.prompt(this.input.prompt)
      if (this.state.kind === SUBMITTED) {
        return this.state.review
      }
      if (this.state.kind === FAILED) {
        throw new ReviewFailure(this.state.message)
      }
      throw new ReviewFailure(NO_SUBMISSION)
    } finally {
      clearTimeout(timer)
      unsubscribe()
      session.dispose()
    }
  }
}
