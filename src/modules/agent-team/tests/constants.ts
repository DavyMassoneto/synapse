import { type SupervisedShellSpec } from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { type StartMemberRequest } from "../public"
import { type ShellTestStdioOptions } from "./native-test-types"

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
export const SHELL_REQUIREMENT_POWERSHELL_TITLE = "recusa PowerShell ausente com motivo claro"
export const SHELL_REQUIREMENT_ADD_TYPE_TITLE = "recusa executável sem Add-Type funcional"
export const SHELL_REQUIREMENT_PLATFORM_TITLE = "recusa plataforma não suportada antes de criar shell"
export const SHELL_CLOSE_JOB_VALID_TITLE = "prova CloseJob valida sequência real e ausência do filho registrado"
export const SHELL_CLOSE_JOB_VALID_FRAME = "0102000000000000001d03"
export const SHELL_CLOSE_JOB_FRAME_TITLE = "prova CloseJob recusa frame inválido %s"

export const SHELL_ADMISSION_RETIRED_TITLE = "lease confirmado é retirado antes da próxima parada"
export const SHELL_ADMISSION_BACKGROUND_TITLE = "resultado foreground não retira ownership background"
export const SHELL_ADMISSION_QUARANTINE_TITLE = "quarentena permanece rastreada sem repetir sinal"
export const SHELL_ADMISSION_TEST_SPEC: SupervisedShellSpec = {
  executable: "node",
  arguments: [],
  cwd: ".",
  environment: {},
}

export const SHELL_FAILED_CREATE_TIMEOUT_TITLE = "criação falha preserva timeout de confirmação como falha posterior"
export const SHELL_FAILED_CREATE_TEST_WAIT_MS = 10000
export const SHELL_FAILED_CREATE_TRACKED_TITLE = "criação falha preserva ownership incerto e falha em stops posteriores"
export const SHELL_FAILED_CREATE_RETIRED_TITLE = "criação falha com cleanup comprovado não permanece no registro"
export const SHELL_FAILED_CREATE_PRESPAWN_TITLE = "falha antes de spawn não deixa admissão pendente"

export const SHELL_PROBE_DIAGNOSTIC_TEST_TITLE = "diagnóstico preserva saída local sem promessa de redação"
export const SHELL_PROBE_DIAGNOSTIC_BOUND_TITLE = "diagnóstico limita bytes UTF-8 sem quebrar caracteres: $name"
export const SHELL_LEASE_OUTPUT_DURING_STOP_TITLE =
  "erro de saída durante parada rejeita resultado e preserva quarentena"
export const SHELL_PROBE_DIAGNOSTIC_SUCCESS_TITLE = "diagnóstico preserva código e stderr inclusive marcador inválido"
export const SHELL_PROBE_DIAGNOSTIC_PRIVATE_TEXT =
  "Add-Type failed C:\\Users\\Person\\secret.ps1 /home/person/secret.ps1 user@example.invalid token=private-token \u001b[31m"

export const SHELL_REQUIREMENT_EXACT_MARKER_TITLE = "probe aceita somente marcador exato com sucesso"
export const SHELL_REQUIREMENT_EXTRA_LINE_TITLE = "probe recusa stdout com linha extra mesmo com código zero"
export const SHELL_REQUIREMENT_TEST_MARKER = "ADD_TYPE_AVAILABLE\n"
export const SHELL_REQUIREMENT_TEST_EXTRA_LINE =
  "WARNING: The generated type defines no public methods or properties.\nADD_TYPE_AVAILABLE\n"

export const SHELL_GROUP_INVALID_TITLE = "PGID inválido recusa antes de consultar ps %s"

export const SHELL_KEEPER_BARRIER_FD = 4
export const SHELL_KEEPER_BARRIER_FILE = "./keeper-barrier.ts"
export const SHELL_KEEPER_BARRIER_ERROR = "Keeper barrier transport unavailable"
export const SHELL_KEEPER_BARRIER_TEST_TITLE = "revogação espera barreira de spawn antes do kill do grupo"

export const SHELL_KEEPER_OLD_KILL_TITLE = "kill antigo não confunde zombie com barreira viva"

export const SHELL_NATIVE_FIXTURE_EXECUTABLE_ARGUMENT = 2
export const SHELL_NATIVE_FIXTURE_DIRECTORY_ARGUMENT = 3
export const SHELL_NATIVE_FIXTURE_COMMAND_ARGUMENT = 4

export const SHELL_NATIVE_FIXTURE_FILE = "./native-keeper-fixture.ts"

export const SHELL_NATIVE_DEATH_TITLE = "morte do reservador não produz ACK de vazio"
export const SHELL_NATIVE_EXPIRED_TITLE = "deadline já vencido rejeita sem ACK"
export const SHELL_NATIVE_FROZEN_TITLE = "reservador suspenso não reinicia deadline após retomar"
export const SHELL_NATIVE_TEST_MS = 15000

