# Design System · Andrews Franco Stories

Este é o guia visual da página de links do Andrews Franco no estilo **Stories**. A página reúne em um só lugar os produtos, serviços, cursos, canais e lojas do Andrews. Foi pensada primeiro para o celular e usa uma linguagem de stories, que o público já conhece das redes sociais.

## 1. Conteúdo do pacote

| Pasta / arquivo | O que é |
| --- | --- |
| `page/index.html` | Página final completa, pronta para hospedar (um arquivo só, com a foto embutida). |
| `components/componentes.html` | Vitrine com cada elemento isolado: cores, cabeçalho, círculos, linhas, tags, cartão de story, faixa e rodapé. |
| `styles/tokens.css` | Variáveis CSS: cores, fontes, raios, espaçamentos e movimento. |
| `styles/stories.css` | Todos os estilos e animações da página. |
| `tokens.json` | Os mesmos tokens em JSON, para importar em outras ferramentas. |
| `icons/*.svg` | Os 17 ícones de linha usados na página. |
| `assets/avatar-andrews-franco.jpg` | Foto de perfil (400 × 400 px). |
| `mockups/*.png` | Telas da página completa no computador e no celular, e as telas de story. |

## 2. Princípios

1. **Ousado e direto.** Fundo azul cobalto, títulos grandes em caixa alta e um amarelo que só aparece para chamar atenção.
2. **Primeiro o celular.** Os círculos de story ficam no topo e a lista tem alvos de toque grandes.
3. **Movimento com função.** Cada animação mostra algo: o anel girando indica que há story para ver, a linha preenchida indica o link em foco e a barra de progresso mostra o tempo.
4. **Organizado por categoria.** Todo item pertence a uma de quatro categorias: Negócios, Cursos, Conteúdo e Lojas.

## 3. Cores

| Token | Valor | Uso |
| --- | --- | --- |
| `--s-bg` | `#1a2ef0` | Fundo principal (azul cobalto). |
| `--s-deep` | `#0f1ca8` | Azul profundo, usado nos gradientes. |
| `--s-ink` | `#0b0f2e` | Rodapé, texto sobre amarelo e miolo dos círculos. |
| `--s-fg` | `#ffffff` | Texto principal sobre azul. |
| `--s-muted` | `#c9d0ff` | Descrições e textos de apoio. |
| `--s-hi` | `#ffe14d` | Destaque: tags, títulos de seção, hover das linhas, faixa e botão "Voltar ao topo". |
| `--s-pink` | `#ff6b9a` | Segunda cor do anel giratório dos stories. |

**Gradientes por categoria** (fundo do cartão de story):

| Categoria | Gradiente |
| --- | --- |
| Negócios | `#2f5dff` → `#0f1ca8` |
| Cursos | `#ff9f1a` → `#d65a00` |
| Conteúdo | `#ff4f81` → `#a3164a` |
| Lojas | `#16b08f` → `#06624f` |

**Contraste:**

- Branco sobre `#1a2ef0`: cerca de 7,8:1.
- `#c9d0ff` sobre `#1a2ef0`: cerca de 5,2:1.
- `#0b0f2e` sobre `#ffe14d`: cerca de 14,4:1.

Todos passam o nível AA de acessibilidade. Não use amarelo como cor de texto corrido sobre branco.

## 4. Tipografia

| Papel | Fonte | Pesos | Regras |
| --- | --- | --- | --- |
| Display | **Big Shoulders Display** (Google Fonts) | 700, 900 | Sempre em CAIXA ALTA. Uso: nome, títulos das linhas, títulos de seção, título do story e faixa animada. |
| Texto | **DM Sans** (Google Fonts) | 400, 500, 700 | Descrições, rótulos, botões e rodapé. |

| Estilo | Tamanho | Altura de linha | Peso |
| --- | --- | --- | --- |
| Hero (nome) | 40–64 px (fluido) | 0,9 | 900 |
| Título do story | 46 px | 0,95 | 900 |
| Título da linha | 26–40 px (fluido) | 1 | 700 |
| Título de seção | 20 px, espaçamento entre letras de 0,08em | 1 | 900 |
| Corpo | 16 px | 1,45 | 400 |
| Descrição | 13,5 px | 1,4 | 400 |
| Rótulo | 12 px | — | 500 |
| Tag | 11 px | — | 700 |

## 5. Espaçamento e raios

- **Espaçamento:** 4 · 8 · 12 · 16 · 24 · 40 · 56 px. A margem lateral mínima é de 16 px, e as seções de categoria ficam a 40 px uma da outra.
- **Raios:**
  - 6 px: tags.
  - 10 px: ícone da linha.
  - 14 px: botão "Acessar".
  - 24 px: cartão de story.
  - 999 px: pílulas e círculos.
- **Largura máxima do conteúdo:** 720 px.

## 6. Ícones

São 17 ícones de linha em grade de 24 × 24, com traço de 1,8, pontas arredondadas, sem preenchimento e cor `currentColor`.

| Ícone | Uso | Animação no hover |
| --- | --- | --- |
| `cart` | AF ecomm · categoria Negócios | desliza para os lados |
| `badge` | Linx credenciada | pulsa |
| `chat` | ConsultaPsi | pulsa |
| `home` | AF Negócios Imobiliários | sobe e desce |
| `cube` | 3D Max · Curso de Impressão 3D | gira em 3D |
| `spark` | Fábrica de Apps com IA | gira |
| `store` | E-commerce do Zero | sobe e desce |
| `ball` | Engenharia das Apostas | quica |
| `book` | Meus livros · categoria Cursos | vira como página |
| `mic` | Podcasts · categoria Conteúdo | pulsa |
| `pen` | Blog Diário Torcedor | balança |
| `play` | YouTube · E-commerce | pulsa |
| `game` | YouTube · Jogos mobile | balança |
| `bag` | Loja na Shopee · categoria Lojas | balança |
| `shirt` | Loja de roupas na Reserva | balança |
| `arrow` | Seta de link, botões | gira −45° no hover |
| `grid` | Reserva (uso livre) | — |

