# Synapse

Synapse é um monólito modular de capacidades para o [pi](https://github.com/badlogic/pi-mono), distribuído como **Pi package**, com entrypoints em `pi.extensions`. Processos auxiliares atendem às necessidades das integrações sem transformar os módulos em serviços independentes.

## Capacidades

- **Memória:** observações do histórico (Observational Memory), consolidação em um vault Markdown e recuperação de conhecimento com proveniência. O núcleo independe do host.
- **pi-web:** interface para apresentar e operar o runtime do host pi.
- **Navegador:** operações de navegação, ações e verificação de resultados.

A composição conecta configuração e ciclo de vida; o pi mantém o loop do agente, as sessões e a compactação.

## Estado do projeto

O repositório contém a documentação, a base de qualidade do TypeScript (Biome) e a automação de revisão das PRs, sem código de produto. As capacidades descritas são contratos de construção, não funcionalidades disponíveis.

Para validar o código, rode `npm ci` e `npm run check`, que executa o Biome, o TypeScript estrito e os testes do Vitest.

A primeira base de produto precisa definir runtime, versão suportada do pi e ferramentas de execução.

## Documentação

- [Arquitetura](docs/architecture.md): composição, fronteiras, interfaces e responsabilidade pelos dados.
- [Mensageria entre sessões do Pi](docs/mensageria.md) — proposta do MVP.
- [Memória](docs/memory.md): observação, cobertura, consolidação, vault e Recall.
- [Legibilidade](docs/standards/legibilidade.md): regras de legibilidade do código.
- [Tipagem](docs/standards/tipagem.md): regras de tipagem do TypeScript.
- [Revisão automática](.github/pr-review/README.md): o revisor de PR que cobre o que o Biome não vê.
- [AGENTS.md](AGENTS.md): instruções para agentes que trabalham no repositório, distintas dos prompts dos modelos do runtime.
