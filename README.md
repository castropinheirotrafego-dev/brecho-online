# Meu Closet

Site para vender roupas, sapatos e bolsas usadas, com um único administrador (você) publicando as peças e clientes comprando direto ou negociando o preço. Feito com React + Vite + Tailwind no front e Supabase (Postgres, Auth, Storage) no backend.

## Como funciona

- Qualquer pessoa se cadastra (nome, e-mail, telefone e senha) e faz login. A sessão fica salva no navegador — fechar e reabrir o site mantém o usuário logado.
- O catálogo mostra as peças disponíveis, com filtro por tipo (roupa/sapato/bolsa), tamanho e preço máximo.
- Na página da peça, o cliente pode **Comprar** (vai para o carrinho, com pagamento pessoal na entrega) ou **Fazer uma oferta** (abre uma negociação).
- Toda oferta aparece para o admin em **Ofertas recebidas**, com um contador de pendentes no menu. O admin pode aceitar, recusar ou fazer uma contraproposta; a contraproposta volta para o cliente aceitar ou desistir, no perfil dele.
- Ao fechar uma compra (direta ou por oferta aceita), a peça some do catálogo (fica "reservada") e um pedido é criado em **Pedidos**, aguardando a entrega/pagamento pessoal.
- No pedido, o admin confirma se a entrega ocorreu (peça marcada como vendida, saindo do catálogo definitivamente) ou reativa a peça no catálogo, caso não tenha ocorrido.
- O admin cadastra peças em **Admin → Publicar peça**, com nome, tipo, tamanho, preço, descrição e até 6 fotos.

## Como rodar

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No SQL Editor do projeto, rode o conteúdo de `supabase/migrations/0001_init.sql`.
3. Copie `.env.example` para `.env` e preencha com a URL e a chave anônima do projeto (Project Settings → API).
4. Instale as dependências e suba o servidor:

```bash
npm install
npm run dev
```

5. Abra `http://localhost:5173`, crie sua própria conta pela tela de cadastro.
6. Torne essa conta administradora rodando no SQL Editor do Supabase (troque pelo seu e-mail):

```sql
update public.profiles set is_admin = true where email = 'seu-email@exemplo.com';
```

7. Recarregue o site logado — o menu **Admin** vai aparecer para publicar peças, ver ofertas e gerenciar pedidos.

## Estrutura

- `src/routes` — Home (catálogo), detalhe da peça, carrinho, login/cadastro, perfil (minhas ofertas e pedidos)
- `src/routes/admin` — publicar/gerenciar peças, ofertas recebidas, pedidos
- `src/contexts/AuthContext.tsx` — autenticação e perfil (com flag `is_admin`)
- `src/lib/supabase.ts` — cliente Supabase
- `supabase/migrations/0001_init.sql` — schema (tabelas, RLS, bucket de fotos) e funções de negócio (`checkout_cart`, `create_offer`, `admin_respond_offer`, `buyer_respond_offer`, `admin_finish_order`) que garantem que duas pessoas não comprem a mesma peça ao mesmo tempo
