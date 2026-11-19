// CÓPIA gerada por scripts/sync-admin.mjs a partir de js/data.js. Não edite aqui: edite o original e rode npm run sync-admin.
/* Andrews Franco · Stories — dados da página
 *
 * Para adicionar um link, inclua um objeto no array L:
 *   id  identificador estável (slug, sem acento); não mude depois de publicado
 *   t   título (curto, até 5 palavras; aparece em caixa alta)
 *   d   descrição de uma linha
 *   u   URL de destino (abre em nova aba)
 *   c   categoria: 'negocios' | 'cursos' | 'conteudo' | 'lojas'
 *   i   ícone: uma das chaves de I (cart, badge, chat, home, cube, spark, store,
 *       ball, book, mic, pen, play, game, bag, shirt)
 *   tag (opcional) pílula amarela, ex.: 'Em breve', '+18'
 *
 * A numeração (01, 02…), as seções, os stories e o rodapé se atualizam sozinhos.
 * A ordem dentro de cada categoria segue a ordem deste array.
 */

const AV = 'assets/avatar-andrews-franco.jpg';

/* Ícones de linha 24×24, traço 1,8, cor currentColor */
const I = {
  cart:'<path d="M3 4h2l2.4 11h10.2L20 8H6.2"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
  badge:'<path d="M12 3l2.5 1.8 3-.2.9 2.9 2.4 1.8-1 2.9 1 2.9-2.4 1.8-.9 2.9-3-.2L12 21l-2.5-1.8-3 .2-.9-2.9-2.4-1.8 1-2.9-1-2.9 2.4-1.8.9-2.9 3 .2z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  chat:'<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M12 15.5s-3.5-2-3.5-4.2a1.8 1.8 0 0 1 3.5-.6 1.8 1.8 0 0 1 3.5.6c0 2.2-3.5 4.2-3.5 4.2z"/>',
  home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  cube:'<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 22V12M21 7l-9 5-9-5"/>',
  spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  store:'<path d="M4 9h16l-1.2-5H5.2z"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/>',
  ball:'<circle cx="12" cy="12" r="9"/><path d="M12 7l4 3-1.5 4.5h-5L8 10z"/><path d="M12 3v4M21 10l-5 0M3 10h5M8 20l1.5-5.5M16 20l-1.5-5.5"/>',
  book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/><path d="M8 7h7M8 11h5"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  pen:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
  play:'<rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z"/>',
  game:'<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16" cy="11.5" r=".8"/><circle cx="18" cy="14" r=".8"/>',
  bag:'<path d="M5 8h14l-1 13H6z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
  shirt:'<path d="M8 3L3 6l2 4 2-1v12h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0z"/>',
  heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/><path d="M7.5 12h2.3l1.2-2 2 4 1.2-2h2.3"/>',
  passport:'<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3.5"/><path d="M8.5 10h7M12 6.5c1.3 1 1.3 6 0 7M12 6.5c-1.3 1-1.3 6 0 7M9 17h6"/>',
  candle:'<path d="M9 11h6v10H9z"/><path d="M12 11V8"/><path d="M12 3c1.6 1.7 1.6 3.4 0 4.2-1.6-.8-1.6-2.5 0-4.2z"/><path d="M6 21h12"/>',
  building:'<path d="M5 21V4h10v17"/><path d="M15 9h4v12"/><path d="M8 8h1M11 8h1M8 12h1M11 12h1M8 16h1M11 16h1"/><path d="M3 21h18"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>'
};

/* Animação de cada ícone no hover / no story (keyframes em css/stories.css) */
const FX = {cart:'fx-cart',badge:'fx-pulse',chat:'fx-pulse',home:'fx-rise',cube:'fx-cube',spark:'fx-spark',store:'fx-rise',ball:'fx-bounce',book:'fx-tilt',mic:'fx-pulse',pen:'fx-swing',play:'fx-pulse',game:'fx-swing',bag:'fx-swing',shirt:'fx-swing',heart:'fx-pulse',passport:'fx-tilt',candle:'fx-pulse',building:'fx-rise'};

/* As quatro categorias, na ordem em que aparecem (círculos, seções e stories) */
const CATS = [
  {id:'negocios', name:'Negócios', ring:'cart', bg:'var(--cat-negocios)'},
  {id:'cursos',   name:'Cursos',   ring:'book', bg:'var(--cat-cursos)'},
  {id:'conteudo', name:'Conteúdo', ring:'mic',  bg:'var(--cat-conteudo)'},
  {id:'lojas',    name:'Lojas',    ring:'bag',  bg:'var(--cat-lojas)'}
];

