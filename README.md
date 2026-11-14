# Synapse

Synapse é um monólito modular de capacidades para o [pi](https://github.com/badlogic/pi-mono), distribuído como **Pi package**, com entrypoints em `pi.extensions`. Processos auxiliares atendem às necessidades das integrações sem transformar os módulos em serviços independentes.

## Capacidades

- **Advisor:** consulta um modelo revisor e lembra o agente de consultá-lo. Veja [configuração](src/modules/advisor/README.md).
- **Memória:** observações do histórico (Observational Memory), consolidação em um vault Markdown e recuperação de conhecimento com proveniência. O núcleo independe do host.
- **pi-web:** interface para apresentar e operar o runtime do host pi.
- **Navegador:** operações de navegação, ações e verificação de resultados.

A composição conecta configuração e ciclo de vida; o pi mantém o loop do agente, as sessões e a compactação.

## Estado do projeto

O módulo advisor está disponível; memória, pi-web e navegador continuam como contratos de construção. O pacote carrega as fontes TypeScript pelo loader do pi, sem compilação manual nem dependências de desenvolvimento. Instale pelo Git com `pi install git:github.com/DavyMassoneto/synapse` ou, no diretório do pacote, com `pi install ./`. Não carregue outra extensão advisor simultaneamente.

## Desenvolvimento

O desenvolvimento foi verificado com Node.js 24. Execute `npm ci` para instalar as dependências e `npm run validate` para executar Biome, verificação de tipos, build e testes Vitest. `npm run format` aplica as correções seguras do Biome. `npm run build` continua produzindo a árvore CommonJS em `dist/` e deriva o manifesto JavaScript do manifesto das fontes, preservando os imports de diretório. A instalação pelo pi usa `src/entry.ts`, sem depender de `dist/`.

## Documentação

- [Arquitetura](docs/architecture.md): composição, fronteiras, interfaces e responsabilidade pelos dados.
- [Mensageria entre sessões do Pi](docs/mensageria.md) — proposta do MVP.
- [Memória](docs/memory.md): observação, cobertura, consolidação, vault e Recall.
- [Legibilidade](docs/standards/legibilidade.md): regras de legibilidade do código.
- [Tipagem](docs/standards/tipagem.md): regras de tipagem do TypeScript.
- [AGENTS.md](AGENTS.md): instruções para agentes que trabalham no repositório, distintas dos prompts dos modelos do runtime.
