import { describe, test } from "vitest"
import {
  createsBoardTaskScenario,
  PI_PROCESS_TIMEOUT_MS,
  rejectsUnknownRecipientScenario,
  restoresMemberScenario,
  runWithPiProcess,
  smokeScenario,
} from "../fixtures"

function registerTests(): void {
  test(
    "pi cria sessão real de membro sem erro de carregador",
    runWithPiProcess.bind(undefined, smokeScenario),
    PI_PROCESS_TIMEOUT_MS,
  )
  test(
    "mensagem para agente inexistente vira erro de ferramenta",
    runWithPiProcess.bind(undefined, rejectsUnknownRecipientScenario),
    PI_PROCESS_TIMEOUT_MS,
  )
  test(
    "pi cria e lista tarefa no quadro compartilhado",
    runWithPiProcess.bind(undefined, createsBoardTaskScenario),
    PI_PROCESS_TIMEOUT_MS,
  )
  test(
    "novo processo restaura membro parado da mesma sessão",
    runWithPiProcess.bind(undefined, restoresMemberScenario),
    PI_PROCESS_TIMEOUT_MS,
  )
}

describe("distribuição da equipe de agentes", registerTests)
