/* Andrews Franco · Stories — dados da página
 *
 * Para adicionar um link, inclua um objeto no array L:
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
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>'
};

/* Animação de cada ícone no hover / no story (keyframes em css/stories.css) */
const FX = {cart:'fx-cart',badge:'fx-pulse',chat:'fx-pulse',home:'fx-rise',cube:'fx-cube',spark:'fx-spark',store:'fx-rise',ball:'fx-bounce',book:'fx-tilt',mic:'fx-pulse',pen:'fx-swing',play:'fx-pulse',game:'fx-swing',bag:'fx-swing',shirt:'fx-swing'};

/* As quatro categorias, na ordem em que aparecem (círculos, seções e stories) */
const CATS = [
  {id:'negocios', name:'Negócios', ring:'cart', bg:'var(--cat-negocios)'},
  {id:'cursos',   name:'Cursos',   ring:'book', bg:'var(--cat-cursos)'},
  {id:'conteudo', name:'Conteúdo', ring:'mic',  bg:'var(--cat-conteudo)'},
  {id:'lojas',    name:'Lojas',    ring:'bag',  bg:'var(--cat-lojas)'}
];

/* Os 17 links */
const L = [
  // Negócios
  {t:'AF ecomm', d:'Transformando negócios com tecnologia: e-commerce do planejamento à operação.', u:'https://afecomm.com.br/', c:'negocios', i:'cart'},
  {t:'Linx · AF ecomm credenciada', d:'Parceria oficial com a Linx Commerce para a sua loja.', u:'https://lp.linxcommerce.com.br/lp-parcerias-afecomm', c:'negocios', i:'badge'},
  {t:'ConsultaPsi', d:'Gestão para clínicas de psicologia.', u:'https://pgconsultapsi.vercel.app/', c:'negocios', i:'chat'},
  {t:'AF Negócios Imobiliários', d:'Portal de imóveis.', u:'https://afnegociosimobiliarios.lovable.app/', c:'negocios', i:'home'},
  {t:'3D Max', d:'Transforme sua foto em uma miniatura 3D incrível.', u:'https://suaminiatura3d.lovable.app', c:'negocios', i:'cube'},

  // Cursos
  {t:'Fábrica de Apps com IA', d:'Aprenda a criar aplicativos usando inteligência artificial.', u:'https://pay.kiwify.com.br/qhMfSrt', c:'cursos', i:'spark', tag:'Em breve'},
  {t:'E-commerce do Zero', d:'Venha aprender a criar o seu e-commerce.', u:'https://ecommercedozero.online/', c:'cursos', i:'store'},
  {t:'Curso de Impressão 3D', d:'Curso completo de impressão 3D na Udemy.', u:'https://www.udemy.com/course/curso-completo-de-impressao-3d/?referralCode=952497D062E46F1B9AB2', c:'cursos', i:'cube'},
  {t:'Engenharia das Apostas', d:'Aprenda a fazer apostas esportivas.', u:'https://engenhariadasapostas.online/', c:'cursos', i:'ball', tag:'+18'},
  {t:'Meus livros', d:'Livros, biografia e lançamentos na Amazon.', u:'https://www.amazon.com.br/stores/author/B0H7TNJ82Q', c:'cursos', i:'book'},

  // Conteúdo
  // TODO: trocar pela URL real do podcast no Spotify (hoje abre a busca)
  {t:'AF Negócios Digitais', d:'Podcast sobre negócios digitais no Spotify.', u:'https://open.spotify.com/search/AF%20Negocios%20digitais/podcasts', c:'conteudo', i:'mic'},
  // TODO: trocar pela URL real do podcast no Spotify (hoje abre a busca)
  {t:'Diário de Torcedor', d:'Podcast de futebol no Spotify.', u:'https://open.spotify.com/search/Di%C3%A1rio%20de%20Torcedor/podcasts', c:'conteudo', i:'mic'},
  {t:'Blog Diário Torcedor', d:'Meu blog sobre esportes.', u:'https://diariotorcedor.com.br', c:'conteudo', i:'pen'},
  {t:'YouTube · E-commerce', d:'Meu canal sobre e-commerce.', u:'https://youtube.com/@andrewsfranco8087?sub_confirmation=1', c:'conteudo', i:'play'},
  {t:'YouTube · Jogos mobile', d:'Review do Andrade: meu canal de jogos mobile.', u:'https://www.youtube.com/@reviewdoandrade2886', c:'conteudo', i:'game'},

  // Lojas
  {t:'Loja na Shopee', d:'Produtos selecionados na minha loja Shopee.', u:'https://shopee.com.br/andrewsfranco341#product_list', c:'lojas', i:'bag'},
  {t:'Loja de roupas na Reserva', d:'Minha loja de roupas na Reserva.', u:'https://reserva.ink/85719', c:'lojas', i:'shirt'}
];

/* Palavras da faixa amarela */
const MARQUEE = ['E-commerce','Apps com IA','Impressão 3D','Podcasts','Imóveis','Livros','Futebol','Cursos'];

/* Colunas do rodapé: Canais e Lojas apontam para itens de L pelo título */
const FOOT = [
  {h:'Canais', items:['YouTube · E-commerce','YouTube · Jogos mobile','AF Negócios Digitais','Blog Diário Torcedor','Meus livros']},
  {h:'Lojas',  items:['Loja na Shopee','Loja de roupas na Reserva','AF ecomm']}
];
