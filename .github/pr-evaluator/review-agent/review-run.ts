import { type AgentToolResult } from "@earendil-works/pi-agent-core"
import {
  type AgentSessionEvent,
  type CreateAgentSessionOptions,
  createAgentSession,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent"
import {
  DIFF_DESCRIPTION,
  INSPECT_REPOSITORY,
  INSPECTION_DESCRIPTION,
  InspectionFailure,
  type InspectionRequest,
  InspectionSchema,
  inspectionPage,
  inspectRepository,
  type PageRequest,
  PageSchema,
  READ_DIFF,
  verifySnapshot,
} from "#evaluator/repository-inspection"
import {
  parseReviewResult,
  type ReviewResult,
  ReviewSubmissionSchema,
  SUBMIT_REVIEW,
  SUBMIT_REVIEW_TOOL,
} from "#evaluator/review-result"
import {
  ASSISTANT,
  FAILED,
  INSPECTION_REQUIRED,
  MAX_EXECUTION_MS,
  MAX_TURNS,
  MESSAGE_END,
  NO_SUBMISSION,
  PENDING,
  PROVIDER,
  SEQUENTIAL,
  SETTINGS,
  SUBMITTED,
  SUBMITTED_MESSAGE,
  TEXT,
  THINKING_LEVEL,
  TIME_EXCEEDED,
  TOOL_EXECUTION_START,
  TOOL_LABEL,
  TOOL_SEPARATOR,
  TURN_START,
  TURNS_EXCEEDED,
} from "./constants"
import { DiffCoverage } from "./diff-coverage"
import { reviewModelRuntime } from "./model-runtime"
import { ReviewResources } from "./resources"
import { type ReviewState, type ReviewSubmission, type SessionState, type WorkerInput } from "./types"
import { logReviewUsage } from "./usage-log"

export class ReviewRun {
  private state: ReviewState = { kind: PENDING }
  private turns = 0
  private inspected = false
  private readonly coverage: DiffCoverage
  private readonly input: WorkerInput
  private session: SessionState = { kind: PENDING }

  constructor(input: WorkerInput) {
    this.input = input
    this.coverage = new DiffCoverage(input.diff)
  }

  private async inspect(_id: string, request: InspectionRequest): Promise<AgentToolResult<string>> {
    this.ensurePending()
    try {
      const text = inspectRepository(this.input, request)
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
    const text = inspectionPage(this.input.diff, request)
    this.coverage.record(request)
    return { content: [{ type: TEXT, text }], details: text }
  }

  private async submit(_id: string, submission: ReviewSubmission): Promise<AgentToolResult<string>> {
    this.ensurePending()
    if (!this.inspected) {
      throw new Error(INSPECTION_REQUIRED)
    }
    this.coverage.ensureComplete()
    const review = parseReviewResult({
      toolCalls: [{ function: { name: SUBMIT_REVIEW, arguments: JSON.stringify(submission) } }],
    })
    this.state = { kind: SUBMITTED, review }
    return { content: [{ type: TEXT, text: SUBMITTED_MESSAGE }], details: SUBMITTED_MESSAGE, terminate: true }
  }

  private ensurePending(): void {
    if (this.state.kind !== PENDING) {
      throw new Error(SUBMITTED_MESSAGE)
    }
  }

  private observe(event: AgentSessionEvent): void {
    if (event.type === TURN_START) {
      if (this.state.kind === SUBMITTED && this.session.kind === SUBMITTED) {
        void this.session.value.abort()
      }
      this.turns += 1
      if (this.turns > MAX_TURNS) {
        this.state = { kind: FAILED, message: TURNS_EXCEEDED }
        if (this.session.kind === SUBMITTED) {
          void this.session.value.abort()
        }
      }
    }
    if (event.type === MESSAGE_END && event.message.role === ASSISTANT) {
      logReviewUsage(this.turns, event.message.usage)
    }
    if (event.type === TOOL_EXECUTION_START) {
      console.error(`${TOOL_LABEL}${JSON.stringify(event.toolName)}${TOOL_SEPARATOR}${JSON.stringify(event.args)}`)
    }
  }

  private timeout(): void {
    this.state = { kind: FAILED, message: TIME_EXCEEDED }
    if (this.session.kind === SUBMITTED) {
      void this.session.value.abort()
    }
  }

  private async options(): Promise<CreateAgentSessionOptions> {
    const runtime = await reviewModelRuntime(this.input.model)
    const model = runtime.getModel(PROVIDER, this.input.model.model)
    if (!model) {
      throw new Error(NO_SUBMISSION)
    }
    return {
      cwd: process.cwd(),
      model,
      modelRuntime: runtime,
      thinkingLevel: THINKING_LEVEL,
      settingsManager: SettingsManager.inMemory(SETTINGS),
      sessionManager: SessionManager.inMemory(),
      resourceLoader: new ReviewResources(),
      tools: [INSPECT_REPOSITORY, READ_DIFF, SUBMIT_REVIEW],
      customTools: this.tools(),
    }
  }

  private tools(): NonNullable<CreateAgentSessionOptions["customTools"]> {
    return [
      {
        name: INSPECT_REPOSITORY,
        label: INSPECT_REPOSITORY,
        description: INSPECTION_DESCRIPTION,
        parameters: InspectionSchema,
        execute: this.inspect.bind(this),
      },
      {
        name: READ_DIFF,
        label: READ_DIFF,
        description: DIFF_DESCRIPTION,
        parameters: PageSchema,
        execute: this.diff.bind(this),
      },
      {
        name: SUBMIT_REVIEW,
        label: SUBMIT_REVIEW,
        description: SUBMIT_REVIEW_TOOL.function.description,
        parameters: ReviewSubmissionSchema,
        executionMode: SEQUENTIAL,
        execute: this.submit.bind(this),
      },
    ]
  }

  async run(): Promise<ReviewResult> {
    verifySnapshot(this.input.sha)
    const { session } = await createAgentSession(await this.options())
    this.session = { kind: SUBMITTED, value: session }
    const unsubscribe = session.subscribe(this.observe.bind(this))
    const timer = setTimeout(this.timeout.bind(this), MAX_EXECUTION_MS)
    try {
      await session.prompt(this.input.prompt)
      if (this.state.kind === SUBMITTED) {
        return this.state.review
      }
      if (this.state.kind === FAILED) {
        throw new Error(this.state.message)
      }
      throw new Error(NO_SUBMISSION)
    } finally {
      clearTimeout(timer)
      unsubscribe()
      session.dispose()
    }
  }
}