export const SHELL_NATIVE_EOF_TITLE = "EOF antes do release confirma cleanup sem código do usuário"
export const SHELL_NATIVE_INVALID_TITLE = "controle inválido antes do release preserva erro e prova de vazio"

export const SHELL_NATIVE_PAUSED_OUTPUT_TITLE = "saída direta permanece legível quando EXIT chega com reader pausado"

export const SHELL_NATIVE_LEASE_PAUSED_TITLE =
  "completion aguarda pipe direto mesmo com EXIT antes do listener de dados"

export const SHELL_NATIVE_ZOMBIE_TITLE = "EPERM de grupo só com zombie não confirma vazio e expira em cinco segundos"

export const SHELL_NATIVE_PREPARATION_VALID_TITLE = "cleanup de preparação vazio é terminal tipado"
export const SHELL_NATIVE_PREPARATION_INVALID_TITLE = "cleanup de preparação rejeita frame inválido %s"

export const SHELL_NATIVE_STOP_PRIORITY_TITLE = "STOP vence release já enfileirado na mesma passada de poll"

export const SHELL_NATIVE_BAD_CACHE_TITLE = "cache corrompido é recusado antes do exec"
export const SHELL_NATIVE_SYMLINK_TITLE = "cache symlink não é executado mesmo com hash do alvo"

export const SHELL_NATIVE_ARTIFACT_ERROR = "Native artifact test server unavailable"
export const SHELL_NATIVE_DOWNLOAD_BAD_HASH_TITLE = "download com hash inválido não publica launcher"

export const SHELL_NATIVE_DOWNLOAD_CONCURRENT_TITLE = "downloads concorrentes publicam somente o launcher verificado"

export const SHELL_NATIVE_REAP_BEFORE_PIPE_TITLE = "reap anterior ao pipe de exec não publica exit 126 nem perde errno"

export const SHELL_NATIVE_JOIN_FAILURE_TITLE = "falha de JOIN mantém gate revogado e errno original"

export const SHELL_NATIVE_COMMIT_TITLE = "ESRCH com ACK perdido faz commit e não repete sinal"

export const SHELL_NATIVE_CONTROL_DEADLINE_TITLE = "deadline local é único e prazo posterior só reduz"

export const SHELL_NATIVE_DOWNLOAD_ABORT_TITLE = "provisionamento cancelado preserva motivo e não publica"

export const SHELL_NATIVE_LATE_ACK_TITLE = "ACK após prazo é rejeitado antes do callback do timer"

export const SHELL_NATIVE_STATUS_LOSS_TITLE = "canal de status perdido não fabrica ACK de cleanup"

export const SHELL_NATIVE_SESSION_DEATH_TITLE = "morte do keeper de sessão não produz sucesso de ownership"

export const SHELL_NATIVE_JOIN_KERNEL_TITLE = "kernel recusa join de outra sessão antes do exec"

export const SHELL_RUNTIME_FILE = "../adapters/supervised-shell/unix/keeper.ts"
export const SHELL_RUNTIME_STDIO: ShellTestStdioOptions = ["ignore", "pipe", "pipe", "pipe", "ignore", "pipe"]
export const SHELL_RUNTIME_INVALID_TITLE = "keeper real preserva controle inválido e encerra com writer aberto"
export const SHELL_RUNTIME_PARTIAL_TITLE = "keeper real limita STOP parcial ao prazo original"
export const SHELL_RUNTIME_DUPLICATE_TITLE = "keeper real rejeita RELEASE duplicado antes do gate"

export const SHELL_NATIVE_MIXED_STATUS_TITLE = "prefixo parcial %s nunca é descartado por preparação terminal"

export const SHELL_NATIVE_IDENTITY_NEGATIVE_TITLE = "identidade, alvo, relógio ou diretório inseguro são rejeitados %s"

export const SHELL_NATIVE_CLOCK_FAILURE_TITLE = "falha nativa do relógio termina sem timestamp ou ACK falso"

export const SHELL_RUNTIME_CAUSAL_TITLE = "lease já ativa recebe EXIT antes dos dados foreground com background=%s"

export const SHELL_RUNTIME_SINK_DELAY_MS = 150
export const SHELL_RUNTIME_LARGE_CAUSAL_TITLE = "200 KB foreground com sink lento e background=%s"

export const SHELL_GENERATION_ISOLATION_TITLE = "filho de outra geração não herda canal de controle ou prova atual"
export const SHELL_GENERATION_COMMAND =
  "if (printf '\\005\\000\\000\\000' >&3) 2>/dev/null || (printf '\\005\\000\\000\\000' >&4) 2>/dev/null; then printf CHANNEL_LEAK; else printf ISOLATED; fi"

export const SHELL_PHASE_INJECTOR_SOURCE = "native-phase-injector.c"
export const SHELL_PHASE_WAIT_MS = 5000
export const SHELL_PHASE_JOIN_FAILED_TITLE = "keeper inteiro preserva JOIN recusado antes de usuário"

