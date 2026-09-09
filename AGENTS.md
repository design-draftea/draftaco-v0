# Draftaco — instruções de trabalho

## Início de qualquer tarefa

- Responda à pessoa usuária em português do Brasil.
- Leia [docs/AI_CONTEXT.md](docs/AI_CONTEXT.md) para conhecer o produto, a arquitetura e os comandos validados.
- Leia [docs/AI_HANDOFF.md](docs/AI_HANDOFF.md) para verificar se existe trabalho em andamento de outro agente.
- Antes de editar, verifique pelas ferramentas o diretório atual, a raiz do Git, a branch e `git status --short --branch`; não peça à pessoa usuária que confirme informações que podem ser consultadas.
- Trate mudanças não commitadas preexistentes ou de origem incerta como trabalho da pessoa usuária ou de outro agente. Não sobrescreva, reverta, mova ou inclua essas mudanças sem autorização explícita. Preserve-as e prossiga com o trabalho independente em um worktree isolado quando necessário.
- Não edite diretamente na `main`. Crie uma branch por tarefa de edição e use um worktree isolado quando houver trabalho paralelo ou alterações locais não relacionadas. Inspeções e revisões somente de leitura não exigem nova branch.
- Em uma mesma pasta de trabalho, apenas um agente deve editar por vez. O outro agente pode revisar ou planejar, mas não deve alterar os mesmos arquivos simultaneamente.

## Autonomia, esclarecimentos e aprovação

- Dentro do escopo solicitado, prossiga com inspeção, criação de branch/worktree, implementação, correções e validação sem pedir confirmação a cada etapa. Não encerre apenas com um plano quando o pedido for de execução.
- Use o pedido atual, as decisões já confirmadas e os padrões existentes para resolver escolhas rotineiras e reversíveis. Declare uma suposição relevante e prossiga quando ela não ampliar o escopo nem substituir uma referência ou decisão exigida.
- Pergunte somente quando faltar uma decisão material que não possa ser obtida dessas fontes e que impeça avançar corretamente. Enquanto aguarda, conclua o trabalho independente da resposta. Silêncio ou tempo decorrido não constituem resposta nem aprovação.
- “Confirmar” estado técnico significa verificá-lo pelas ferramentas. Explicar uma necessidade ou registrar uma decisão não significa aguardar aprovação, salvo quando uma regra a exigir explicitamente. Explicar uma ampliação de escopo não a autoriza.
- Reaproveite respostas e autorizações já concedidas na sessão para a mesma ação e escopo. Não as estenda a outro destino, publicação ou mudança material.
- Antes de pedir uma aprovação ainda necessária, conclua a preparação e as verificações permitidas para apresentar um resultado concreto e revisável. A preparação não autoriza executar a etapa protegida.
- Em falhas de permissão, diagnostique a causa e use o mecanismo normal de aprovação da ferramenta quando disponível e permitido. Não contorne restrições nem remova locks de Git indiscriminadamente. Peça execução manual somente quando não houver um caminho permitido disponível ou a aprovação for recusada.

## Continuidade entre Codex e Claude

- Este arquivo é a fonte única das regras compartilhadas do repositório.
- [docs/AI_CONTEXT.md](docs/AI_CONTEXT.md) contém somente contexto durável. Atualize-o quando arquitetura, comandos, rotas ou decisões permanentes realmente mudarem.
- [docs/AI_HANDOFF.md](docs/AI_HANDOFF.md) registra o estado operacional da tarefa atual. Atualize o Estado atual ao transferir trabalho, encerrar uma sessão incompleta ou concluir uma tarefa que alterou o projeto; preserve registros anteriores como histórico.
- O handoff deve registrar objetivo, critérios de aceite, branch/worktree, arquivos alterados, decisões, validações executadas, pendências obrigatórias e próximo passo concreto. Separe sugestões futuras e etapas fora do escopo das pendências de conclusão.
- Ao retomar, confronte o handoff com o Git e as evidências disponíveis antes de perguntar sobre divergências. Registros históricos não são ordens para retomar trabalho antigo nem autorizações para novas ações.
- Não declare como concluído algo que não foi verificado. Diferencie claramente implementação, validação local, Pull Request, merge e deploy.
- Nunca registre credenciais, tokens, dados pessoais, URLs privadas ou segredos nos arquivos de contexto ou handoff.

## Fluxo de Git

