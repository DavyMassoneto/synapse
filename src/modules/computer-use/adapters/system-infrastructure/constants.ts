import {
  COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE,
  type ComputerDriverPolicy,
} from "#synapse/modules/computer-use/public/contracts"

export const COMPUTER_SYSTEM_DRIVER_TIMEOUT_MILLISECONDS = 30000

export const COMPUTER_DRIVER_POLICY_DEFAULT: ComputerDriverPolicy = {
  mode: COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE,
}

export const COMPUTER_SYSTEM_RUNTIME_VERSION_DIVERGENCE =
  "O cua-driver em execução reporta uma versão diferente da selecionada; a sessão foi recusada antes de qualquer ação."
