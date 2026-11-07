# Synapse

Synapse é um monólito modular de capacidades para o [pi](https://github.com/badlogic/pi-mono), distribuído como **Pi package**, com entrypoints em `pi.extensions`. Processos auxiliares atendem às necessidades das integrações sem transformar os módulos em serviços independentes.

## Capacidades

- **Advisor:** consulta um modelo revisor e lembra o agente de consultá-lo. Veja [configuração](src/modules/advisor/README.md).
- **Memória:** observações do histórico (Observational Memory), consolidação em um vault Markdown e recuperação de conhecimento com proveniência. O núcleo independe do host.
- **pi-web:** interface para apresentar e operar o runtime do host pi.
- **Navegador:** operações de navegação, ações e verificação de resultados.

A composição conecta configuração e ciclo de vida; o pi mantém o loop do agente, as sessões e a compactação.

## Estado do projeto

O módulo advisor está disponível; memória, pi-web e navegador continuam como contratos de construção. A integração foi verificada com pi 1.5.0. Instale localmente com `pi install ./` e não carregue outra extensão advisor simultaneamente.

## Desenvolvimento

O desenvolvimento foi verificado com Node.js 24. Execute `npm ci --include=dev` para instalar dependências e `npm run validate` para verificar Biome, tipos, compilação e testes Vitest. Após alterar os fontes, `npm run build` compila CommonJS e seu manifesto em `dist/`, preservando imports relativos de diretórios para carregamento pelo Pi.

## Documentação

- [Arquitetura](docs/architecture.md): composição, fronteiras, interfaces e responsabilidade pelos dados.
- [Memória](docs/memory.md): observação, cobertura, consolidação, vault e Recall.
- [AGENTS.md](AGENTS.md): instruções para agentes que trabalham no repositório, distintas dos prompts dos modelos do runtime.
