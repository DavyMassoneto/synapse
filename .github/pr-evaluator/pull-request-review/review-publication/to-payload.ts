import { type ReviewComment, type ReviewPayload } from "./types"

export function toPayload(headSha: string, body: string, comments: ReviewComment[]): ReviewPayload {
  return { commit_id: headSha, event: "COMMENT", body, comments }
}
