/** Arquivos em dist/ são gerados a partir de src/ pelo compilador TypeScript. Não edite a distribuição diretamente. */
import { compose } from "./composition";
import { type AdvisorHost, registerAdvisor } from "./integration";

export default function registerSynapse(pi: AdvisorHost): void {
  const composition = compose();
  registerAdvisor(pi, composition.advisor, composition.signal, composition.shutdown);
}
