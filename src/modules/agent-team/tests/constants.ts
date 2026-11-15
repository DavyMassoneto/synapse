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
