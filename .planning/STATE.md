# Project State

## Project Reference

Core value: Francisco reconhece os tubarões, entende acerto/erro sem explicação adulta e quer jogar novamente.

## Current Position

- Phase: release v2
- Status: implementation complete and verified
- Progress: 100% do código, arte, áudio, testes, build e validação de navegador concluídos; repositório público e Pages habilitado

## Recent Decisions

- Mobile 360/390 px é a referência; desktop é adaptação.
- Oito espécies e as narrações da versão Manus foram preservadas; os WAVs foram convertidos para MP3 mono, reduzindo o total de 3,93 MB para 0,66 MB.
- As artes finais usam gouache e lápis de cor em fundo aqua coerente.
- Cada espécie tem um movimento CSS próprio na celebração.
- O repositório foi autorizado e alterado para público; o workflow executa CI e GitHub Pages.

## Verification

- `npm run verify`: lint sem avisos, 19 testes, TypeScript e build Vite aprovados.
- `npm audit`: zero vulnerabilidades conhecidas.
- Chrome real: 360×640, 390×844, 843×390 e 568×320, sem overflow horizontal.
- Fluxos reais: acerto, erro, bloqueio de terceiro clique, reset durante timer, áudio, teclado, oito pares e vitória.
- Build de produção servido em `/memoryshark/`, com imagens/fontes carregadas e console sem erros.

## Deployment

- Visibilidade pública confirmada no GitHub em 2026-07-09.
- Fonte do GitHub Pages configurada como GitHub Actions após o primeiro push.
- As oito narrações antigas foram preservadas e validadas tecnicamente, sem nova transcrição semântica.

## Session Continuity

Last session: 2026-07-09
Stopped at: release v2 completa e verificada; Pages habilitado e novo deploy disparado pelo commit final.
Resume file: none
