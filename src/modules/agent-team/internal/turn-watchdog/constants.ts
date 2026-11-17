export const MEMBER_TURN_IDLE_TIMEOUT_MS = 600000
export const MEMBER_WATCHDOG_IDLE = "idle"
export const MEMBER_WATCHDOG_RUNNING = "running"
export const MEMBER_WATCHDOG_NOTICE =
  "Watchdog: turno sem atualização por 10 minutos; interrupção e parada das shells solicitadas, ainda não confirmadas."
export const MEMBER_WATCHDOG_CONFIRMED = "Watchdog: parada do turno e das shells confirmada."
export const MEMBER_WATCHDOG_UNCONFIRMED =
  "Watchdog: parada não confirmada; o membro permanece ocupado até o encerramento observado."

export const MEMBER_WATCHDOG_NOTIFICATION_FAILED = "Falha ao entregar aviso do watchdog."

export const MEMBER_WATCHDOG_OBSERVATIONAL_TOOLS = [
  "list_agents",
  "team_task_list",
  "team_task_get",
  "list_models",
  "send_message",
]
