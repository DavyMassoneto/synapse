export const GIT_DIFF_ARGUMENTS = [
  "-c",
  "core.quotepath=false",
  "diff",
  "--no-color",
  "--no-ext-diff",
  "--no-textconv",
  "-M",
]

export const DIFF_BUFFER_BYTES = 8_388_608

export const BUFFER_OVERFLOW_CODE = "ENOBUFS"
