import { COMPUTER_COMPLETED, COMPUTER_UNCONFIRMED } from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_VERDICT_DONE, COMPUTER_VERDICT_VERIFY } from "./outcomes"
import { type ComputerCodePolicies, type ComputerEffectPolicies } from "./policy"

export const COMPUTER_VERIFY_UNCONFIRMED_MESSAGE =
  "A entrada foi entregue sem confirmação. Capture o estado e confira antes de decidir agir; não repita apenas pela recomendação de escalada."

export const COMPUTER_VERIFY_TRANSPORT_MESSAGE =
  "O transporte concluiu, mas o efeito não foi comprovado. Capture o estado e confirme."

export const COMPUTER_VERIFY_UNKNOWN_MESSAGE =
  "O resultado é desconhecido e a ação não deve ser repetida. Capture o estado atual."

export const COMPUTER_ESCALATE_SET_VALUE_MESSAGE =
  "Nenhum caractere chegou. Use set_value no índice do campo; capture antes se o índice estiver desatualizado."

export const COMPUTER_ESCALATE_MESSAGE =
  "A entrada provavelmente não teve efeito. Siga a recomendação de coordenada ou primeiro plano, sem prever pelo aplicativo."

export const COMPUTER_EFFECT_POLICIES: ComputerEffectPolicies = {
  confirmed: { resultKind: COMPUTER_COMPLETED, verdict: { kind: COMPUTER_VERDICT_DONE } },
  unverifiable: {
    resultKind: COMPUTER_UNCONFIRMED,
    verdict: { kind: COMPUTER_VERDICT_VERIFY, message: COMPUTER_VERIFY_UNCONFIRMED_MESSAGE, retryAllowed: false },
  },
}

export const COMPUTER_CODE_OUTCOME_UNCERTAINTY: ComputerCodePolicies = {
  type_text_incomplete: false,
  timeout_outcome_unknown: true,
  transport_outcome_unknown: true,
}
