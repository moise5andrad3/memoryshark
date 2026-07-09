# MemoryShark v2

## What This Is

Jogo da memória mobile-first para Francisco, 6 anos, executado como site estático no Chrome. Preserva as oito espécies e as narrações da versão Manus, substitui fotos por ilustrações originais e celebra cada par com o próprio tubarão em movimento.

## Requirements

- Uma tela simples, grade 4×4 e reinício imediato.
- Oito pares: megalodonte, branco, tigre, touro, martelo, baleia, Groenlândia e tubarão-serra verdadeiro.
- Ilustrações coerentes e legíveis em cartas de aproximadamente 80 px no celular.
- Celebração visual específica por espécie, curta e não bloqueante além do necessário.
- Narração opcional, controle de som persistente e nenhum autoplay antes de interação.
- Teclado, foco visível, estados acessíveis, live regions e `prefers-reduced-motion`.
- Timers canceláveis no reset; nenhuma atualização de partida anterior.
- Testes de reducer e integração; lint, typecheck, build e uso real no Chrome em 360/390 px.

## Out of Scope

- Login, backend, ranking, anúncios, multiplayer ou dificuldade configurável.
- Edição da versão Manus original.

## Key Decisions

- O repositório canônico é `moise5andrad3/memoryshark`; `shark-memory-game` fica como fonte histórica somente leitura.
- Base limpa Vite + React + TypeScript + CSS, sem o scaffold pesado do Manus.
- Direção visual: livro ilustrado subaquático claro, não o tema adulto de oceano profundo.
- `sawfish` foi corrigido para `sawshark`, preservando o nome exibido “Tubarão-serra”.
