import { type TeamRefused } from "#synapse/modules/agent-team/public/contracts"

export type TeamOperation<Result> = () => Result

export type TeamAsyncOperation<Result> = () => Promise<Result>

export type TeamOperationOutcome<Result> = Result | TeamRefused
