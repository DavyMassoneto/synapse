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

A instalação pelo Git exige `git` e `npm` no `PATH`. Instale sem `@ref` para seguir a `main`: com `@main`, uma tag ou um commit, o pacote fica fixado nesse ref e não recebe atualizações. Ao abrir o pi no modo interativo, um aviso indica quando há atualização do pacote; aplique-a com `pi update --extensions` ou `pi update git:github.com/DavyMassoneto/synapse`. `pi update` sem alvo atualiza o próprio pi, não o pacote.

## Desenvolvimento

O desenvolvimento foi verificado com Node.js 24. Execute `npm ci` para instalar as dependências e `npm run validate` para executar Biome, verificação de tipos, build e testes Vitest. `npm run format` aplica as correções seguras do Biome. `npm run build` continua produzindo a árvore CommonJS em `dist/` e deriva o manifesto JavaScript do manifesto das fontes, preservando os imports de diretório. A instalação pelo pi usa as sete entradas TypeScript de `src/extensions/`, sem depender de `dist/`.

Cada capacidade aparece separadamente em `pi config` e na listagem de extensões: advisor, cooldown-retry, response-rules, model-router, agent-team, iphone e computer-use. Desativar uma entrada não desativa as outras. Os membros carregam extensões pela configuração persistida do pi, respeitando o trust do projeto do lead. A resolução é refeita em cada abertura, restauração e reload; não há protocolo de presença nem injeção manual de capacidades. Essa paridade não inclui overrides de CLI do lead, como `-e` ou `--no-extensions`. Em `agent-team.json`, `excludedMemberExtensions` é a única lista de caminhos excluídos do membro, aplicada antes de importar extensões. Caminhos relativos são resolvidos a partir do diretório de agente do pi; a comparação usa o caminho real (sem distinguir caixa no Windows). Não existem exclusões implícitas: para evitar carregar outra equipe ou capacidades de aparelhos, inclua explicitamente os caminhos de agent-team, iphone e computer-use nessa lista. Uma configuração inválida é recusada antes de qualquer carregamento. Sem model-router configurado e habilitado no membro, `jev/auto` não é disponibilizado.

## Documentação

- [Arquitetura](docs/architecture.md): composição, fronteiras, interfaces e responsabilidade pelos dados.
- [Mensageria entre sessões do Pi](docs/mensageria.md) — proposta do MVP.
- [Memória](docs/memory.md): observação, cobertura, consolidação, vault e Recall.
- [Legibilidade](docs/standards/legibilidade.md): regras de legibilidade do código.
- [Tipagem](docs/standards/tipagem.md): regras de tipagem do TypeScript.
- [AGENTS.md](AGENTS.md): instruções para agentes que trabalham no repositório, distintas dos prompts dos modelos do runtime.

## Watchdog da equipe de agentes

O turno de um membro sem atualização real por 10 minutos recebe um pedido de interrupção e de parada imediata de todas as suas shells supervisionadas. O lead é avisado no vencimento e recebe a confirmação ou a indicação de parada não confirmada. Eventos reais do modelo e progresso de ferramentas renovam o prazo; consultar agentes, consultar tarefas e trocar mensagens de coordenação não o renovam. O relógio é monotônico, e callbacks de execuções antigas não afetam uma execução nova. O watchdog não conclui nem reatribui tarefas.

Os membros continuam em sessões do SDK no mesmo processo do lead, com o mesmo carregamento de extensões. O cancelamento alcança o loop e as shells supervisionadas pelo lifetime já existente. Uma ferramenta de extensão que ignore o AbortSignal ou bloqueie de forma síncrona fica fora do alcance: nesse caso não há garantia de interrupção imediata no processo compartilhado, e a ausência de confirmação é comunicada ao lead.
