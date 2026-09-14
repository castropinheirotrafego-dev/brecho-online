-- Perfis de usuário (espelham auth.users). is_admin identifica o administrador do closet.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Perfis são públicos para leitura"
  on public.profiles for select
  using (true);

create policy "Usuário edita o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Usuário cria o próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Cria o perfil automaticamente no cadastro, usando os metadados enviados no signUp
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Função auxiliar para checar se o usuário logado é admin (evita recursão de RLS)
create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Peças do closet
create type public.item_type as enum (
  'conjuntos', 'jaquetas-casacos', 'vestidos', 'blusas-camisetas', 'camisas',
  'shorts', 'saias', 'calcas', 'sapatos', 'tenis', 'botas', 'bolsas'
);
create type public.item_category as enum ('adulto', 'infantil');
create type public.item_status as enum ('available', 'negotiating', 'reserved', 'sold');
create type public.item_condition as enum ('novo', 'seminovo', 'usado');

create table public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.item_type not null,
  category public.item_category not null default 'adulto',
  condition public.item_condition not null default 'seminovo',
  size text,
  price numeric(10, 2) not null check (price >= 0),
  description text,
  status public.item_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index items_status_idx on public.items (status);
create index items_type_idx on public.items (type);
create index items_category_idx on public.items (category);

alter table public.items enable row level security;

create policy "Peças disponíveis são públicas, admin vê tudo, envolvidos veem a sua"
  on public.items for select
  using (
    status = 'available'
    or public.is_admin()
    or exists (select 1 from public.offers o where o.item_id = items.id and o.buyer_id = auth.uid())
    or exists (select 1 from public.orders ord where ord.item_id = items.id and ord.buyer_id = auth.uid())
  );

create policy "Admin gerencia as peças"
  on public.items for all
  using (public.is_admin())
  with check (public.is_admin());

-- Fotos das peças
create table public.item_images (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  storage_path text not null,
  position int not null default 0
);

alter table public.item_images enable row level security;

create policy "Fotos visíveis junto com a peça"
  on public.item_images for select
  using (
    exists (
      select 1 from public.items i
      where i.id = item_id
        and (
          i.status = 'available'
          or public.is_admin()
          or exists (select 1 from public.offers o where o.item_id = i.id and o.buyer_id = auth.uid())
          or exists (select 1 from public.orders ord where ord.item_id = i.id and ord.buyer_id = auth.uid())
        )
    )
  );

create policy "Admin gerencia as fotos"
  on public.item_images for all
  using (public.is_admin())
  with check (public.is_admin());

-- Carrinho (compra direta, sem negociação)
create table public.cart_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

alter table public.cart_items enable row level security;

create policy "Usuário gerencia o próprio carrinho"
  on public.cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Pedidos (gerados no checkout do carrinho ou ao fechar uma negociação)
