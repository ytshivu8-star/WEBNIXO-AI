-- ==========================================
-- SUBSCRIPTION PLANS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cost NUMERIC NOT NULL,
  period TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Insert default subscription plans and refill plans
INSERT INTO public.subscription_plans (id, name, cost, period, is_active) VALUES
  ('free', 'Starter Plan', 0, 'forever', true),
  ('monthly', 'Monthly Pass', 49, 'mo', true),
  ('premium', 'Premium Pass', 99, 'mo', true),
  ('yearly', 'Yearly Elite', 499, 'yr', true),
  ('refill_500', '500 Credits', 159, 'one-time', true),
  ('refill_1500', '1500 Credits', 349, 'one-time', true),
  ('refill_3500', '3500 Credits', 599, 'one-time', true),
  ('refill_8000', '8000 Credits', 999, 'one-time', true),
  ('refill_20000', '20000 Credits', 1999, 'one-time', true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  cost = EXCLUDED.cost,
  period = EXCLUDED.period;

-- Set up RLS (Row Level Security)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Drop the old policy name if it exists to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to subscription plans" ON public.subscription_plans;

-- Drop the new policy name if it exists (for clean re-runs)
DROP POLICY IF EXISTS "Public full access to subscription plans" ON public.subscription_plans;

-- Allow anonymous read and write access for admin purposes
CREATE POLICY "Public full access to subscription plans" ON public.subscription_plans FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- PAYMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payments (
  order_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to payments" ON public.payments;
CREATE POLICY "Public full access to payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- USER SUBSCRIPTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  email TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to user_subscriptions" ON public.user_subscriptions;
CREATE POLICY "Public full access to user_subscriptions" ON public.user_subscriptions FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- CONVERSIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.conversions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL,
  conversion_type TEXT NOT NULL,
  conversion_value NUMERIC,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to conversions" ON public.conversions;
CREATE POLICY "Public full access to conversions" ON public.conversions FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- PROFILES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  email TEXT PRIMARY KEY,
  name TEXT,
  theme TEXT,
  credits_remaining NUMERIC,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to profiles" ON public.profiles;
CREATE POLICY "Public full access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- AFFILIATE PROFILES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.webnixo_profiles_affilate (
  email TEXT PRIMARY KEY,
  full_name TEXT,
  referral_code TEXT,
  custom_coupon_code TEXT,
  stats JSONB,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.webnixo_profiles_affilate ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to webnixo_profiles_affilate" ON public.webnixo_profiles_affilate;
CREATE POLICY "Public full access to webnixo_profiles_affilate" ON public.webnixo_profiles_affilate FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- AFFILIATE EVENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.webnixo_events_affilate (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  type TEXT NOT NULL,
  details TEXT,
  commission NUMERIC,
  timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.webnixo_events_affilate ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to webnixo_events_affilate" ON public.webnixo_events_affilate;
CREATE POLICY "Public full access to webnixo_events_affilate" ON public.webnixo_events_affilate FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- COUPONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.coupons (
  code TEXT PRIMARY KEY,
  discount_percent NUMERIC NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to coupons" ON public.coupons;
CREATE POLICY "Public full access to coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- COUPON USAGES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  coupon_code TEXT NOT NULL,
  plan_id TEXT,
  original_price NUMERIC,
  discounted_price NUMERIC,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to coupon_usages" ON public.coupon_usages;
CREATE POLICY "Public full access to coupon_usages" ON public.coupon_usages FOR ALL USING (true) WITH CHECK (true);
