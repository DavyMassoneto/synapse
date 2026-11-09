export interface LineNumbers {
  added: Set<number>
  commentable: Set<number>
}

export type HunkStartLine = number | undefined
