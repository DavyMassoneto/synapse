# Regras de entrega (a PR como um todo)

Cada regra abaixo tem dono único. Registre apenas o que a definição inclui. Os defeitos desta lista pertencem à PR, então use `line` 0 e o caminho do arquivo ou "PR".

- **E01 DESCRICAO_FALSA.** Afirmação da descrição que o código não sustenta ("separado por responsabilidade", "sem ciclos", "os testes cobrem", "validado no Windows", "sem contornos", contagens que não batem), ou validação citada que não pode ter sido feita com esses arquivos.
- **E02 ESCOPO.** Ferramenta, dependência, script, workflow, variável de ambiente, alias, fluxo ou pré-requisito que o pedido não exigiu; arquivo gerado ou de apoio versionado sem necessidade; mudança que a descrição não menciona.
- **E03 DECISAO_DO_DONO.** Mudança em docs/architecture.md, AGENTS.md, docs/standards/, biome.json, biome/*.grit, tsconfig.json, CODEOWNERS ou nos workflows, e regra do Biome ou do compilador enfraquecida, removida ou com exceção nova. Decisão do dono: vale como violação mesmo que a mudança pareça razoável, a menos que a descrição diga que o dono pediu.
- **E04 PELA_METADE.** Parte do que a descrição promete faltando, TODO, arquivo gerado desatualizado, regra aplicada em alguns arquivos e esquecida nos vizinhos, comentário de revisão respondido com "mantido com justificativa" em vez de corrigido.
- **E05 DESCRICAO_DA_PR.** A descrição cita outras PRs, depende de contexto fora dela, é genérica e não diz o que mudou e o que foi validado, ou está desatualizada em relação aos arquivos.
- **E06 INSTALACAO.** O que a PR entrega não funciona a partir do repositório limpo, no Windows e no macOS: script que só roda em um sistema, dependência faltando no manifesto, arquivo gerado necessário e não versionado ou versionado sem verificação.
