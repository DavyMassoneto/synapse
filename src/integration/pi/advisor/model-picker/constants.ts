import { type Cancelled } from "#synapse/modules"

export const MODEL_SELECTION_LIMIT = 100

export const CANCELLED_SELECTION: Cancelled = { kind: "cancelled" }

export const PICKER_TEXT = {
  title: "Modelo advisor",
  disabledOption: "(sem advisor)",
  ambiguousModel: "Mais de um modelo corresponde; informe uma referência mais específica.",
}
