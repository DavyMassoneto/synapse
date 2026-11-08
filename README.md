# Synapse

Synapse é um monólito modular de capacidades para o [pi](https://github.com/badlogic/pi-mono), distribuído como **Pi package**, com entrypoints em `pi.extensions`. Processos auxiliares atendem às necessidades das integrações sem transformar os módulos em serviços independentes.

## Capacidades

- **Memória:** observações do histórico (Observational Memory), consolidação em um vault Markdown e recuperação de conhecimento com proveniência. O núcleo independe do host.
- **pi-web:** interface para apresentar e operar o runtime do host pi.
- **Navegador:** operações de navegação, ações e verificação de resultados.

A composição conecta configuração e ciclo de vida; o pi mantém o loop do agente, as sessões e a compactação.

## Estado do projeto

O repositório contém documentação, sem código de produto, manifesto, toolchain ou testes. As capacidades descritas são contratos de construção, não funcionalidades disponíveis. Ainda não existem comandos de instalação, execução, build ou teste.

A primeira base precisa definir runtime, versão suportada do pi e ferramentas de desenvolvimento.

## Documentação

- [Arquitetura](docs/architecture.md): composição, fronteiras, interfaces e responsabilidade pelos dados.
- [Mensageria entre sessões do Pi](docs/mensageria.md) — proposta do MVP.
- [Memória](docs/memory.md): observação, cobertura, consolidação, vault e Recall.
- [Legibilidade](docs/standards/legibilidade.md): regras de legibilidade do código.
- [AGENTS.md](AGENTS.md): instruções para agentes que trabalham no repositório, distintas dos prompts dos modelos do runtime.
