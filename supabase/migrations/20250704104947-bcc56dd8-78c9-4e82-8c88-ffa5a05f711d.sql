
-- Add user_id column to posters table to link posters to users
ALTER TABLE public.posters ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security on posters table
ALTER TABLE public.posters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies so users can only see and manage their own posters
CREATE POLICY "Users can view their own posters" 
  ON public.posters 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posters" 
  ON public.posters 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posters" 
  ON public.posters 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posters" 
  ON public.posters 
  FOR DELETE 
  USING (auth.uid() = user_id);
