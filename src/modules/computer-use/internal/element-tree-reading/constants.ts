export const COMPUTER_AX_ELEMENT_LINE =
  /^\s*(?:-\s+)?\[(\d+)\]\s+(\w+)(?:\s*=\s*"([^"]*)"|\s+"([^"]*)"|\s+\((?!\d+\))([^)]*)\))?(?:\s+(?:\(\d+\)\s+)?id=([^\s[\]]+))?/gm

export const COMPUTER_AX_WINDOW_TITLE = /AXWindow\s+"([^"]+)"/

export const COMPUTER_AX_LABEL_GROUPS_VALUE = 3

export const COMPUTER_AX_LABEL_GROUPS_QUOTED = 4

export const COMPUTER_AX_LABEL_GROUPS_PARENTHESIZED = 5

export const COMPUTER_AX_LABEL_GROUPS_ID = 6

export const COMPUTER_AX_LABEL_GROUPS = [
  COMPUTER_AX_LABEL_GROUPS_VALUE,
  COMPUTER_AX_LABEL_GROUPS_QUOTED,
  COMPUTER_AX_LABEL_GROUPS_PARENTHESIZED,
  COMPUTER_AX_LABEL_GROUPS_ID,
]

export const COMPUTER_TREE_READ = "tree-read"

export const COMPUTER_TREE_UNSUPPORTED = "tree-unsupported"
