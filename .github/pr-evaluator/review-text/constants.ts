import { type CriterionLabels, type KindLabels, type VerdictLabels } from "./types"

export const CRITERION_LABELS: CriterionLabels = {
  "clean-code": "Clean Code",
  dry: "DRY",
  yagni: "YAGNI",
  srp: "SRP",
  performance: "Desempenho",
  architecture: "Arquitetura",
}

export const KIND_LABELS: KindLabels = {
  violation: "violação",
  insufficient_context: "contexto insuficiente",
}

export const SECTION_BREAK = "\n\n"

export const COMMENT_BREAK = "\n\n---\n\n"

export const VERDICT_LABELS: VerdictLabels = {
  approve: "aprovar",
  request_changes: "pedir mudanças",
}

export const MARKER_PREFIX = "<!-- pr-evaluator:"

export const MARKER_SUFFIX = " -->"

export const UNPLACED_TITLE = "### Apontamentos sem linha no diff"

export const ITEM_BREAK = "\n"
