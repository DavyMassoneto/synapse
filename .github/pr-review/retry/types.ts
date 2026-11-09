export type Operation<Result> = () => Promise<Result>

export type RetryPredicate = (error: Error) => boolean

export interface RetryPolicy {
  attempts: number
  backoffMs: number
  isRetryable: RetryPredicate
}
