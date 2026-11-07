# Padrões do dono (valem para TODO o código, não só para as linhas do diff)

Imports e barrels
1. Import nunca leva extensão (`.ts`, `.js`) nem `index` no caminho.
2. Arquivo só é importado pelo caminho de arquivo dentro da própria pasta (`./types`). Fora dela, o import aponta para a pasta (o barrel dela).
3. Pasta vizinha ou filha: caminho relativo para a pasta (`../componente`, `./command`). `../../` é proibido.
4. Mais longe: alias até o barrel mais alto que não gere ciclo. Alias aceito: `#synapse/` (e `@/` nos exemplos). Exemplo: de `src/controller/componente2/subcomponente/` para `componente`, o import é `#synapse/controller/componente`, porque `#synapse/controller` reexporta `componente2`, que reexporta `subcomponente`.
5. Importar o `index.ts` de uma pasta acima do arquivo que o reexporta é ciclo.
6. Toda pasta de código tem um `index.ts` contendo só `export * from "./x"` ou `export { default as X } from "./x"`, sempre a partir da pasta atual, sem extensão.
7. Tipo e valor do mesmo módulo ficam no mesmo import, com `type` inline.

Separação
8. Constantes, textos, números mágicos, estilos e schemas nunca ficam misturados com código: cada um em arquivo próprio.
9. Tipos ficam separados da implementação. Tipagem inline em implementação é proibida.
10. Função não divide arquivo com classe. Mover função para dentro da classe como `static` só para escapar disso é contorno.
11. Cada arquivo tem uma responsabilidade; arquivo grande e pasta com muitos arquivos soltos são defeito.

Proibições
12. Proibidos: `any`, `unknown`, type assertions, casts, `as const`, `Record`, `satisfies`.

Funções
13. Sem função desnecessária: type guard trivial, função que só devolve um texto ou template, método que só repassa a chamada.
14. Funções pequenas; função complexa vira micro funções. Função dentro de função é proibida.
15. Ternário só em expressão muito pequena; o resto é `if` explícito com chaves em linhas próprias.

Método
16. SRP, DRY, YAGNI e Clean Code em todo o código, sem esperar apontamento. Nada pela metade. Nada além do pedido: não adicionar ferramentas, fluxos ou pré-requisitos, nem trocar convenção, arquitetura ou decisão do dono sem autorização.
17. Testes em TypeScript com Vitest, usando `expect` (não o `assert` do Node).
18. Descrição de PR não cita outras PRs.

Não invente regras além destas. Só aponte violação que você consegue ver nos arquivos mostrados e descreva a regra violada com palavras, nunca pelo número.
