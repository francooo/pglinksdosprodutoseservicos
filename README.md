# Andrews Franco · Links (Stories)

Página de links com os produtos, serviços, cursos, canais e lojas do Andrews Franco, no estilo **Stories**. A página continua estática, sem build. Junto dela há:
- funções na pasta `/api` (Vercel), que registram acessos e cliques de forma anônima;
- um **admin** em `/admin`, com estatísticas e gestão dos links;
- um banco de dados Postgres no **Neon**.

O guia visual completo está em [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md).

## Estrutura

| Caminho | O que é |
| --- | --- |
| `index.html` | Marcação da página pública |
| `css/` | Tokens e estilos do design system |
| `js/data.js` | Categorias, ícones, faixa e a lista **reserva** de links (usada se a API falhar) |
| `js/app.js` | Renderização e visualizador de story; busca os links em `/api/links` |
| `js/track.js` | Contagem anônima de acessos e cliques |
| `admin/` | Painel: login, estatísticas, visitantes e gestão de links |
| `api/` | Funções da Vercel; `api/_lib/` é código compartilhado e não vira rota |
| `db/schema.sql` | Tabelas: `admins`, `login_attempts`, `links` e `events` |
| `scripts/` | Migração, seed, criação de admin e servidor local |
| `vercel.json` | Região (São Paulo), cache e cabeçalhos de segurança |

## Configuração (uma vez)

1. **Variáveis de ambiente.** Copie o `.env.example` para `.env` (que nunca vai para o Git) e preencha:
   - `DATABASE_URL`: a connection string do Neon;
   - `SESSION_SECRET`: uma string aleatória. Gere com `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.
2. **Na Vercel:** cadastre as mesmas duas variáveis em **Settings → Environment Variables**, marcando Production e Preview.
3. **Banco:**
   ```sh
   npm install
   npm run db:migrate      # cria as tabelas (pode rodar de novo sem perder dados)
   npm run db:seed         # copia os links do js/data.js para o banco (não sobrescreve os existentes)
   npm run create-admin    # cria o seu usuário do admin (pede e-mail e senha)
   ```
   Para trocar a senha, rode `npm run create-admin` de novo com o mesmo e-mail. Para remover um usuário, use `npm run create-admin -- --delete email@exemplo.com`.

## Admin (`/admin`)

| Aba | O que mostra |
| --- | --- |
| **Visão geral** | Acessos, visitantes únicos (novos e recorrentes), cliques, cliques por acesso, gráfico diário, cliques por categoria e links mais clicados |
| **Links** | Cliques de cada link (na lista e no botão Acessar dos stories), visitantes que clicaram e taxa |
| **Origem** | Fonte (Instagram, WhatsApp, Google…), campanhas UTM, dispositivo, navegador, sistema, país e cidade |
| **Stories** | Aberturas por categoria, cliques em Acessar e retenção de cada story |
| **Visitantes** | Lista de visitantes anônimos; ao clicar em um, aparece a jornada completa |
| **Gerenciar links** | Criar, editar, ocultar e reordenar links, sem commit. A página pública atualiza em até 1 minuto |

- **Período:** hoje, 7, 30 ou 90 dias, ou datas personalizadas, sempre no fuso de São Paulo.
- **Exportação:** os botões **CSV por link** e **CSV de eventos** geram planilhas separadas por `;`, que abrem direto no Excel.
- **Seus próprios acessos:** na aba **Gerenciar links**, marque "Não contar meus acessos neste navegador" em cada navegador e celular que você usa.

### Medir campanhas
Use parâmetros UTM no link da bio ou das mensagens, por exemplo:
`https://seu-dominio/?utm_source=instagram&utm_medium=bio` ou `?utm_source=whatsapp&utm_campaign=lancamento`.

## Privacidade

- **Visitante:** cada um é identificado só por um ID aleatório guardado no navegador. Nada de nome, e-mail ou IP é registrado.
- **Localização:** país e cidade vêm da própria Vercel.
- **Aviso:** o rodapé da página informa que os acessos são registrados de forma anônima.

## Rodar localmente

```sh
npm run dev   # http://localhost:3000 e http://localhost:3000/admin (usa o .env)
```

## Publicar na Vercel

- **Configuração do projeto:** preset **Other**, sem comando de build, com a raiz como diretório de saída. Cada push na `main` publica.
- **Antes do primeiro deploy com o admin**, cadastre `DATABASE_URL` e `SESSION_SECRET` (veja **Configuração**). Sem essas variáveis, a página pública continua funcionando com os links do `js/data.js`, mas o admin e a contagem não funcionam.
