export type MemberOutcomeAction = () => void | Promise<void>
export type MemberOutcome = MemberOutcomeSuccess | MemberOutcomeFailure
interface MemberOutcomeSuccess {
  failed: false
}
interface MemberOutcomeFailure {
  failed: true
  error: Error
}
