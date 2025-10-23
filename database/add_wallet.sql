-- Wallet items for watch/own relations
create table if not exists public.wallet_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete cascade,
  relation text check (relation in ('watch', 'own')) not null default 'watch',
  created_at timestamptz default now()
);

create unique index if not exists wallet_unique on public.wallet_items (user_id, asset_id, relation);

alter table public.wallet_items enable row level security;

create policy "Users view own wallet" on public.wallet_items
  for select using (auth.uid() = user_id);

create policy "Users insert own wallet" on public.wallet_items
  for insert with check (auth.uid() = user_id);

create policy "Users delete own wallet" on public.wallet_items
  for delete using (auth.uid() = user_id);

