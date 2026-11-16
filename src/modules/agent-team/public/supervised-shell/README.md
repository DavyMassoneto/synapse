# Shell supervisionada

O supervisor mantém o keeper e o grupo registrado de cada shell até o encerramento explícito do lease. O comando e os argumentos da shell não recebem prefixos de controle. A autorização ocorre antes de iniciar o código do usuário.

## Diferenças observáveis aceitas pelo lead

Os resíduos descritos nesta seção foram aceitos pelo lead; isso não constitui aprovação do dono nem alegação de paridade integral.

Depois da saída do líder, o leitor segue a tolerância observável do bash nativo: espera o EOF real dos pipes ou um intervalo ocioso de 100 ms, rearmado a cada DATA. A conclusão também exige a aceitação pelo sink dos bytes já lidos e de todas as escritas em voo; leitor pausado ou sink lento não antecipam essa aceitação. Sem processos segurando os pipes, o EOF observado é causal. Com processos em segundo plano mantendo-os abertos, o intervalo ocioso permite entregar o resultado sem esperar esses processos. Isso é paridade com a tolerância do nativo, não uma barreira de kernel nem garantia de capturar dados que só chegarem depois desse intervalo. O grupo e os pipes continuam sob propriedade do lease para o encerramento explícito.

A inicialização do keeper pode acrescentar aproximadamente 0,2 segundo ao `wall_time_seconds`; esse campo mede o tempo real e não é corrigido artificialmente.

A propriedade de um grupo registrado não contém descendentes que criem outro grupo ou sessão. Serviços preexistentes não pertencem ao supervisor. Encerrar processos não desfaz efeitos externos já enviados.

## Distribuição

