-- ==========================================
-- SECTION 1: CORE APPLICATION TABLES
-- ==========================================

-- 1. Create Core Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    theme TEXT DEFAULT 'dark',
    plan TEXT DEFAULT 'free',
    credits_remaining INTEGER DEFAULT 30,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS and setup policies safely
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to profiles" ON public.profiles;
CREATE POLICY "Public full access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);


-- 2. Create Core Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    order_id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL,
    payment_session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS and setup policies safely
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to payments" ON public.payments;
CREATE POLICY "Public full access to payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);


-- 3. Create Core User Subscriptions Table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    email TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    order_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS and setup policies safely
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to user_subscriptions" ON public.user_subscriptions;
CREATE POLICY "Public full access to user_subscriptions" ON public.user_subscriptions FOR ALL USING (true) WITH CHECK (true);


-- 4. Create Core Conversions Table
CREATE TABLE IF NOT EXISTS public.conversions (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    conversion_type TEXT NOT NULL,
    conversion_value NUMERIC DEFAULT 0,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS and setup policies safely
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to conversions" ON public.conversions;
CREATE POLICY "Public full access to conversions" ON public.conversions FOR ALL USING (true) WITH CHECK (true);


-- ==========================================
-- SECTION 2: WEBNIXO AFFILIATE SYSTEM TABLES
-- ==========================================

-- 1. Create Profiles Affiliate Table (webnixo_profiles_affilate)
CREATE TABLE IF NOT EXISTS public.webnixo_profiles_affilate (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    full_name TEXT NOT NULL,
    phone TEXT,
    company_name TEXT,
    website TEXT,
    promo_strategy TEXT,
    country TEXT,
    is_registered BOOLEAN DEFAULT false,
    referral_code TEXT UNIQUE,
    custom_coupon_code TEXT,
    joined_at TEXT,
    is_admin BOOLEAN DEFAULT false,
    stats JSONB DEFAULT '{"clicks":0,"signups":0,"sales":0,"commissionEarned":0,"unpaidCommission":0,"payoutStatus":"None"}'::jsonb,
    payout_details JSONB DEFAULT '{"payoutMethod":"upi","upiId":"","bankName":"","accountNumber":"","accountHolderName":"","ifscCode":""}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS and setup policies safely
ALTER TABLE public.webnixo_profiles_affilate ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to profiles" ON public.webnixo_profiles_affilate;
CREATE POLICY "Public full access to profiles" ON public.webnixo_profiles_affilate FOR ALL USING (true) WITH CHECK (true);


-- 2. Create Events Affiliate Table (webnixo_events_affilate)
CREATE TABLE IF NOT EXISTS public.webnixo_events_affilate (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    type TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    commission NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS and setup policies safely
ALTER TABLE public.webnixo_events_affilate ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to events" ON public.webnixo_events_affilate;
CREATE POLICY "Public full access to events" ON public.webnixo_events_affilate FOR ALL USING (true) WITH CHECK (true);


-- 3. Create Payout History Affiliate Table (webnixo_payout_history_affilate)
CREATE TABLE IF NOT EXISTS public.webnixo_payout_history_affilate (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date TEXT NOT NULL,
    method TEXT NOT NULL,
    destination TEXT NOT NULL,
    status TEXT NOT NULL,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS and setup policies safely
ALTER TABLE public.webnixo_payout_history_affilate ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to payout history" ON public.webnixo_payout_history_affilate;
CREATE POLICY "Public full access to payout history" ON public.webnixo_payout_history_affilate FOR ALL USING (true) WITH CHECK (true);


-- 4. Create Settings Affiliate Table (webnixo_settings_affilate)
CREATE TABLE IF NOT EXISTS public.webnixo_settings_affilate (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS and setup policies safely
ALTER TABLE public.webnixo_settings_affilate ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to settings" ON public.webnixo_settings_affilate;
CREATE POLICY "Public full access to settings" ON public.webnixo_settings_affilate FOR ALL USING (true) WITH CHECK (true);


-- 5. Create OTP Affiliate Table (webnixo_otps_affilate)
CREATE TABLE IF NOT EXISTS public.webnixo_otps_affilate (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    purpose TEXT NOT NULL,
    verified BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS and setup policies safely
ALTER TABLE public.webnixo_otps_affilate ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to otps" ON public.webnixo_otps_affilate;
CREATE POLICY "Public full access to otps" ON public.webnixo_otps_affilate FOR ALL USING (true) WITH CHECK (true);


-- ==========================================
-- SECTION 3: SEED DEFAULT DATA
-- ==========================================

-- Insert Initial Default Settings for Affiliate System
INSERT INTO public.webnixo_settings_affilate (key, value) VALUES
('commission_rate', '20'),
('min_payout', '1000'),
('comm_199', '39.80'),
('comm_499', '99.80'),
('comm_999', '199.80'),
('admin_password', '123456')
ON CONFLICT (key) DO NOTHING;


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
-- COUPONS & USAGES
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

CREATE TABLE IF NOT EXISTS public.coupon_usages (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    email TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    original_price NUMERIC NOT NULL,
    discounted_price NUMERIC NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to coupon_usages" ON public.coupon_usages;
CREATE POLICY "Public full access to coupon_usages" ON public.coupon_usages FOR ALL USING (true) WITH CHECK (true);


-- ==========================================
-- MODEL PRICES (For Landing Page)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.model_prices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cost NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT true
);

INSERT INTO public.model_prices (id, name, cost, is_active) VALUES
('chatgpt', 'ChatGPT Plus', 2000, true),
('claude', 'Claude Pro', 2000, true),
('grok', 'Grok', 1500, true),
('perplexity', 'Perplexity Pro', 2000, true),
('mistral', 'Mistral Large', 1800, true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.model_prices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access to model_prices" ON public.model_prices;
CREATE POLICY "Public full access to model_prices" ON public.model_prices FOR ALL USING (true) WITH CHECK (true);

