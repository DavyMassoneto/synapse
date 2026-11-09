export const GH_COMMAND = "gh"

export const API_ARGUMENTS = ["api"]

export const METHOD_FLAG = "-X"

export const INPUT_ARGUMENTS = ["--input", "-"]

export const DIFF_ARGUMENTS = ["pr", "diff"]

export const REPO_FLAG = "--repo"

export const RATE_LIMIT_MARKER = "rate limit"

export const RATE_LIMIT_ATTEMPTS = 5

export const RATE_LIMIT_BACKOFF_MS = 60_000

export const INCLUDE_ARGUMENT = "-i"
export const MUTATION_INTERVAL_MS = 1_000
export const MILLISECONDS_PER_SECOND = 1_000
export const RETRY_AFTER_HEADER = /^retry-after:\s*(\d+)\s*$/im
export const RESET_HEADER = /^x-ratelimit-reset:\s*(\d+)\s*$/im
export const REMAINING_ZERO_HEADER = /^x-ratelimit-remaining:\s*0\s*$/im
export const RATE_LIMIT_STATUS = /^HTTP\/\S+\s+429\b/m
