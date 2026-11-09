import { type GithubWait, type MutationTiming } from "#synapse/github"

export function createTiming(wait: GithubWait): MutationTiming {
  return { now, wait, hasMutation: false }
}

function now(): number {
  return 0
}

export async function noWait(): Promise<void> {}
