# Memória dos Tubarões

Jogo da memória infantil criado para o Francisco, pensado primeiro para celular. O tabuleiro reúne oito espécies em ilustrações originais e mostra uma comemoração animada diferente sempre que uma dupla é encontrada.

## O que há no jogo

- tabuleiro simples de 16 cartas, sem cronômetro ou punição;
- oito tubarões ilustrados e oito movimentos de comemoração;
- fatos curtos sobre cada espécie e áudio opcional;
- controles grandes, navegação por teclado e nomes das cartas escondidos até serem abertas;
- layout responsivo, inclusive em celular deitado;
- suporte à preferência de movimento reduzido;
- estado protegido contra clique duplo e timers antigos após reiniciar.

## Rodar localmente

```bash
npm install
npm run dev
```

## Verificar tudo

```bash
npm run verify
```

Esse comando executa lint, testes automatizados, checagem TypeScript e build de produção.

## Publicação

O workflow em `.github/workflows/deploy.yml` verifica o projeto após cada push para `main`. Quando o repositório tiver GitHub Pages disponível, ele também publica a pasta `dist`; o build já usa a base `/memoryshark/`.

Jogue em: <https://moise5andrad3.github.io/memoryshark/>.
