export const GIT_DIFF_ARGUMENTS: string[] = [
  "-c",
  "core.quotepath=false",
  "diff",
  "--no-color",
  "--no-ext-diff",
  "--no-textconv",
  "-M",
]

export const DIFF_BUFFER_BYTES = 268_435_456