create type public.order_status as enum ('pending_delivery', 'completed', 'cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id),
  buyer_id uuid not null references public.profiles(id),
  price numeric(10, 2) not null,
  status public.order_status not null default 'pending_delivery',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Comprador e admin veem o pedido"
  on public.orders for select
  using (auth.uid() = buyer_id or public.is_admin());

create policy "Comprador ou admin criam pedidos"
  on public.orders for insert
  with check (auth.uid() = buyer_id or public.is_admin());

create policy "Admin atualiza pedidos"
  on public.orders for update
  using (public.is_admin());

-- Negociações (ofertas) sobre uma peça
create type public.offer_status as enum ('pending', 'accepted', 'rejected', 'cancelled');
create type public.offer_round_author as enum ('buyer', 'admin');

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  status public.offer_status not null default 'pending',
  last_amount numeric(10, 2) not null,
  last_author public.offer_round_author not null default 'buyer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.offers enable row level security;

create policy "Comprador e admin veem a oferta"
  on public.offers for select
  using (auth.uid() = buyer_id or public.is_admin());

create policy "Comprador cria oferta"
  on public.offers for insert
  with check (auth.uid() = buyer_id);

create policy "Comprador e admin atualizam a oferta"
  on public.offers for update
  using (auth.uid() = buyer_id or public.is_admin());

-- Histórico de rodadas de uma negociação (proposta, contraproposta, etc.)
create table public.offer_rounds (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  author public.offer_round_author not null,
  amount numeric(10, 2) not null,
  message text,
  created_at timestamptz not null default now()
);

alter table public.offer_rounds enable row level security;

create policy "Participantes veem as rodadas"
  on public.offer_rounds for select
  using (
    exists (
      select 1 from public.offers o
      where o.id = offer_id and (o.buyer_id = auth.uid() or public.is_admin())
    )
  );

create policy "Participantes inserem rodadas"
  on public.offer_rounds for insert
  with check (
    exists (
      select 1 from public.offers o
      where o.id = offer_id and (o.buyer_id = auth.uid() or public.is_admin())
    )
  );

-- Storage bucket para fotos das peças
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

create policy "Fotos das peças são públicas"
  on storage.objects for select
  using (bucket_id = 'item-photos');

create policy "Admin envia fotos"
  on storage.objects for insert
  with check (bucket_id = 'item-photos' and public.is_admin());

create policy "Admin apaga fotos"
  on storage.objects for delete
  using (bucket_id = 'item-photos' and public.is_admin());

-- Storage bucket para fotos de perfil (cada usuário só mexe na própria pasta)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatares são públicos para leitura"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Usuário envia seu próprio avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Usuário atualiza seu próprio avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Usuário remove seu próprio avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ==========================================================================
-- Funções de negócio (security definer): garantem atomicidade e evitam que
-- duas pessoas comprem/negociem a mesma peça ao mesmo tempo.
-- ==========================================================================

-- Cancela automaticamente outras ofertas pendentes de uma peça quando ela é reservada por outro meio
create function public.cancel_other_pending_offers(p_item_id uuid, p_exclude_offer_id uuid default null)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  rec record;
begin
  for rec in
    select id from public.offers
    where item_id = p_item_id
      and status = 'pending'
      and (p_exclude_offer_id is null or id <> p_exclude_offer_id)
  loop
    update public.offers set status = 'cancelled', updated_at = now() where id = rec.id;
    insert into public.offer_rounds (offer_id, author, amount, message)
    values (rec.id, 'admin', (select last_amount from public.offers where id = rec.id), 'Peça vendida por outro meio');
  end loop;
end;
$$;

-- Finaliza a compra direta de todas as peças disponíveis no carrinho do usuário
create function public.checkout_cart()
returns setof public.orders
language plpgsql
security definer set search_path = public
as $$
declare
  rec record;
  new_order public.orders;
begin
  for rec in
    select i.id as item_id, i.price
    from public.cart_items c
    join public.items i on i.id = c.item_id
    where c.user_id = auth.uid()
    for update of i
  loop
    if (select status from public.items where id = rec.item_id) <> 'available' then
      continue;
    end if;

    update public.items set status = 'reserved', updated_at = now() where id = rec.item_id;

    insert into public.orders (item_id, buyer_id, price, status)
    values (rec.item_id, auth.uid(), rec.price, 'pending_delivery')
    returning * into new_order;

    delete from public.cart_items where user_id = auth.uid() and item_id = rec.item_id;
    perform public.cancel_other_pending_offers(rec.item_id);

    return next new_order;
  end loop;
  return;
end;
$$;

-- Compra direta e imediata de uma única peça (botão "Comprar" na tela do item)
create function public.buy_now(p_item_id uuid)
returns public.orders
language plpgsql
security definer set search_path = public
as $$
declare
  new_order public.orders;
  item_price numeric(10, 2);
begin
  select price into item_price from public.items where id = p_item_id for update;

  if (select status from public.items where id = p_item_id) <> 'available' then
    raise exception 'Peça indisponível';
  end if;

  update public.items set status = 'reserved', updated_at = now() where id = p_item_id;

  insert into public.orders (item_id, buyer_id, price, status)
  values (p_item_id, auth.uid(), item_price, 'pending_delivery')
  returning * into new_order;

  delete from public.cart_items where item_id = p_item_id and user_id = auth.uid();
  perform public.cancel_other_pending_offers(p_item_id);

  return new_order;
end;
$$;

-- Comprador cria uma proposta (oferta) para uma peça disponível
create function public.create_offer(p_item_id uuid, p_amount numeric, p_message text default null)
returns public.offers
language plpgsql
security definer set search_path = public
as $$
declare
  new_offer public.offers;
begin
  if (select status from public.items where id = p_item_id) <> 'available' then
    raise exception 'Peça indisponível';
  end if;

  insert into public.offers (item_id, buyer_id, status, last_amount, last_author)
  values (p_item_id, auth.uid(), 'pending', p_amount, 'buyer')
  returning * into new_offer;

  insert into public.offer_rounds (offer_id, author, amount, message)
  values (new_offer.id, 'buyer', p_amount, p_message);

  update public.items set status = 'negotiating', updated_at = now() where id = p_item_id;

  return new_offer;
end;
$$;

-- Admin responde a uma oferta: aceitar, recusar ou contrapropor
create function public.admin_respond_offer(
  p_offer_id uuid,
  p_action text,
  p_amount numeric default null,
  p_message text default null
)
returns public.offers
language plpgsql
security definer set search_path = public
as $$
declare
  o public.offers;
  updated public.offers;
begin
  if not public.is_admin() then
    raise exception 'Apenas o administrador pode responder ofertas';
  end if;

  select * into o from public.offers where id = p_offer_id for update;
  if o.status <> 'pending' then
    raise exception 'Esta negociação já foi encerrada';
  end if;

  if p_action = 'accept' then
    if (select status from public.items where id = o.item_id) not in ('available', 'negotiating') then
      raise exception 'Esta peça já foi vendida ou reservada por outra via. Recuse esta oferta para encerrá-la.';
    end if;

    update public.items set status = 'reserved', updated_at = now() where id = o.item_id;
    insert into public.orders (item_id, buyer_id, price, status)
    values (o.item_id, o.buyer_id, o.last_amount, 'pending_delivery');

    update public.offers set status = 'accepted', updated_at = now() where id = p_offer_id
    returning * into updated;
    insert into public.offer_rounds (offer_id, author, amount, message)
    values (p_offer_id, 'admin', o.last_amount, coalesce(p_message, 'Oferta aceita'));

    perform public.cancel_other_pending_offers(o.item_id, p_offer_id);

  elsif p_action = 'reject' then
    update public.offers set status = 'rejected', updated_at = now() where id = p_offer_id
    returning * into updated;
    insert into public.offer_rounds (offer_id, author, amount, message)
    values (p_offer_id, 'admin', o.last_amount, coalesce(p_message, 'Oferta recusada'));
    if (select status from public.items where id = o.item_id) = 'negotiating' then
      update public.items set status = 'available', updated_at = now() where id = o.item_id;
    end if;

  elsif p_action = 'counter' then
    if p_amount is null then
      raise exception 'Informe o valor da contraproposta';
    end if;
    update public.offers
    set last_amount = p_amount, last_author = 'admin', updated_at = now()
    where id = p_offer_id
    returning * into updated;
    insert into public.offer_rounds (offer_id, author, amount, message)
    values (p_offer_id, 'admin', p_amount, p_message);

  else
    raise exception 'Ação inválida';
  end if;

  return updated;
end;
$$;

-- Comprador responde a uma contraproposta do admin: aceitar ou desistir
create function public.buyer_respond_offer(p_offer_id uuid, p_action text)
returns public.offers
language plpgsql
security definer set search_path = public
as $$
declare
  o public.offers;
  updated public.offers;
begin
  select * into o from public.offers where id = p_offer_id for update;
  if o.buyer_id <> auth.uid() then
    raise exception 'Sem permissão';
  end if;
  if o.status <> 'pending' then
    raise exception 'Esta negociação já foi encerrada';
  end if;

  if p_action = 'accept' then
    if o.last_author <> 'admin' then
      raise exception 'Aguarde a resposta da administradora';
    end if;
    if (select status from public.items where id = o.item_id) not in ('available', 'negotiating') then
      raise exception 'Esta peça já foi vendida ou reservada por outra via. Desista da negociação para encerrá-la.';
    end if;

    update public.items set status = 'reserved', updated_at = now() where id = o.item_id;
    insert into public.orders (item_id, buyer_id, price, status)
    values (o.item_id, o.buyer_id, o.last_amount, 'pending_delivery');

    update public.offers set status = 'accepted', updated_at = now() where id = p_offer_id
    returning * into updated;
    insert into public.offer_rounds (offer_id, author, amount, message)
    values (p_offer_id, 'buyer', o.last_amount, 'Contraproposta aceita');

    perform public.cancel_other_pending_offers(o.item_id, p_offer_id);

  elsif p_action = 'cancel' then
    update public.offers set status = 'cancelled', updated_at = now() where id = p_offer_id
    returning * into updated;
    insert into public.offer_rounds (offer_id, author, amount, message)
    values (p_offer_id, 'buyer', o.last_amount, 'Comprador desistiu');
    if (select status from public.items where id = o.item_id) = 'negotiating' then
      update public.items set status = 'available', updated_at = now() where id = o.item_id;
    end if;

  else
    raise exception 'Ação inválida';
  end if;

  return updated;
end;
$$;

-- Admin reativa (entrega não ocorreu) ou finaliza (entrega/pagamento ocorreram) um pedido
create function public.admin_finish_order(p_order_id uuid, p_action text)
returns public.orders
language plpgsql
security definer set search_path = public
as $$
declare
  ord public.orders;
  updated public.orders;
begin
  if not public.is_admin() then
    raise exception 'Apenas o administrador pode gerenciar pedidos';
  end if;

  select * into ord from public.orders where id = p_order_id for update;
  if ord.status <> 'pending_delivery' then
    raise exception 'Este pedido já foi encerrado';
  end if;

  if p_action = 'reactivate' then
    update public.orders set status = 'cancelled' where id = p_order_id returning * into updated;
    update public.items set status = 'available', updated_at = now() where id = ord.item_id;

  elsif p_action = 'complete' then
    update public.orders set status = 'completed' where id = p_order_id returning * into updated;
    update public.items set status = 'sold', updated_at = now() where id = ord.item_id;

  else
    raise exception 'Ação inválida';
  end if;

  return updated;
end;
$$;
