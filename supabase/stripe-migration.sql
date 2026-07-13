-- Migração Stripe — rode no SQL Editor do Supabase (após schema.sql)
-- Adiciona campos de assinatura na tabela profiles

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text,
  add column if not exists premium_source text default 'free'
    check (premium_source in ('free', 'promo', 'stripe'));

create index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id);

create index if not exists profiles_stripe_subscription_id_idx
  on public.profiles (stripe_subscription_id);
