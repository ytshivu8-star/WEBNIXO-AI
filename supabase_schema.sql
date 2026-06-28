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
