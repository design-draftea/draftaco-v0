# Draftaco — instruções de trabalho

## Fluxo de Git

- `main` é a versão oficial publicada. Nunca trabalhe ou faça push diretamente nela.
- Crie uma branch por tarefa a partir de `main`, usando `feature/`, `fix/`, `chore/` ou `docs/` no nome.
- Abra uma Pull Request para `main`; não faça merge automático.
- O deploy é feito exclusivamente pelo GitHub Actions quando uma mudança é incorporada à `main`. Não use `gh-pages` nem crie uma branch de deploy.
- Use um worktree separado apenas para tarefas paralelas que precisam de isolamento.
- Nunca remova a pasta principal do projeto (checkout local selecionado pela pessoa usuária). A limpeza pode remover somente worktrees temporários criados para uma tarefa.
- Depois do merge e com autorização explícita para limpeza, arquive a tarefa associada, remova o worktree temporário e a branch local. Não apague a branch remota sem autorização explícita.

## Segurança e escopo

- Use dados mockados. Nunca inclua credenciais, tokens, dados pessoais ou endpoints internos no repositório ou no protótipo público.
- Não adicione dependências nem altere o workflow de deploy sem explicar a necessidade na Pull Request.
- Preserve os produtos e fluxos existentes; mantenha mudanças restritas ao pedido.

## Figma

- Se o pedido incluir um link do Figma ou identificador de nó, abra e visualize o design no Figma Desktop antes de implementar.
- O Figma fornecido é a fonte de verdade visual. Não invente detalhes de interface, espaçamentos, cores, estados ou assets por suposição.
- Se o arquivo ou nó não estiver acessível, informe o bloqueio e peça acesso ou uma referência visual; não prossiga com uma interpretação própria.

## Validação

- Para mudanças de interface ou fluxo, implemente primeiro na branch e apresente a versão local para validação da pessoa responsável pelo protótipo.
- Não abra Pull Request antes de receber aprovação explícita da versão local. Depois da aprovação, execute as verificações técnicas, abra a Pull Request e aguarde nova autorização explícita antes do merge.
- Antes de abrir uma Pull Request, execute `npm ci` e `npm run build`.
- `npm run lint` existe, mas contém erros preexistentes e não é um bloqueio de merge. Não desabilite regras para contorná-los; trate a limpeza em uma tarefa separada.

## Movimento

- Neste protótipo, as animações definidas pela interface devem ser executadas mesmo quando o desktop informar a preferência `prefers-reduced-motion: reduce`. Não use essa preferência para reduzir ou desativar animações.
