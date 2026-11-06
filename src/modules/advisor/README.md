# Advisor

Após instalar as dependências de desenvolvimento, execute `npm run typecheck` e `npm run build`. O build atualiza `dist/index.js`, distribuído para que o Pi carregue o pacote sem compilação na instalação.

A ferramenta sem parâmetros consulta um modelo revisor sem ferramentas; o comando /advisor escolhe o modelo, /advisor off desliga e /advisor thinking <nível> altera o raciocínio. A configuração compatível fica em ~/.pi/agent/advisor.json.

O histórico do ramo ativo e o prompt são enviados ao provedor do modelo configurado. Resultados longos e mensagens antigas podem ser omitidos para caber na janela; imagens são omitidas. Não carregue simultaneamente a extensão advisor instalada separadamente.
