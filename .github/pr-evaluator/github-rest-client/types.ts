export type GithubMethod = "GET" | "POST"
export interface GithubRequest extends RequestInit {
  method: GithubMethod
}
