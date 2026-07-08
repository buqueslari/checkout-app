# Deploy do checkout-app

Este é um projeto novo e separado do `workspace` (Gestore) e do `site`
(landing page) que já existem neste repositório. Ele também precisa do seu
próprio projeto na Vercel e do seu próprio banco Postgres (Neon).

## 1. Criar o banco no Neon

1. Crie um projeto em https://neon.tech (ou use **Storage → Create Database
   → Postgres** dentro do próprio dashboard da Vercel, que usa o Neon por
   trás).
2. Copie a `DATABASE_URL` gerada (formato
   `postgres://usuario:senha@host/banco?sslmode=require`).

## 2. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | a connection string do Neon |
| `AUTH_SECRET` | string aleatória forte (ex: `openssl rand -base64 32`) |
| `BLOB_READ_WRITE_TOKEN` | opcional — só se for usar upload de logo pelo admin em vez de colar uma URL de imagem |
| `NEXT_PUBLIC_APP_URL` | URL final do checkout (ex: `https://pagamento.suaempresa.com.br`) |

## 3. Rodar as migrations e o seed

```bash
cd checkout-app
npm install
npx prisma migrate dev --name init
npx prisma db seed
```

O seed cria:
- Admin de demonstração: **admin@checkout.com** / **mudaressasenha123**
  (troque a senha assim que entrar — ainda não existe tela de troca de senha
  no painel, peça pra eu adicionar se quiser).
- Um produto de exemplo (`/checkout/plano-mensal`) e um link avulso de
  exemplo (`/pagar/demo123`) — apague os dois pela tela de admin depois de
  conferir que tudo funciona.

## 4. Novo projeto na Vercel

Este projeto (`checkout-app`) tem **repositório git próprio**, separado do
`workspace` e do `site` — não é uma subpasta de um monorepo. Então:

1. Dentro da pasta `checkout-app`, rode `git init`, `git add .`,
   `git commit -m "checkout-app inicial"` (se ainda não tiver feito).
2. Crie um repositório novo e vazio no GitHub (ex: `checkout-app`) e suba:
   `git remote add origin <url-do-repo>` → `git push -u origin main`.
3. Na Vercel → **Add New Project** → selecione esse repositório.
4. **Root Directory**: deixe em branco / `.` (o repositório JÁ é a raiz do
   projeto — não aponte para `checkout-app`, senão o build procura os
   arquivos em `checkout-app/checkout-app/` e dá erro de
   "Could not load schema from .../prisma/schema.prisma").
5. **Build command**: `npx prisma migrate deploy && next build` (garante que
   toda migration pendente é aplicada antes do build).
6. Adicione as variáveis de ambiente da seção 2 nas **Settings →
   Environment Variables** desse projeto na Vercel.
7. Deploy.

## 5. Testando o fluxo (ainda em modo de teste)

- Acesse `/login`, entre com o admin, cadastre um produto em
  **Produtos** e/ou gere um link avulso em **Links avulsos**.
- Abra o link gerado (`/checkout/[slug]` ou `/pagar/[code]`), clique em
  **"Gerar cartão de teste"** pra preencher o formulário com dados
  fictícios, e envie. O pedido aparece em **Pedidos** no admin.
- Nada disso chama nenhum serviço externo — é só pra validar o fluxo visual
  e o cadastro de produtos/links antes de existir qualquer gateway real.

## 6. Conectando um gateway de pagamento de verdade (quando sair do teste)

**Importante entender antes de mexer em qualquer código:** o jeito como o
checkout está hoje (campos de cartão soltos, enviados direto pro nosso
próprio servidor) só é seguro porque nenhum número de cartão real passa por
ali de verdade e nada é armazenado. Pra cobrar de verdade, **não dá pra
simplesmente trocar o "aprovar sempre" por uma chamada de cobrança usando
esses mesmos campos** — isso faria o número do cartão do cliente passar (e
possivelmente ficar em log) pelo seu servidor, o que joga o negócio no
escopo mais pesado de conformidade PCI-DSS (SAQ D — auditoria cara e
complexa).

O caminho correto, usado por qualquer checkout sério, é usar os **campos
tokenizados/hospedados** que o próprio gateway fornece — eles podem ser
estilizados pra ficar visualmente idênticos aos campos de "Número do
cartão", "Validade" e "CVV" que já existem aqui, mas o número do cartão
nunca passa pelo seu servidor (ele vai direto, criptografado, do navegador
do cliente pro gateway). Isso mantém o negócio no escopo leve (SAQ A).

Opções mais comuns pro Brasil:
- **Stripe** (Stripe Elements / Payment Element) — internacional, boa
  documentação, aceita cartão internacional também.
- **Mercado Pago** (Bricks / Card Payment Brick) — forte no Brasil, Pix e
  boleto também disponíveis se quiser expandir depois.
- **PagBank / PagSeguro** (Checkout Transparente) ou **Asaas** — outras
  opções nacionais com o mesmo modelo de campos tokenizados.

Passo a passo pra fazer a troca:

1. Criar conta no gateway escolhido e pegar as chaves de API (publicável +
   secreta).
2. Adicionar as chaves como variáveis de ambiente (ex: `STRIPE_SECRET_KEY`,
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
3. No `src/components/checkout-form.tsx`, trocar os `<input>` soltos de
   número/validade/CVV pelos componentes tokenizados do SDK do gateway
   (ex: `PaymentElement` do Stripe) — o botão "Gerar cartão de teste" some
   nessa troca, porque passa a existir validação de cartão de verdade feita
   pelo próprio gateway.
4. Em `src/app/actions/checkout.ts`, trocar a lógica de "sempre aprova" por
   uma chamada real ao gateway (criar um Payment Intent/Charge com o token
   recebido do front) e usar o resultado retornado (aprovado/recusado) pra
   decidir o `status` do `Order`.
5. Criar uma rota de webhook (ex: `src/app/api/stripe/webhook/route.ts`) que
   recebe a confirmação assíncrona do gateway e atualiza o `Order` — sem
   isso, cobranças que demoram a confirmar (ex: 3D Secure) nunca fecham o
   pedido no seu banco.
6. Testar tudo com as chaves de **teste/sandbox** do gateway antes de trocar
   pelas chaves de produção.

Se quiser, posso fazer essa integração com o gateway que vocês escolherem
assim que tiverem a conta criada — é só chamar.
