import { type CriterionLabels, type KindLabels } from "./types"

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

export const SECTION_BREAK = "\n\n"

export const COMMENT_BREAK = "\n\n---\n\n"