- `main` é a versão oficial publicada. Nunca trabalhe ou faça push diretamente nela.
- Crie branches a partir da `main` atualizada, usando prefixos como `feature/`, `fix/`, `chore/` ou `docs/`.
- Mantenha cada commit e Pull Request restritos ao objetivo da tarefa.
- Pull Request, merge e publicação exigem autorização explícita correspondente. Uma mesma mensagem pode autorizar várias etapas; não solicite novamente autorização já concedida para a mesma ação e escopo. Antes do merge na `main`, verifique se tanto o merge quanto a publicação automática estão autorizados.
- O deploy é feito exclusivamente pelo GitHub Actions quando uma mudança é incorporada à `main`. Não use `gh-pages` nem crie uma branch de deploy.
- Nunca remova o checkout principal do projeto (a pasta selecionada pela pessoa usuária). Limpezas podem atingir apenas worktrees temporários criados para tarefas específicas e exigem autorização quando houver risco de perda.
- Crie worktrees isolados dentro de `.worktrees/<nome-da-branch>`, nunca em `/tmp` ou `/private/tmp`, que o sistema apaga sem avisar e deixa registros órfãos.
- Ao encerrar uma tarefa que usou worktree isolado, remova-o somente depois de verificar que está limpo e não haverá perda de trabalho, usando `git worktree remove` e `git branch -d`. Se a exclusão segura for recusada ou houver trabalho não integrado, preserve-o e registre a limpeza pendente separadamente da conclusão do escopo. Não use exclusão forçada sem autorização explícita nem apague a pasta manualmente: o Git mantém o registro e ele vira um worktree órfão.
- Use `git worktree list` para conferir o que existe e `git worktree prune` para descartar registros cujas pastas já não existem.
- Não apague a branch remota sem autorização explícita.

## Segurança e escopo

- Use dados mockados. Nunca inclua credenciais, tokens, dados pessoais ou endpoints internos no repositório, no protótipo público ou no histórico do Git.
- Não adicione dependências nem altere o workflow de deploy sem explicar a necessidade na Pull Request.
- Preserve os produtos e fluxos existentes; mantenha mudanças restritas ao pedido.

## Figma

- Se o pedido incluir um link do Figma ou identificador de nó, abra e visualize o design no Figma Desktop antes de implementar.
- O Figma fornecido é a fonte de verdade visual. Não invente detalhes de interface, espaçamentos, cores, estados, textos ou assets por suposição.
- Se o arquivo ou nó não estiver acessível, informe o bloqueio e peça acesso ou uma referência visual; não prossiga com uma interpretação própria.
- Reutilize os assets, máscaras e tokens reais do repositório. Não aproxime artes complexas com gradientes ou desenhos substitutos.
- Se a captura da referência, a captura do protótipo ou a comparação visual estiver bloqueada, mantenha o QA visual como `blocked` ou pendente. Continue verificações e correções independentes e registre o requisito exato para retomar. Não declare fidelidade visual sem a evidência exigida.
- Considere acessibilidade, estados interativos, responsividade e comportamento em diferentes viewports desde a implementação.

## Validação

- Para mudanças de interface ou fluxo, implemente na branch e apresente a versão local para validação da pessoa responsável pelo protótipo.
- Valide no navegador em execução, na rota, viewport e estado relevantes. Build concluído não comprova fidelidade visual nem interação correta.
- Quando a pessoa usuária pedir para testar o protótipo, inicie o servidor e informe uma URL local ou LAN utilizável, conforme o caso.
- Antes de abrir uma Pull Request, execute `npm ci` e `npm run build`.
- `npm run lint` existe, mas contém erros preexistentes e não é um bloqueio de merge. Não desabilite regras para contorná-los; trate a limpeza em uma tarefa separada.
- Registre separadamente o que foi implementado, o que foi validado localmente, o que foi para Pull Request, o que teve merge e o que foi publicado.
- Depois de um deploy, verifique a rota-alvo diretamente; a raiz responder não prova que uma rota SPA específica funciona.
- Conclua todas as etapas solicitadas e autorizadas que sejam viáveis. Se uma dependência obrigatória continuar bloqueada, entregue o estado parcial com a limitação e o próximo passo, sem apresentar a tarefa inteira como concluída. PR, merge, publicação e sugestões futuras fora do escopo não são requisitos para concluir uma entrega local.

## Movimento

- Neste protótipo, as animações definidas pela interface devem ser executadas mesmo quando o desktop informar a preferência `prefers-reduced-motion: reduce`. Não use essa preferência para reduzir ou desativar animações.
