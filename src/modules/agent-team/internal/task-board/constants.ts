export const TASK_ID_PREFIX = "task-"

export const TASK_BOARD_MAX_TASKS = 256

export const TASK_BOARD_MAX_SUBJECT_LENGTH = 200

export const TASK_BOARD_MAX_DESCRIPTION_LENGTH = 16_384

export const TASK_BOARD_SCOPE_SEPARATOR = "/"

export const TASK_BOARD_PARENT_SEGMENT = ".."

export const TASK_BOARD_LEADING_DOT_SLASH = /^(?:\.\/)+/

export const TASK_BOARD_TRAILING_SLASHES = /\/+$/

export const TASK_BOARD_OVERLAP_WARNING = "os escopos de escrita se sobrepõem aos da tarefa "

export const TASK_BOARD_UNKNOWN_TASK = "Tarefa inexistente: "

export const TASK_LIMIT = "O quadro atingiu o limite de tarefas ativas: "

export const TASK_BOARD_STALE_REVISION = "Revisão desatualizada; a revisão atual da tarefa é "

export const TASK_BOARD_DELETED_MESSAGE = "A tarefa foi apagada"

export const TASK_BOARD_UNAUTHORIZED = "Só o responsável pela tarefa ou o lead pode fazer essa mudança"

export const TASK_BOARD_LEAD_REQUIRED = "Só o lead pode reatribuir tarefas"

export const TASK_BOARD_ALREADY_CLAIMED = "A tarefa já pertence ao agente "

export const TASK_BOARD_NOT_READY =
  "A tarefa não está pronta para assumir: precisa estar pendente e com os bloqueios concluídos"

export const TASK_BOARD_NOT_IN_PROGRESS = "A ação exige uma tarefa em andamento"

export const TASK_BOARD_NOT_COMPLETED = "Só uma tarefa concluída pode ser reaberta"

export const TASK_BOARD_NOT_REASSIGNABLE = "Só uma tarefa pendente ou em andamento pode ser reatribuída"

export const TASK_BOARD_BLOCKED = "A tarefa ainda tem bloqueios não concluídos"

export const TASK_BOARD_UNKNOWN_OWNER = "O agente não existe nesta equipe: "

export const TASK_BOARD_EDIT_WITHOUT_FIELDS = "edit exige subject, description ou write_scopes"

export const TASK_BOARD_DEPENDENCIES_REQUIRED = "set_dependencies exige blocked_by"

export const TASK_BOARD_HAS_DEPENDENTS = "A tarefa ainda bloqueia a tarefa "

export const TASK_BOARD_UNKNOWN_ACTION = "Ação desconhecida: "

export const TASK_BOARD_SELF_BLOCK = "Uma tarefa não pode bloquear a si mesma"

export const TASK_BOARD_DUPLICATE_BLOCKER = "Bloqueio repetido: "

export const TASK_BOARD_UNKNOWN_BLOCKER = "Tarefa de bloqueio inexistente ou apagada: "

export const TASK_BOARD_DEPENDENCY_CYCLE = "A dependência forma um ciclo com a tarefa "

export const TASK_BOARD_EMPTY_TEXT = "O texto não pode ficar vazio"

export const TASK_BOARD_TEXT_TOO_LONG = "O texto passa do limite de caracteres: "

export const TASK_BOARD_INVALID_SCOPE = "Escopo de escrita inválido (use caminho relativo ao projeto, sem ..): "

export const TASK_BOARD_INITIAL_REVISION = 1

export const TASK_BOARD_FIRST_NUMBER = 1

export const TASK_BOARD_BACKSLASHES = /\\/g

export const TASK_BOARD_DRIVE_PREFIX = /^[a-zA-Z]:/
