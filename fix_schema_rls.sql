-- Enable RLS on all tables
ALTER TABLE public.envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Envelopes (CamelCase userId)
DROP POLICY IF EXISTS "Users can see own envelopes" ON public.envelopes;
CREATE POLICY "Users can see own envelopes" ON public.envelopes FOR SELECT TO authenticated USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Users can insert own envelopes" ON public.envelopes;
CREATE POLICY "Users can insert own envelopes" ON public.envelopes FOR INSERT TO authenticated WITH CHECK (auth.uid() = "userId");

DROP POLICY IF EXISTS "Users can update own envelopes" ON public.envelopes;
CREATE POLICY "Users can update own envelopes" ON public.envelopes FOR UPDATE TO authenticated USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Users can delete own envelopes" ON public.envelopes;
CREATE POLICY "Users can delete own envelopes" ON public.envelopes FOR DELETE TO authenticated USING (auth.uid() = "userId");

-- Transactions (CamelCase userId)
DROP POLICY IF EXISTS "Users can see own transactions" ON public.transactions;
CREATE POLICY "Users can see own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = "userId");

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE TO authenticated USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE TO authenticated USING (auth.uid() = "userId");

-- Categories (CamelCase userId - assumed private per user)
DROP POLICY IF EXISTS "Users can see own categories" ON public.categories;
CREATE POLICY "Users can see own categories" ON public.categories FOR SELECT TO authenticated USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (auth.uid() = "userId");

-- Accounts (Snake Case user_id)
DROP POLICY IF EXISTS "Users can see own accounts" ON public.accounts;
CREATE POLICY "Users can see own accounts" ON public.accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own accounts" ON public.accounts;
CREATE POLICY "Users can insert own accounts" ON public.accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own accounts" ON public.accounts;
CREATE POLICY "Users can update own accounts" ON public.accounts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own accounts" ON public.accounts;
CREATE POLICY "Users can delete own accounts" ON public.accounts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Holdings (Linked to Accounts)
DROP POLICY IF EXISTS "Users can see own holdings" ON public.holdings;
CREATE POLICY "Users can see own holdings" ON public.holdings FOR SELECT TO authenticated USING (
    account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can insert own holdings" ON public.holdings;
CREATE POLICY "Users can insert own holdings" ON public.holdings FOR INSERT TO authenticated WITH CHECK (
    account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update own holdings" ON public.holdings;
CREATE POLICY "Users can update own holdings" ON public.holdings FOR UPDATE TO authenticated USING (
    account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can delete own holdings" ON public.holdings;
CREATE POLICY "Users can delete own holdings" ON public.holdings FOR DELETE TO authenticated USING (
    account_id IN (SELECT id FROM public.accounts WHERE user_id = auth.uid())
);

-- User Portfolios (CamelCase userId)
DROP POLICY IF EXISTS "Users can see own portfolio" ON public.user_portfolios;
CREATE POLICY "Users can see own portfolio" ON public.user_portfolios FOR SELECT TO authenticated USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Users can insert own portfolio" ON public.user_portfolios;
CREATE POLICY "Users can insert own portfolio" ON public.user_portfolios FOR INSERT TO authenticated WITH CHECK (auth.uid() = "userId");

DROP POLICY IF EXISTS "Users can update own portfolio" ON public.user_portfolios;
CREATE POLICY "Users can update own portfolio" ON public.user_portfolios FOR UPDATE TO authenticated USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Users can delete own portfolio" ON public.user_portfolios;
CREATE POLICY "Users can delete own portfolio" ON public.user_portfolios FOR DELETE TO authenticated USING (auth.uid() = "userId");

-- Users (Profile table)
DROP POLICY IF EXISTS "Users can see own profile" ON public.users;
CREATE POLICY "Users can see own profile" ON public.users FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Assets (Investment Products - Public Read)
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read assets" ON public.assets;
CREATE POLICY "Public read assets" ON public.assets FOR SELECT TO authenticated USING (true);
