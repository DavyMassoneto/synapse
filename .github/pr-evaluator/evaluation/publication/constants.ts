export const MESSAGE_SUPERSEDED = "A PR recebeu um commit novo durante a avaliação; esta avaliação não será publicada."

export const RECONCILED_PUBLICATION = "reconciled"
export const ABSENT_PUBLICATION = "absent"
export const SUPERSEDED_PUBLICATION = "superseded"
export const RECONCILIATION_ATTEMPTS = 3
export const RECONCILIATION_DELAY_MS = 1000
export const PUBLICATION_UNCERTAIN =
  "A publicação ficou incerta após falha de transporte; nenhuma nova tentativa de POST foi feita. A avaliação está registrada no log."
export const PUBLICATION_RECONCILED =
  "A review deste avaliador para o commit foi encontrada após a falha de transporte; nenhum POST foi repetido."
export const RECONCILIATION_FAILURE = "A consulta de reconciliação falhou: "
export const RECONCILIATION_HEAD = " Commit atual observado durante a reconciliação: "
export const PRESERVED_REVIEW_LABEL = "Avaliação preservada: "
export const LINE_SEPARATOR_PATTERN = /\u2028/g
export const PARAGRAPH_SEPARATOR_PATTERN = /\u2029/g
export const ESCAPED_LINE_SEPARATOR = "\\u2028"
export const ESCAPED_PARAGRAPH_SEPARATOR = "\\u2029"
