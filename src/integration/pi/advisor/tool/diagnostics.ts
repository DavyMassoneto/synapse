export const MODEL_DIAGNOSTICS = {
  invalidReference: "Referência de modelo advisor inválida.",
  capabilitiesChanged: "As capacidades do modelo advisor mudaram durante a consulta.",
  emptyResponse: "advisor returned no text",
};

export function modelNotFound(reference: string): string {
  return `Modelo advisor não encontrado: ${reference}`;
}

export function credentialsMissing(reference: string): string {
  return `Credenciais ausentes para ${reference}`;
}

export function advisorUnavailable(message: string): string {
  return `Advisor indisponível: ${message}.`;
}
