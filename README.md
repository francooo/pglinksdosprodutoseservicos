# Andrews Franco · Links (Stories)

Página de links com os produtos, serviços, cursos, canais e lojas do Andrews Franco, no estilo **Stories**, e um **admin** separado para acompanhar acessos e cliques e gerenciar os links. Os dois usam o mesmo banco Postgres no **Neon**, mas são **dois projetos diferentes na Vercel** dentro deste mesmo repositório.

O guia visual completo está em [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md).

## Os dois projetos

| | Página pública | Admin |
| --- | --- | --- |
| Pasta (Root Directory na Vercel) | raiz do repositório (`./`) | `admin-app` |
| O que tem | página de links, `/api/track` (contagem anônima) e `/api/links` (links visíveis) | painel e `/api/login`, `/api/me`, `/api/stats`, `/api/visitors`, `/api/links`, `/api/export` |
| Variáveis de ambiente | `DATABASE_URL` | `DATABASE_URL`, `SESSION_SECRET` e `PUBLIC_SITE_URL` (opcional) |

### Estrutura

| Caminho | O que é |
| --- | --- |
| `index.html`, `css/`, `assets/` | Página pública |
| `js/data.js` | Categorias, ícones, faixa e a lista **reserva** de links (usada se a API falhar) |
| `js/app.js` | Renderização e stories; busca os links em `/api/links` |
| `js/track.js` | Contagem anônima de acessos e cliques |
| `api/` | Funções da página; `api/_lib/` é código compartilhado e não vira rota |
| `admin-app/` | **Projeto do admin**: `index.html`, `admin.js`, `admin.css`, `api/` e `shared/` |
| `admin-app/shared/` e `admin-app/api/_lib/{db,http}.js` | **Cópias** de arquivos da página, geradas por `npm run sync-admin` |
| `db/schema.sql` | Tabelas: `admins`, `login_attempts`, `links` e `events` |
| `scripts/` | Migração, seed, criação de admin, sincronização e servidor local |

> **Arquivos compartilhados:** a Vercel só enxerga a pasta de cada projeto. Por isso o admin guarda cópias de `css/tokens.css`, `js/data.js`, avatar, favicon, `api/_lib/db.js` e `api/_lib/http.js`. Se mudar algum desses originais, rode `npm run sync-admin` antes do commit. Para só conferir se as cópias estão em dia, rode `npm run sync-admin -- --check`.

## Configuração na Vercel

**1. Projeto da página** (o que já existe):
- Root Directory: `./`; Framework Preset: **Other**; sem Build Command.
- Environment Variables: `DATABASE_URL`.

**2. Projeto do admin** (novo):
- **Add New → Project** e importe este mesmo repositório do GitHub.
- **Root Directory: `admin-app`**; Framework Preset: **Other**; sem Build Command.
- Environment Variables, marcando Production e Preview:
  - `DATABASE_URL`: a mesma connection string do Neon.
  - `SESSION_SECRET`: uma string aleatória. Gere com `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.
  - `PUBLIC_SITE_URL` (opcional): o endereço da página pública, ex.: `https://seu-site.vercel.app`. Com ele, o admin mostra os botões "Ver página" e "Não contar meus acessos".

Cada push na `main` publica os dois projetos. Depois de cadastrar ou trocar variáveis, faça **Redeploy**.

## Banco (uma vez, no seu computador)

Copie o `.env.example` para `.env` (que nunca vai para o Git), preencha e rode:

```sh
npm install
npm run db:migrate      # cria as tabelas (pode rodar de novo sem perder dados)
npm run db:seed         # copia os links do js/data.js para o banco (não sobrescreve os existentes)
npm run create-admin    # cria o seu usuário do admin (pede e-mail e senha)
```

Para trocar a senha, rode `npm run create-admin` de novo com o mesmo e-mail. Para remover um usuário, use `npm run create-admin -- --delete email@exemplo.com`.

## Admin

| Aba | O que mostra |
| --- | --- |
| **Visão geral** | Acessos, visitantes únicos (novos e recorrentes), cliques, cliques por acesso, gráfico diário, cliques por categoria e links mais clicados |
| **Links** | Cliques de cada link (na lista e no botão Acessar dos stories), visitantes que clicaram e taxa |
| **Origem** | Fonte (Instagram, WhatsApp, Google…), campanhas UTM, dispositivo, navegador, sistema, país e cidade |
| **Stories** | Aberturas por categoria, cliques em Acessar e retenção de cada story |
| **Visitantes** | Lista de visitantes anônimos; ao clicar em um, aparece a jornada completa |
| **Gerenciar links** | Criar, editar, ocultar e reordenar links, sem commit. A página pública atualiza em até 1 minuto |

- **Período:** hoje, 7, 30 ou 90 dias, ou datas personalizadas, no fuso de São Paulo.
- **Exportação:** CSV por link e CSV de eventos, separados por `;` para abrir direto no Excel.
- **Não contar os seus acessos:** abra a página uma vez com `?notrack=1` em cada navegador e celular que você usa (o admin tem um botão para isso). Para voltar a contar, use `?notrack=0`.
- **Medir campanhas:** use UTM no link, ex.: `https://seu-site/?utm_source=instagram&utm_medium=bio`.

## Privacidade

- **Visitante:** cada um é identificado só por um ID aleatório guardado no navegador. Nada de nome, e-mail ou IP é registrado.
- **Localização:** país e cidade vêm da própria Vercel.
- **Aviso:** o rodapé da página informa que os acessos são registrados de forma anônima.

## Rodar localmente

```sh
npm run dev         # página pública: http://localhost:3000
npm run dev:admin   # admin:          http://localhost:3001
```
