export const ADVISOR_MESSAGES = {
  title: "Modelo advisor",
  renderPending: "consultando...",
  renderSuccess: "✓ conselho",
  renderTitle: "advisor ",
  disabledOption: "(sem advisor)",
  disabled: "Advisor desligado",
  progress: "Consultando advisor...",
  cancelled: "Consulta ao advisor cancelada.",
  ambiguousModel: "Mais de um modelo corresponde; informe uma referência mais específica.",
  commandDescription: "Escolhe o modelo advisor ou o nível de raciocínio",
};

export function modelStatus(model: string): string {
  return `Advisor: ${model}`;
}

export function thinkingStatus(level: string): string {
  return `Advisor thinking: ${level}`;
}

export function currentStatus(model: string | undefined, thinking: string): string {
  return `Advisor: ${model ?? "desligado"}, thinking ${thinking}`;
}

export function noMatchingModel(input: string): string {
  return `Nenhum modelo encontrado: ${input}`;
}

export function additionalLines(count: number): string {
  return `... (${count} linhas a mais)`;
}
