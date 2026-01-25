-- Enable RLS on Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy for Select
CREATE POLICY "Users can see own transactions" ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = "userId");

-- Policy for Insert
CREATE POLICY "Users can insert own transactions" ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = "userId");

-- Policy for Update
CREATE POLICY "Users can update own transactions" ON public.transactions
FOR UPDATE
TO authenticated
USING (auth.uid() = "userId");

-- Policy for Delete
CREATE POLICY "Users can delete own transactions" ON public.transactions
FOR DELETE
TO authenticated
USING (auth.uid() = "userId");

-- Grant access
GRANT ALL ON TABLE public.transactions TO authenticated;
