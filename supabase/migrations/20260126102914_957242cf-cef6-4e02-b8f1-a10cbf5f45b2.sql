-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.analyses;

-- Create a new secure SELECT policy that only allows users to view their own analyses
CREATE POLICY "Users can view their own analyses" 
ON public.analyses 
FOR SELECT 
USING (auth.uid() = user_id);

-- Also ensure the INSERT policy requires a valid user_id
DROP POLICY IF EXISTS "Users can insert their own analyses" ON public.analyses;

CREATE POLICY "Users can insert their own analyses" 
ON public.analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);