O keeper é TypeScript e usa a API pública `jiti/register`, com Jiti como dependência runtime direta e fixada. Não exige build manual. O host fornece os peers do pi. TypeBox 1.3.27 é também dependência runtime direta e fixada no lock para o keeper isolado, com contrato peer compatível ^1.3.27 para o carregamento na extensão; o loader da extensão preserva a identidade TypeBox do host. No Windows, o launcher distribuído usa `powershell.exe` (Windows PowerShell 5.1, .NET Framework e compilador C# 5), não `pwsh`, e Add-Type para compilar o C# tipado em runtime. As fontes mantêm sintaxe C# 5, delegados com corpo explícito nos pontos sobrecarregados de Task.Run e APIs disponíveis no .NET Framework 4.5; compilação local no PowerShell 7 não comprova compatibilidade com esse runtime. Depende desses componentes do Windows e das políticas de execução existentes; não usa ExecutionPolicy Bypass nem taskkill. Cria a shell suspensa, associa o Job Object antes do resume e encerra pelo handle. A execução do adapter completo e sua equivalência exigem o CI Windows; a prova mínima da #79 e a prova Unix no macOS não as substituem.

No Unix, o launcher é obtido automaticamente de uma release versionada deste repositório, com SHA256 fixado tanto para o gzip quanto para o executável extraído. O cache é privado e a publicação é atômica; um vencedor concorrente também é verificado. O download tem teto de 4 MiB, a extração de 8 MiB e a tentativa de provisionamento de 30 segundos, com probe limitado a 5 segundos. Não há compilação no computador do usuário nem requisito de Perl. A fonte C e o script de build local ficam junto do adapter Unix; os builds Linux são estáticos via Zig fixado e o build Darwin é universal com assinatura ad-hoc.

## Preparação, resultado e encerramento

A preparação tem orçamento operacional próprio de 15 segundos para inicialização fria do Node/Jiti ou compilação Add-Type, inclusive sob contenção de CPU/IO. Esse limite só cobre o handshake antes de CREATED: não limita um comando normal. Abort e parada do supervisor alcançam essa preparação por sinal desde a admissão. O prazo solicitado pelo usuário começa imediatamente antes do release, quando o shell pode executar código; a inicialização do keeper não consome esse prazo.

No Unix, S é o keeper Node líder de sessão; R é o launcher C, cujo PID reserva o identificador do grupo G. A shell entra em G e confirma o join antes de R sair para o grupo de S e publicar a preparação. R permanece vivo fora de G e é o único emissor dos sinais: repete kill(-getpid(), SIGKILL) e recolhe a shell até receber ESRCH. EPERM não é sucesso. O pai só envia controle, nunca sinaliza PID ou PGID histórico. A prova é o ACK de ESRCH mais o fechamento esperado; perder R, faltar o ACK ou expirar o prazo deixa quarentena. Antes do release, a revogação fecha o gate sem executar código do usuário.

O encerramento tem orçamento absoluto de 5 segundos, contado desde o pedido no pai e encaminhado sem reinício ao launcher. Falha local ou EOF sem pedido anterior inicia um prazo local único; um prazo posterior só pode reduzi-lo. A comparação temporal é refeita antes de promover ACK e close, mesmo se o timer do event loop ainda não rodou. O relógio corresponde ao hrtime do Node: CLOCK_MONOTONIC no Linux e mach_continuous_time no macOS. No Linux, suspensão do host não conta como tempo de runtime. Esgotar o orçamento rejeita a parada e deixa ownership em quarentena; não equivale a provar término. Nenhum sinal é enviado depois do primeiro ESRCH, inclusive se a entrega do ACK falhar.

Preparação, resultado e ownership são resultados distintos. O resultado normal do líder, após a drenagem descrita acima (EOF ou ocioso de 100 ms, mais a aceitação do sink), não espera os processos em segundo plano. Essa condição de conclusão não é uma fence de kernel. O resultado sintético de interrupção só é entregue depois do mesmo sucesso de encerramento: falha de confirmação ou falta do ACK de Job vazio permanece observável. EOF abaixo da fence, erro do pipe ou rejeição do sink rejeitam o resultado mesmo durante parada. Um sink ainda em voo quando ownership termina é cancelado logicamente como falha, nunca contado como bytes entregues; uma resolução tardia não reabre o resultado.

## Requisitos por sistema operacional

| Sistema | Execução e confirmação | Recusa observável |
| --- | --- | --- |
| macOS | Keeper TypeScript pelo jiti e launcher C universal arm64/x64 assinado ad-hoc; prova ESRCH pelo reservador | Launcher ausente é provisionado; hash, identidade ou relógio incorretos são recusados antes do usuário |
| Linux | Keeper TypeScript pelo jiti e launcher C estático musl x64/arm64; prova ESRCH pelo reservador | Arquitetura sem asset, download indisponível ou launcher inválido são recusados antes do usuário |
| Windows | powershell.exe 5.1; compilação Add-Type; processo suspenso associado ao Job Object antes do resume | Criação executa probe real de Add-Type e recusa executável ausente/inacessível ou compilação indisponível |
| Outros | Não implementado | Montagem recusa explicitamente a plataforma |

Quando o probe recusa a criação, o erro inclui code, signal, killed e até 2048 bytes UTF-8 de cada stdout e stderr, sem cortar um caractere no meio. Essa saída não é saneada nem redigida: chega ao contexto local do modelo, como a saída do bash nativo, e pode conter caminhos ou outros dados emitidos pelo subprocesso. Isso não publica a saída em issues, PRs ou comentários; qualquer publicação exige revisão de dados pessoais separada. O diagnóstico não inclui error.message, que pode repetir o comando completo.

O probe Windows compila uma classe mínima no mesmo powershell.exe e sob as mesmas políticas de execução, sem bypass. Ele não presume que Get-Command sozinho prove compilação disponível. Os limites operacionais de preparação/encerramento não são prova de término: erro mantém ownership incerto em quarentena. O handle preparado é registrado na admissão antes da espera de readiness. Admissões só são retiradas do registro após terminate resolver com ownership comprovado, ou se a criação falhou antes de existir um handle. Uma falha de preparação com cleanup confirmado também pode ser retirada, sem transformar o erro do resultado em sucesso. Resultado foreground não retira processos em segundo plano; falhas ou timeout de ownership ficam guardados na admissão e são denunciados em stops posteriores sem repetir sinais.
