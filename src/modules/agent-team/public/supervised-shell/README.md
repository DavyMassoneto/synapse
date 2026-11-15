# Shell supervisionada

O supervisor mantém o keeper e o grupo registrado de cada shell até o encerramento explícito do lease. O comando e os argumentos da shell não recebem prefixos de controle. A autorização ocorre antes de iniciar o código do usuário.

## Diferenças observáveis aceitas pelo lead

Os resíduos descritos nesta seção foram aceitos pelo lead; isso não constitui aprovação do dono nem alegação de paridade integral.

O resultado da ferramenta é produzido quando o líder da shell sai e a saída foreground já aceita pelo leitor e as escritas em voo foram drenadas. Saída escrita por processos em segundo plano depois desse ponto não é capturada no resultado. O grupo e os pipes continuam sob propriedade do lease para que o supervisor possa encerrá-los. Não se reproduz o intervalo privado de tolerância a stdio do SDK.

A inicialização do keeper pode acrescentar aproximadamente 0,2 segundo ao `wall_time_seconds`; esse campo mede o tempo real e não é corrigido artificialmente.

A propriedade de um grupo registrado não contém descendentes que criem outro grupo ou sessão. Serviços preexistentes não pertencem ao supervisor. Encerrar processos não desfaz efeitos externos já enviados.

## Distribuição

O keeper é TypeScript e usa a API pública `jiti/register`, com Jiti como dependência runtime direta e fixada. Não exige build manual. O host fornece os peers do pi. TypeBox 1.3.27 é também dependência runtime direta e fixada no lock para o keeper isolado, com contrato peer compatível ^1.3.27 para o carregamento na extensão; o loader da extensão preserva a identidade TypeBox do host. No Windows, o launcher distribuído usa `powershell.exe` (Windows PowerShell 5.1, .NET Framework e compilador C# 5), não `pwsh`, e Add-Type para compilar o C# tipado em runtime. As fontes mantêm sintaxe C# 5, delegados com corpo explícito nos pontos sobrecarregados de Task.Run e APIs disponíveis no .NET Framework 4.5; compilação local no PowerShell 7 não comprova compatibilidade com esse runtime. Depende desses componentes do Windows e das políticas de execução existentes; não usa ExecutionPolicy Bypass nem taskkill. Cria a shell suspensa, associa o Job Object antes do resume e encerra pelo handle. A execução do adapter completo e sua equivalência exigem o CI Windows; a prova mínima da #79 e a prova Unix no macOS não as substituem.

## Preparação, resultado e encerramento

A preparação tem orçamento operacional próprio de 15 segundos para inicialização fria do Node/Jiti ou compilação Add-Type, inclusive sob contenção de CPU/IO. Esse limite só cobre o handshake antes de CREATED: não limita um comando normal. Abort e parada do supervisor alcançam essa preparação por sinal desde a admissão. O prazo solicitado pelo usuário começa imediatamente antes do release, quando o shell pode executar código; a inicialização do keeper não consome esse prazo.

O encerramento tem orçamento operacional de 5 segundos, o mesmo teto de observação de grupo Unix já existente, para que um keeper que não fecha o canal ou uma confirmação sem resposta não prenda indefinidamente a interrupção do membro. Cada leitura de ps também é limitada a esse orçamento. Esgotar o orçamento rejeita a parada e deixa ownership em quarentena; não equivale a provar término e não dispara sinais por PID histórico.

Preparação, resultado e ownership são resultados distintos. O resultado normal do líder, após a fence foreground entregue, não espera os processos em segundo plano. O resultado sintético de interrupção só é entregue depois do mesmo sucesso de encerramento: falha de confirmação ou falta do ACK de Job vazio permanece observável. EOF abaixo da fence, erro do pipe ou rejeição do sink rejeitam o resultado mesmo durante parada. Um sink ainda em voo quando ownership termina é cancelado logicamente como falha, nunca contado como bytes entregues; uma resolução tardia não reabre o resultado.

## Requisitos por sistema operacional

| Sistema | Execução e confirmação | Recusa observável |
| --- | --- | --- |
| macOS | Keeper TypeScript pelo jiti; grupo de processos; /bin/ps executável para confirmar grupo vazio | Criação recusa /bin/ps ausente ou sem permissão de execução |
| Linux | Keeper TypeScript pelo jiti; grupo de processos; /bin/ps executável para confirmar grupo vazio | Criação recusa /bin/ps ausente ou sem permissão de execução |
| Windows | powershell.exe 5.1; compilação Add-Type; processo suspenso associado ao Job Object antes do resume | Criação executa probe real de Add-Type e recusa executável ausente/inacessível ou compilação indisponível |
| Outros | Não implementado | Montagem recusa explicitamente a plataforma |

Quando o probe recusa a criação, o erro inclui code, signal, killed e até 2048 bytes UTF-8 de cada stdout e stderr, sem cortar um caractere no meio. Essa saída não é saneada nem redigida: chega ao contexto local do modelo, como a saída do bash nativo, e pode conter caminhos ou outros dados emitidos pelo subprocesso. Isso não publica a saída em issues, PRs ou comentários; qualquer publicação exige revisão de dados pessoais separada. O diagnóstico não inclui error.message, que pode repetir o comando completo.

O probe Windows compila uma classe mínima no mesmo powershell.exe e sob as mesmas políticas de execução, sem bypass. Ele não presume que Get-Command sozinho prove compilação disponível. Os limites operacionais de preparação/encerramento não são prova de término: erro mantém ownership incerto em quarentena. O handle preparado é registrado na admissão antes da espera de readiness. Admissões só são retiradas do registro após terminate resolver com ownership comprovado, ou se a criação falhou antes de existir um handle. Uma falha de preparação com cleanup confirmado também pode ser retirada, sem transformar o erro do resultado em sucesso. Resultado foreground não retira processos em segundo plano; falhas ou timeout de ownership ficam guardados na admissão e são denunciados em stops posteriores sem repetir sinais.
