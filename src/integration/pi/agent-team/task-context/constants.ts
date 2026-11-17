export const TEAM_EXECUTION_SECTION = "agent_team_execution"

export const TEAM_EXECUTION_HEADER = "Tarefa selecionada para organização; não é permissão nem obrigação por comando:\n"

export const TEAM_EXECUTION_NONE =
  "Nenhuma tarefa selecionada no quadro. Ferramentas e comandos são livres, sem obrigação de vínculo por comando."

export const TEAM_EXECUTION_INSTRUCTIONS =
  "claim inicia tarefa pendente pronta e seleciona para quem chama; resume seleciona tarefa própria em andamento, inclusive após reload. reassign só reserva responsável, mesmo bloqueada, e não seleciona tarefa. Ferramentas e comandos não exigem tarefa selecionada; mudanças de tarefa não cancelam execução. Fim de turno não conclui tarefa: use complete explicitamente. Reload restaura quadro e membros parados, sem inferir seleção ou retomar trabalho pelo responsável."
