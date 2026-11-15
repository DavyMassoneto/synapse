import { type StartMemberRequest } from "../public"

export const TEAM_TEST_ALICE_REQUEST: StartMemberRequest = { name: "alice", description: "x", task: "x" }

export const TEAM_TEST_SUBSCRIPTION_FAILURE = "Falha ao assinar sessão"

export const TEAM_TEST_SUBSCRIPTION_FAILURE_TEST = "falha de assinatura descarta uma vez sem registrar membro"

export const TEAM_TEST_SUBSCRIPTION_NAME_REUSE_TEST = "falha de assinatura libera o nome"

export const TEAM_TEST_JOURNAL_FAILURE = "journal indisponível"
export const TEAM_TEST_JOURNAL_MUTATED = "journal-mutated"
export const TEAM_TEST_CLEAN_SUITE = "limpeza do quadro"
export const TEAM_TEST_CLEAN_BLOCKERS = "outro bloqueador pendente continua bloqueando"
export const TEAM_TEST_CLEAN_CAPACITY = "limpeza libera capacidade sem reutilizar ID"
export const TEAM_TEST_CLEAN_BATCH = "limpa concluída em lote e preserva satisfação da dependência"
export const TEAM_TEST_CLEAN_REFUSED = "membro não pode limpar no núcleo"
export const TEAM_TEST_CLEAN_EMPTY = "sem concluídas não grava lote"
export const TEAM_TEST_CLEAN_FAILURE = "falha do journal não altera memória"
export const TEAM_TEST_CLEAN_REPLAY = "replay mantém tombstone e identificador monotônico"
export const TEAM_TEST_CLEAN_MUTATION = "journal que altera lote e lança não muda concluídas nem abertas"
export const TEAM_TEST_CLEAN_UNRELATED = "limpeza não revisa abertas sem dependência das concluídas"
export const TEAM_TEST_CLEAN_PLAN_ORDER = "plano preserva ordem e repetições sobreviventes sem alterar as fontes"
export const TEAM_TEST_CLEAN_PLAN_COUNT = "plano conta concluídas sem contar abertas desbloqueadas"

export const TEAM_TEST_REASSIGN_SUITE = "reserva de responsável no quadro"

export const TEAM_TEST_REASSIGN_PENDING = "reserva responsável mantendo tarefa pendente"

export const TEAM_TEST_REASSIGN_BLOCKED = "reserva responsável de tarefa bloqueada"

export const TEAM_TEST_REASSIGN_NOT_STARTED = "não inicia tarefa reservada"

export const TEAM_TEST_REASSIGN_ACTIVE_TO_PENDING = "reatribuição de tarefa em andamento volta a pendente"

export const TEAM_TEST_REASSIGN_STALE_REVISION = "recusa revisão antiga sem mudar reserva"

export const TEAM_TEST_REASSIGN_MEMBER_REFUSED = "recusa reatribuição por membro"

export const TEAM_TEST_REASSIGN_OWNER_MISSING = "recusa responsável inexistente"

export const TEAM_TEST_REASSIGN_OWNER_CLAIMS = "claim posterior do responsável inicia tarefa"

export const TEAM_TEST_REASSIGN_OTHER_CLAIM_REFUSED = "reserva impede claim de outro membro"

export const TEAM_TEST_REASSIGN_BLOCKED_CLAIM_REFUSED = "responsável reservado não assume enquanto bloqueada"

export const TEAM_TEST_REASSIGN_REMOVE_RESERVATION = "lead remove reserva sem iniciar tarefa"

export const TEAM_TEST_REASSIGN_MEMBER_MESSAGE = "Só o lead pode reatribuir tarefas"

export const TEAM_TEST_REASSIGN_OWNER_MESSAGE = "O agente não existe nesta equipe: absent"

export const SHELL_WIRE_TEST_CREATED = "status recusa created duplicado"
export const SHELL_WIRE_TEST_RELEASE = "status recusa exit antes do release"
export const SHELL_WIRE_TEST_INVALID = "status recusa byte inválido"
export const SHELL_WIRE_TEST_EOF = "status recusa EOF em frame parcial"

export const SHELL_LEASE_INVALID_STOP_TITLE = "wire inválido não impede kill e finalização"
export const SHELL_LEASE_OUTPUT_STOP_TITLE = "erro de saída não impede kill e finalização"
export const SHELL_LEASE_TEST_OUTPUT_FAILURE = "output failed"
export const SHELL_LEASE_TRANSPORT_FAILURE = "transport reset"
export const SHELL_LEASE_TRANSPORT_STOP_TITLE = "parada observa erro de pipe %s sem falha não tratada"
export const SHELL_LEASE_TRANSPORT_ACTIVE_TITLE = "erro de pipe %s fora da parada rejeita e encerra ownership"

export const SHELL_MATRIX_EOF_TITLE = "fence incompleta rejeita resultado após EOF (%s)"
export const SHELL_MATRIX_STOP_OUTPUT_TITLE = "output destruído durante stop rejeita C mas confirma T (%s)"
export const SHELL_MATRIX_CONFIRM_TITLE = "resultado sintético depende da confirmação de T (%s)"
export const SHELL_MATRIX_PENDING_TITLE = "exited só após confirmação e sink pendente é cancelado (%s)"
export const SHELL_MATRIX_READY_TITLE = "ready é compartilhado e release revogado não escreve"
export const SHELL_MATRIX_ABORT_TITLE = "abort alcança preparação sem CREATED"
export const SHELL_MATRIX_NOACK_TITLE = "Windows sem empty ACK rejeita T e resultado sintético"
export const SHELL_MATRIX_NORMAL_TITLE = "resultado normal drenado não depende de T posterior com falha (%s)"
export const SHELL_MATRIX_SINK_TITLE = "sink rejeitado durante stop rejeita C sem impedir T (%s)"
export const SHELL_MATRIX_READY_FAILURE_TITLE = "ready não revive após erro e gate recusado não escreve"
export const SHELL_MATRIX_SYNC_TITLE = "close síncrono é observado antes do efeito de terminate"
