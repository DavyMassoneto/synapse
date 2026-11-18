export type MemberOutcomeCallback = () => void | Promise<void>
export type MemberOutcomeAction = MemberOutcomeCallback | Promise<void>
export type MemberOutcome = MemberOutcomeSuccess | MemberOutcomeFailure
interface MemberOutcomeSuccess {
  failed: false
}
interface MemberOutcomeFailure {
  failed: true
  error: Error
}
