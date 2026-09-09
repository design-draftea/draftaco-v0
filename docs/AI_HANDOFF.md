# Handoff entre Codex e Claude

Este é o estado operacional compartilhado da tarefa atual. Atualize apenas com fatos verificados e mantenha o conteúdo conciso.

## Estado atual

- Atualizado em: 2026-09-09
- Agente que entrega: Claude
- Agente esperado a seguir: nenhum
- Status: pronto para revisão
- Objetivo: alinhar `AGENTS.md` e `CLAUDE.md` com a versão evoluída das mesmas regras usada no repositório Pulse, preservando o que é específico do Draftaco.
- Critérios de aceite: espinha compartilhada portada; comandos `npm`, rigor de Figma e seção "Movimento" preservados; `CLAUDE.md` sem duplicar regras do `AGENTS.md`.
- Branch/worktree: `docs/unifica-regras-agentes` em `.worktrees/docs-unifica-agentes`, criada a partir de `origin/main` (`b3143a6`).

## Alterações realizadas

- `AGENTS.md`: nova seção "Autonomia, esclarecimentos e aprovação"; regras de worktree em `.worktrees/<branch>` com remoção segura e `git worktree prune`; handoff passa a preservar histórico; verificação por ferramenta em vez de pedir confirmação ao usuário; QA visual `blocked` sem evidência; acessibilidade e responsividade no escopo de Figma.
- `CLAUDE.md`: reduzido ao encaminhamento para `AGENTS.md`, sem confirmações adicionais próprias.
- `.gitignore`: passa a ignorar `.worktrees/`.

## Decisões e limites

- Os dois repositórios não ficam idênticos de propósito. Permanecem específicos do Draftaco: `npm ci` / `npm run build` (o Pulse usa pnpm), lint com erros preexistentes que não bloqueiam merge, exigência de abrir o nó no Figma Desktop antes de implementar, e a seção "Movimento".
- Autorização de PR/merge passou ao modelo do Pulse: uma mesma mensagem pode autorizar várias etapas e a autorização é reaproveitada no mesmo escopo. A trava anterior, que exigia aprovação da versão local antes de qualquer PR, foi removida a pedido da pessoa usuária.
- Nenhum arquivo de código foi tocado.

## Validações executadas

- `git diff --check`: passou.
- `npm ci` e `npm run build` não foram executados: a mudança é somente documental e nenhuma Pull Request foi autorizada até aqui.

## Pendências

- Existe trabalho não commitado no checkout principal, na branch `feature/ajuste-tela-perfil`, sobre os banners promocionais (renomeação "GARANTIDA" → "IMPERDÍVEL", jogo `BAR vs REA`, bottom sheet multivariante). Não faz parte desta tarefa e não deve ser incluído nesta branch.
- A renomeação para "IMPERDÍVEL" e a troca `INT → REA` ainda não têm registro de QA visual em `design-qa.md`.
- Cinco worktrees órfãos em `/private/tmp` aparecem como `prunable` em `git worktree list`; a limpeza depende de autorização.

## Próximo passo

- Aguardar revisão do conteúdo. Com autorização, executar `npm ci` e `npm run build` e abrir a Pull Request para `main`.

---

## Histórico

### 2026-08-17 — configuração inicial

- Estrutura inicial de contexto e handoff criada; nenhuma alteração funcional do protótipo incluída.
- `AGENTS.md` definido como fonte única das regras compartilhadas, com `CLAUDE.md` encaminhando para ele e `AI_CONTEXT.md` guardando contexto durável.

## Modelo para o próximo handoff

- Atualizado em:
- Agente que entrega:
- Agente esperado a seguir:
- Status: em andamento | bloqueado | pronto para revisão | concluído
- Objetivo:
- Critérios de aceite:
- Branch/worktree:
- Arquivos alterados:
- Decisões tomadas:
- Validações executadas e resultados:
- Pendências ou riscos:
- Próximo passo concreto:
