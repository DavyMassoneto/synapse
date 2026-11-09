import { type CriterionLabels, type KindLabels, type VerdictLabels } from "./types"

export const CRITERION_LABELS: CriterionLabels = {
  "clean-code": "Clean Code",
  dry: "DRY",
  yagni: "YAGNI",
  srp: "SRP",
  architecture: "Arquitetura",
}

export const KIND_LABELS: KindLabels = {
  violation: "violação",
  insufficient_context: "contexto insuficiente",
}

export const VERDICT_LABELS: VerdictLabels = {
  approve: "aprovar",
  approve_with_remarks: "aprovar com ressalvas",
  request_changes: "pedir mudanças",
}

export const MARKER_PREFIX = "<!-- pr-evaluator:"

export const MARKER_SUFFIX = " -->"

export const SECTION_BREAK = "\n\n"

export const COMMENT_BREAK = "\n\n---\n\n"
