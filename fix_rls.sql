-- Enable RLS on Envelopes
ALTER TABLE public.envelopes ENABLE ROW LEVEL SECURITY;

-- Policy for Select
CREATE POLICY "Users can see own envelopes" ON public.envelopes
FOR SELECT
TO authenticated
USING (auth.uid() = "userId");

-- Policy for Insert
CREATE POLICY "Users can insert own envelopes" ON public.envelopes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = "userId");

-- Policy for Update
CREATE POLICY "Users can update own envelopes" ON public.envelopes
FOR UPDATE
TO authenticated
USING (auth.uid() = "userId");

-- Policy for Delete
CREATE POLICY "Users can delete own envelopes" ON public.envelopes
FOR DELETE
TO authenticated
USING (auth.uid() = "userId");

-- Grant access to authenticated role
GRANT ALL ON TABLE public.envelopes TO authenticated;
GRANT ALL ON TABLE public.users TO authenticated;