export const SHELL_PHASE_IDENTITY_FIELD_SEPARATOR = " "
export const SHELL_PHASE_LOST_ACK_TITLE = "ACK perdido depois do ESRCH não vira sucesso do keeper"
export const SHELL_PHASE_COMPILER_COMMAND = "cc"
export const SHELL_PHASE_MODE_CLOCK_ACK = "clock-ack"
export const SHELL_PHASE_MODE_CLOCK_FAILED = "clock-failed"
export const SHELL_PHASE_MODE_CLOCK_RUNNING = "clock-running"
export const SHELL_PHASE_MODE_CLOCK_STOP = "clock-stop"
export const SHELL_PHASE_DARWIN_LIBRARY_FLAG = "-dynamiclib"
export const SHELL_PHASE_MODE_ESRCH = "esrch"
export const SHELL_PHASE_DARWIN_LIBRARY_FILE = "injector.dylib"
export const SHELL_PHASE_MODE_JOIN_BLOCKED = "join-blocked"
export const SHELL_PHASE_RESERVATION_DEATH_TITLE = "JOIN bloqueado: morte da reserva não autoriza usuário"
export const SHELL_PHASE_SESSION_DEATH_TITLE = "JOIN bloqueado: morte da sessão não autoriza usuário"
export const SHELL_PHASE_JOIN_EOF_TITLE = "JOIN bloqueado: EOF não autoriza usuário"
export const SHELL_PHASE_JOIN_STOP_TITLE = "JOIN bloqueado: STOP não autoriza usuário"
export const SHELL_PHASE_MODE_JOIN_FAILURE = "join-failure"
export const SHELL_PHASE_JOIN_PCT_TITLE = "JOIN falho inteiro preserva P/C e adota T em estado terminal"
export const SHELL_PHASE_MARKER_LINE_SEPARATOR = "\n"
export const SHELL_PHASE_MARKER_TWO_COMMITS = "10 20\n10 20\n"
export const SHELL_PHASE_MARKER_DUPLICATE_TITLE = "duas linhas de ESRCH não equivalem a um único commit"
export const SHELL_PHASE_TEMPORARY_PREFIX = "native-phases-"
export const SHELL_PHASE_COMPILER_OUTPUT_FLAG = "-o"
export const SHELL_PHASE_MODE_OBSERVE = "observe"
export const SHELL_PHASE_USER_COMMAND = "printf FORBIDDEN"
export const SHELL_PHASE_CLOCK_FAULT_TITLE = "relógio falha fechado em %s pelo keeper inteiro"
export const SHELL_PHASE_MODE_SESSION_DEATH = "session-death"
export const SHELL_PHASE_STATUS_PRESSURE_TITLE = "status EAGAIN não bloqueia STOP e reap no keeper inteiro"
export const SHELL_PHASE_MODE_STATUS_PRESSURE = "status-pressure"
export const SHELL_PHASE_FRAGMENTED_STOP_TITLE = "STOP válido fragmentado na fronteira %s preserva cancelamento"

export const SHELL_PHASE_INCOMPLETE_DEADLINE_TITLE =
  "STOP parcial sem EOF aguarda apenas o prazo original e não publica tipo prematuro"

export const SHELL_PHASE_LINUX_BINARY = "launcher"
export const SHELL_PHASE_NATIVE_DIRECTORY = "../adapters/supervised-shell/unix/native"
export const SHELL_PHASE_NATIVE_SOURCES = ["main.c", "clock.c", "wire.c", "control.c", "child.c", "reservation.c"]
export const SHELL_PHASE_LINUX_COMPILE_FLAGS = ["-D_DEFAULT_SOURCE", "-D_POSIX_C_SOURCE=200809L", "-I"]
export const SHELL_PHASE_LINUX_WRAP = "-Wl,--wrap=setpgid,--wrap=read,--wrap=write,--wrap=kill,--wrap=clock_gettime"

export const UNIX_KEEPER_GROUP_WAIT_MS = 5000
export const UNIX_KEEPER_GROUP_RECHECK_MS = 20
export const UNIX_KEEPER_PS = "/bin/ps"
export const UNIX_KEEPER_PS_ARGUMENTS = ["-axo", "pgid="]
export const UNIX_KEEPER_PS_MAX_BYTES = 1048576
export const UNIX_KEEPER_GROUP_PATTERN_PREFIX = "(?:^|\\n)[ \\t]*"
export const UNIX_KEEPER_GROUP_PATTERN_SUFFIX = "[ \\t]*(?:\\n|$)"

export const SHELL_DIRECTORY_MODES = [0o777, 0o770, 0o750, 0o700]
export const SHELL_DIRECTORY_MODE_TITLE = "diretório de launcher aplica política 022 para modo %s"
export const SHELL_DIRECTORY_NON_DIRECTORY_TITLE = "diretório de launcher recusa %s"
export const SHELL_DIRECTORY_NON_DIRECTORY_KINDS = ["link", "file"]
