# Regras do dono

Imports e barrels
1. Import nunca leva extensão nem `index` no caminho.
2. Mesma pasta: caminho do arquivo (`./types`). Pasta filha ou vizinha: caminho relativo para a pasta, pelo barrel dela (`./command`, `../contracts`). `../../` é proibido. Arquivo de outra pasta nunca é importado por caminho.
3. Mais longe: alias `#synapse/` até o barrel mais alto que não gere ciclo. De `src/controller/componente2/subcomponente/` para `componente`, o import é `#synapse/controller/componente`, porque `#synapse/controller` reexporta `componente2`, que reexporta `subcomponente`. Alias para pasta vizinha ou filha está errado.
4. Importar o barrel de uma pasta acima do arquivo que ele reexporta é ciclo; ciclo de tipo também é ciclo.
5. Toda pasta de código tem um `index.ts` com só `export * from "./x"` ou `export { default as X } from "./x"`, a partir da pasta atual, sem extensão. Subpasta entra pelo barrel dela.
6. Tipo e valor do mesmo módulo ficam no mesmo import, com `type` inline.

Separação
7. Constantes, textos, números mágicos, literais de identificação, estilos e schemas nunca ficam misturados com código: cada um em arquivo próprio. Tipos ficam separados da implementação. Tipagem inline é proibida.
8. Função não divide arquivo com classe. Mover a função para dentro da classe como `static`, ou para um objeto, só para escapar disso é contorno.
9. Cada arquivo tem uma responsabilidade. Arquivo grande e pasta com muitos arquivos soltos são defeito; a pasta se divide em subpastas por responsabilidade.
10. Predicado (função que devolve booleano) começa com `is` ou `has` e fica em arquivo próprio, separado da lógica.

Proibições
11. Proibidos: `any`, `unknown`, type assertions, casts, `as const`, `Record`, `satisfies` e qualquer contorno deles (`Object.freeze`, helper que afirma tipo sem validar).
12. Proibidos: comentário no código, valor padrão e fallback sem justificativa, `biome-ignore`, `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`.

Funções
13. Sem função desnecessária: type guard trivial, predicado trivial, função que só devolve um texto ou template, método que só repassa a chamada.
14. Funções pequenas; função complexa vira micro funções. Função dentro de função é proibida.
15. Ternário só em expressão muito pequena; o resto é `if` explícito com chaves em linhas próprias.

Método
16. SRP, DRY, YAGNI e Clean Code em todo o código, sem esperar apontamento. Nada pela metade. Nada além do pedido: não adicionar ferramentas, fluxos ou pré-requisitos, nem trocar convenção, arquitetura ou decisão do dono sem autorização. Mudar docs/architecture.md, AGENTS.md, docs/standards/, biome.json, tsconfig.json ou os workflows para o código caber é decisão do dono.
17. Testes em TypeScript com Vitest, usando `expect` (nunca o `assert` do Node), um cenário por teste, fixtures compartilhadas num arquivo de apoio.
18. Descrição de PR é agnóstica: não cita outras PRs, diz o que mudou e o que foi validado, sem afirmar o que não foi feito.

O Biome já barra, em cada arquivo, o que uma regra do `biome.json` e dos `biome/*.grit` consegue ver numa única expressão. Você os recebe no contexto para conhecer a fronteira. Registre uma violação desse tipo só quando o código a contorna.
