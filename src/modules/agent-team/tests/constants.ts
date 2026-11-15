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