/* Os 22 links */
const L = [
  // Negócios
  {id:'af-ecomm', t:'AF ecomm', d:'Transformando negócios com tecnologia: e-commerce do planejamento à operação.', u:'https://afnegociosdigitais.vercel.app/', c:'negocios', i:'cart'},
  {id:'linx-af-ecomm', t:'Linx · AF ecomm credenciada', d:'Parceria oficial com a Linx Commerce para a sua loja.', u:'https://lp.linxcommerce.com.br/lp-parcerias-afecomm', c:'negocios', i:'badge'},
  {id:'consultapsi', t:'ConsultaPsi', d:'Gestão para clínicas de psicologia.', u:'https://pgconsultapsi.vercel.app/', c:'negocios', i:'chat'},
  {id:'af-negocios-imobiliarios', t:'AF Negócios Imobiliários', d:'Portal de imóveis.', u:'https://afnegociosimobiliarios.lovable.app/', c:'negocios', i:'home'},
  {id:'3d-max', t:'3D Max', d:'Transforme sua foto em uma miniatura 3D incrível.', u:'https://suaminiatura3d.vercel.app/', c:'negocios', i:'cube'},
  {id:'gestao-saude', t:'Gestão Saúde', d:'App para organizar seus remédios e cuidar da sua saúde.', u:'https://pgappgestaosaude.vercel.app/', c:'negocios', i:'heart'},
  {id:'passaporte-do-futebol', t:'Passaporte do Futebol', d:'Carimbe os estádios do mundo que você já visitou.', u:'https://passaportedofutebol.vercel.app/login', c:'negocios', i:'passport'},
  {id:'app-religioso', t:'App Religioso', d:'Sistema para acompanhar e organizar a sua vida de fé.', u:'https://appreligioso.vercel.app/entrar', c:'negocios', i:'candle'},
  {id:'app-condo', t:'App Condo', d:'Agente que ajuda os moradores de qualquer condomínio.', u:'https://pgappcondo.vercel.app/', c:'negocios', i:'building'},

  // Cursos
  {id:'fabrica-de-apps-com-ia', t:'Fábrica de Apps com IA', d:'Aprenda a criar aplicativos usando inteligência artificial.', u:'https://pay.kiwify.com.br/qhMfSrt', c:'cursos', i:'spark', tag:'Em breve'},
  {id:'ecommerce-do-zero', t:'E-commerce do Zero', d:'Venha aprender a criar o seu e-commerce.', u:'https://pgecommercedozero.vercel.app/', c:'cursos', i:'store'},
  {id:'curso-impressao-3d', t:'Curso de Impressão 3D', d:'Curso completo de impressão 3D na Udemy.', u:'https://www.udemy.com/course/curso-completo-de-impressao-3d/?referralCode=952497D062E46F1B9AB2', c:'cursos', i:'cube'},
  {id:'engenharia-das-apostas', t:'Engenharia das Apostas', d:'Aprenda a fazer apostas esportivas.', u:'https://www.udemy.com/course/engenharia-de-resultados-esportivos/?referralCode=2ED6982A2CCB4C4CC635', c:'cursos', i:'ball', tag:'+18'},
  {id:'meus-livros', t:'Meus livros', d:'Livros, biografia e lançamentos na Amazon.', u:'https://www.amazon.com.br/stores/author/B0H7TNJ82Q', c:'cursos', i:'book'},

  // Conteúdo
  {id:'podcast-af-negocios-digitais', t:'AF Negócios Digitais', d:'Podcast sobre negócios digitais no Spotify.', u:'https://open.spotify.com/show/0XF27GUj9u6JvelcvKYW3u?si=5309bcad07e340e3', c:'conteudo', i:'mic'},
  {id:'podcast-diario-de-torcedor', t:'Diário de Torcedor', d:'Podcast de futebol no Spotify.', u:'https://open.spotify.com/show/72LFo8pFHjgRG3TjNarj41?si=a9e6be1c3eb1482b', c:'conteudo', i:'mic'},
  {id:'blog-diario-torcedor', t:'Blog Diário Torcedor', d:'Meu blog sobre esportes.', u:'https://diariotorcedor.com.br', c:'conteudo', i:'pen'},
  {id:'youtube-ecommerce', t:'YouTube · E-commerce', d:'Meu canal sobre e-commerce.', u:'https://youtube.com/@andrewsfranco8087?sub_confirmation=1', c:'conteudo', i:'play'},
  {id:'youtube-jogos-mobile', t:'YouTube · Jogos mobile', d:'Review do Andrade: meu canal de jogos mobile.', u:'https://www.youtube.com/@reviewdoandrade2886', c:'conteudo', i:'game'},

  // Lojas
  {id:'loja-shopee', t:'Loja na Shopee', d:'Produtos selecionados na minha loja Shopee.', u:'https://shopee.com.br/andrewsfranco341#product_list', c:'lojas', i:'bag'},
  {id:'loja-reserva', t:'Loja de roupas na Reserva', d:'Minha loja de roupas na Reserva.', u:'https://reserva.ink/85719', c:'lojas', i:'shirt'},
  {id:'loja-redbubble', t:'Loja de roupas na Redbubble', d:'Minha loja de roupas na Redbubble.', u:'https://francooo94.redbubble.com/', c:'lojas', i:'shirt'}
];

/* Palavras da faixa amarela */
const MARQUEE = ['E-commerce','Apps com IA','Impressão 3D','Podcasts','Imóveis','Livros','Futebol','Cursos'];

/* Colunas do rodapé: Canais e Lojas apontam para itens de L pelo título */
const FOOT = [
  {h:'Canais', items:['YouTube · E-commerce','YouTube · Jogos mobile','AF Negócios Digitais','Blog Diário Torcedor','Meus livros']},
  {h:'Lojas',  items:['Loja na Shopee','Loja de roupas na Reserva','Loja de roupas na Redbubble','AF ecomm']}
];