## 7. Componentes

### Cabeçalho

Foto redonda de 64 px com borda amarela de 3 px. Ao lado, o nome em display 900 e uma linha de apoio em `--s-muted`.

### Círculo de story

- Botão de 76 px com anel em gradiente cônico (amarelo → rosa → amarelo) girando a cada 4 s.
- Miolo em `--s-ink` com o ícone em amarelo e o nome da categoria embaixo.
- Na rolagem horizontal do celular, o quarto círculo aparece cortado de propósito, como dica de que dá para rolar.

### Título de seção

Ícone e nome da categoria em amarelo, em caixa alta, com a contagem de links ("5 links") à direita.

### Linha de link

- Título em display, descrição em DM Sans, número sequencial (01–17) e seta.
- Divisória de 2 px em branco 25%.
- **Hover/foco:** um fundo amarelo sobe de baixo para cima (0,35 s), o texto passa a `--s-ink`, a seta gira −45° e o ícone faz a sua animação.

### Tag

Pílula amarela com texto `--s-ink` em 11 px, peso 700. Em uso: **Em breve** e **+18**.

### Cartão de story

- 380 × 660 px no máximo, raio de 24 px, fundo com o gradiente da categoria.
- Barras de progresso no topo, avatar, nome da categoria, contador ("2 de 5") e botão de fechar.
- Ícone grande flutuando, título e descrição entram de baixo para cima em sequência, e o botão branco "Acessar" fica no rodapé.
- **Navegação:**
  - Cada story dura 5 s.
  - Toque na esquerda volta e na direita avança.
  - Esc fecha e as setas do teclado navegam.
  - No último item da categoria, o story passa para a próxima categoria.

### Faixa animada

Faixa amarela de largura total com palavras-chave em display 900, rolando continuamente (26 s por ciclo).

### Rodapé

- Fundo `--s-ink`, avatar e nome grandes.
- Três colunas: **Categorias** (atalhos para as seções), **Canais** e **Lojas**.
- Linha final com o texto "© 2026 Andrews Franco · AF Negócios Digitais" e o botão amarelo "Voltar ao topo".

## 8. Movimento

| Animação | Duração | Onde |
| --- | --- | --- |
| Anel girando | 4 s, linear, infinito | Círculos de story |
| Preenchimento da linha | 0,35 s, `cubic-bezier(.7,0,.2,1)` | Hover das linhas |
| Entrada do story | 0,35 s, `cubic-bezier(.2,.9,.3,1.1)` | Ao abrir o cartão |
| Barra de progresso | 5 s, linear | Story ativo |
| Ícone flutuante | 3 s, infinito | Cartão de story |
| Faixa | 26 s, linear, infinito | Faixa amarela |

Quem ativa "reduzir movimento" no sistema vê todas as animações desligadas.

## 9. Inventário de conteúdo (17 links)

| # | Categoria | Item | Destino |
| --- | --- | --- | --- |
| 01 | Negócios | AF ecomm | afecomm.com.br |
| 02 | Negócios | Linx · AF ecomm credenciada | lp.linxcommerce.com.br |
| 03 | Negócios | ConsultaPsi | pgconsultapsi.vercel.app |
| 04 | Negócios | AF Negócios Imobiliários | afnegociosimobiliarios.lovable.app |
| 05 | Negócios | 3D Max | suaminiatura3d.lovable.app |
| 06 | Cursos | Fábrica de Apps com IA *(Em breve)* | pay.kiwify.com.br |
| 07 | Cursos | E-commerce do Zero | pgecommercedozero.vercel.app |
| 08 | Cursos | Curso de Impressão 3D | udemy.com |
| 09 | Cursos | Engenharia das Apostas *(+18)* | engenhariadasapostas.online |
| 10 | Cursos | Meus livros | amazon.com.br |
| 11 | Conteúdo | AF Negócios Digitais (podcast) | Spotify: **link pendente** |
| 12 | Conteúdo | Diário de Torcedor (podcast) | Spotify: **link pendente** |
| 13 | Conteúdo | Blog Diário Torcedor | diariotorcedor.com.br |
| 14 | Conteúdo | YouTube · E-commerce | youtube.com/@andrewsfranco8087 |
| 15 | Conteúdo | YouTube · Jogos mobile | youtube.com/@reviewdoandrade2886 |
| 16 | Lojas | Loja na Shopee | shopee.com.br |
| 17 | Lojas | Loja de roupas na Reserva | reserva.ink |

**Para adicionar um item:** inclua uma linha no array `L` do `page/index.html` com `t` (título), `d` (descrição), `u` (link), `c` (categoria), `i` (ícone) e, se precisar, `tag`. A numeração, as seções, os stories e o rodapé se atualizam sozinhos.

## 10. Regras rápidas

- **Faça:**
  - Use amarelo só para destaque.
  - Mantenha os títulos em caixa alta.
  - Ponha cada item numa das quatro categorias.
  - Escreva descrições de uma linha.
- **Evite:**
  - Uma quinta cor de destaque.
  - Texto corrido em display.
  - Títulos com mais de 5 palavras.
  - Fotos de terceiros no lugar dos ícones.
