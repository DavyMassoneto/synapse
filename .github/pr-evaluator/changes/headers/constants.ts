export const DIFF_FILE_HEADER = "diff --git "

export const OLD_FILE_HEADER = "--- "

export const NEW_FILE_HEADER = "+++ "

export const OLD_START_PATTERN = /^@@ -(\d+)(?:,\d+)? \+\d+(?:,\d+)? @@.*$/

export const NEW_START_PATTERN = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@.*$/
