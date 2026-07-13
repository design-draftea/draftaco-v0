# Pitaquinho

Protótipo mobile em React para explorar a experiência do Rei do Pitaco com apostas esportivas, cassino, promoções, betslip e regras de handoff de produto.

O projeto também funciona como uma camada prática de validação dos tokens exportados do Figma. A intenção é aproximar decisões de produto, comportamento de interface e uso real dos tokens em componentes navegáveis.

## Como rodar

Use Node.js 20.

```bash
npm ci
npm run dev
```

O Vite abre o app localmente em:

```text
https://localhost:5173/
```

Para testar a câmera no celular, acesse pela rede local usando HTTPS:

```text
https://<IP-da-máquina>:5173/
```

O navegador pode pedir confirmação do certificado local na primeira abertura. Use sempre `https://`; em `http://<IP>:<porta>/`, navegadores móveis bloqueiam `getUserMedia` e a câmera fica indisponível.

Scripts úteis:

```bash
npm run dev      # servidor local
npm run build    # typecheck + build de produção
npm run lint     # ESLint
npm run preview  # preview do build
```

Em produção, o app usa o base path `/draftaco-v0`.

## Fluxo de colaboração e deploy

- `main` é a versão oficial e publicada do protótipo.
- Cada mudança deve começar em uma branch própria e chegar à `main` por Pull Request.
- Pull Requests para `main` executam o build no GitHub Actions.
- O merge na `main` publica automaticamente no GitHub Pages. Não existe deploy manual por `gh-pages`.

O lint permanece disponível para acompanhamento, mas ainda possui erros preexistentes e não é bloqueio de merge. A correção deve acontecer em uma tarefa de manutenção dedicada, sem misturar mudanças funcionais.

## Rotas principais

- `/apostas`: home de apostas esportivas.
- `/cassino`: home de cassino.
- `/promocoes`: página de promoções.
- `/handoff`: documentação viva de regras de produto e comportamento.

Rotas desconhecidas são normalizadas para o produto padrão de apostas.

## Estrutura

```text
src/
  assets/        imagens, ícones e logos usados no protótipo
  components/    blocos reutilizáveis da experiência
  data/          dados mockados de banners, jogos, promoções e navegação
  hooks/         estado compartilhado, betslip e feature flags
  pages/         telas principais
  services/      integrações auxiliares, como TheSportsDB
  styles/        tokens, reset global e estilos base
  utils/         regras de navegação e formatação
```

## Tokens e tema

Os tokens ficam em `src/styles/tokens.css` e foram gerados a partir dos exports `Dark.tokens.json` e `Light.tokens.json` do Figma. Componentes devem preferir variáveis semânticas `--tokens-*` em vez de cores ou medidas hardcoded.

O tema é inicializado em `src/theme.ts`. O padrão atual é `dark`, com suporte a `light` e `system`. Também é possível forçar o tema por query string:

```text
/?theme=dark
/?theme=light
```

Ao alterar tokens, valide pelo menos:

- contraste de texto e odds nos temas claro e escuro;
- estados de seleção, hover, pressed, disabled e focus-visible;
- comportamento mobile com safe area e bottom navigation;
- motion com `prefers-reduced-motion`.

## Handoff de produto

A rota `/handoff` registra regras de ordem, curadoria e comportamento para Home, Esporte e Competição. Use essa página como contrato de produto antes de alterar a arquitetura da experiência.

Ainda faltam completar as abas de Evento, Promoções e Cassino. Essas telas devem documentar:

- objetivo da tela;
- ordem esperada dos blocos;
- estados principais;
- regras de conteúdo;
- limites de acessibilidade e motion;
- critérios de aceite para implementação.

## Cuidados de design

- A Home de apostas é densa. Antes de adicionar novos blocos, confirme se eles ajudam a tarefa principal: encontrar um evento, escolher uma odd e concluir o bilhete.
- O filtro por esporte reduz ruído e deve continuar recebendo prioridade na navegação.
- O betslip compacto é uma peça central da experiência; qualquer mudança nele deve preservar clareza de seleções, odds, valor apostado e retorno potencial.
- Evite misturar chamadas de cassino dentro do contexto de apostas esportivas, exceto quando houver uma regra explícita de produto.
- Cores de time, badges e acentos promocionais podem existir, mas devem ser mapeados para tokens ou constantes documentadas quando virarem padrão.

## Atenções abertas

- Revisar tokens de `line-height` exportados com unidade `px`; eles devem ser unitless antes de serem consumidos como tokens tipográficos.
- Reduzir gradualmente cores hexadecimais soltas em CSS/TSX.
- Consolidar aliases globais como `--color-*`, `--spacing-*` e `--radius-*` para evitar duas fontes de verdade.
- Completar o README com o processo real de export/sync dos tokens do Figma quando esse fluxo estiver definido.
