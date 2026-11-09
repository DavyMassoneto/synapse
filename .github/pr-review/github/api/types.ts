export interface BodyPayload {
  body: string
}

export interface ReviewComment {
  path: string
  line: number
  side: string
  body: string
}

export interface ReviewPayload {
  commit_id: string
  event: string
  comments: ReviewComment[]
}

export type ApiPayload = BodyPayload | ReviewPayload

export type GithubNow = () => number
export type GithubWait = (milliseconds: number) => Promise<void>

export interface GithubTiming {
  now: GithubNow
  wait: GithubWait
}

export interface MutationTiming extends GithubTiming {
  hasMutation: boolean
}
