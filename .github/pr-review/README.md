# Revisão automática de PR

Um único revisor lê cada PR de `DavyMassoneto`, `rafaeleduardo381` e `SergioTavares278` aberta de uma branch do próprio repositório e publica um relatório só. Ele cobre o que o Biome e o compilador não veem e lê o código inteiro dos arquivos da PR, não só o diff.

## Como a revisão funciona

1. Cada arquivo da PR vai ao modelo inteiro, com número de linha e a coluna `+` nas linhas alteradas, junto com o título, a descrição, a árvore do repositório e os arquivos apagados.
2. O modelo avalia as 29 regras de `prompts/rules/` (`C` código, `D` desenho, `E` entrega), cada defeito com uma única regra dona, e devolve todas na lista `coverage` como prova de que avaliou cada uma. Resposta sem a lista completa é descartada e pedida de novo.
3. Depois da primeira resposta, o revisor pergunta de novo, com o histórico, até uma rodada não trazer nenhum achado novo. Não há limite de achados por resposta nem amostragem. Se as rodadas acabam antes disso, a revisão é marcada como incompleta.
4. Os achados são acumulados sem repetição na mesma conversa, com todos os arquivos no contexto. Achados da mesma linha viram um comentário só, com um item por regra.

## Publicação

- Um resumo na PR, com o veredito, a contagem por regra, as notas de revisão incompleta, os achados da PR inteira e os achados fora das linhas comentáveis do diff.
- Um comentário de linha por linha do diff com defeito, em uma revisão só.
- O veredito `ATENÇÃO` faz o job `review` falhar, inclusive quando a revisão fica incompleta.

## Contexto

Da `main` o revisor recebe o `AGENTS.md`, `docs/architecture.md`, `docs/standards/`, `tsconfig.json` e a configuração do Biome, então a PR não consegue enfraquecer o contexto que a revisa. Os prompts e o código vêm do checkout da PR e só mudam com a aprovação do dono, por `CODEOWNERS`.

## Desenvolvimento

- `npm run check` roda o Biome, o TypeScript estrito e os testes do Vitest, os mesmos do job `check`.
- Segredo do CI: `OMNIROUTE_API_KEY`.
- Para mudar uma regra, edite `prompts/rules/`; o formato da resposta está em `prompts/format.md`.
