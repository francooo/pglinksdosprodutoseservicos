# Andrews Franco · Links (Stories)

Página estática de links com os produtos, serviços, cursos, canais e lojas do Andrews Franco, no estilo **Stories**. Sem build e sem dependências: é só HTML, CSS e JS.

O guia visual completo está em [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md). O pacote original é `andrews-franco-stories-design-system.zip`.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `index.html` | Marcação da página |
| `css/tokens.css` | Tokens: cores, fontes, raios, espaçamentos e movimento |
| `css/stories.css` | Estilos e animações |
| `js/data.js` | **Conteúdo**: categorias, os 17 links, ícones, faixa e rodapé |
| `js/app.js` | Renderização e visualizador de story |
| `assets/` | Avatar e favicon |
| `vercel.json` | Cabeçalhos de cache para a Vercel |

## Adicionar ou editar um link

Edite o array `L` em [js/data.js](js/data.js):

```js
{t:'Título', d:'Descrição de uma linha.', u:'https://destino.com', c:'cursos', i:'book', tag:'Em breve'}
```

- `c` precisa ser uma das quatro categorias: `negocios`, `cursos`, `conteudo` ou `lojas`.
- `i` precisa ser uma das chaves de ícone de `I`.
- `tag` é opcional.

A numeração, as seções, os stories e o rodapé se atualizam sozinhos. Para colocar um link no rodapé, inclua o título dele em `FOOT`.

**Pendente:** as URLs reais dos dois podcasts no Spotify. Hoje elas abrem a busca; estão marcadas com `TODO` em `js/data.js`.

## Rodar localmente

```sh
npx serve .
# ou
python -m http.server 8000
```

## Publicar na Vercel

- **Pelo Git:** importe o repositório na Vercel com o framework preset **Other**, sem comando de build e com a raiz como diretório de saída. Cada push na `main` publica.
- **Pela CLI:** `npx vercel` para o preview e `npx vercel --prod` para produção.
