import { type StartMemberRequest } from "../public"

export const TEAM_TEST_WAIT_CANCELLED_DESCRIPTION = "cancelamento devolve resultado explícito"

export const TEAM_TEST_ALICE_REQUEST: StartMemberRequest = { name: "alice", description: "x", task: "x" }

export const TEAM_TEST_SUBSCRIPTION_FAILURE = "Falha ao assinar sessão"

export const TEAM_TEST_SUBSCRIPTION_FAILURE_TEST = "falha de assinatura descarta uma vez sem registrar membro"

export const TEAM_TEST_SUBSCRIPTION_NAME_REUSE_TEST = "falha de assinatura libera o nome"
