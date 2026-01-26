-- Create price_alerts table for price notification system
CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
  asset TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('TP', 'SL', 'CUSTOM')),
  target_price DECIMAL(20, 8) NOT NULL,
  current_price DECIMAL(20, 8),
  is_triggered BOOLEAN NOT NULL DEFAULT false,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create watchlist table for tracking favorite pairs
CREATE TABLE public.watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset TEXT NOT NULL,
  notes TEXT,
  last_analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, asset)
);

-- Create user_preferences table for layout customization
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  dashboard_layout JSONB DEFAULT '{"sections": ["upload", "results", "history"]}',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  keyboard_shortcuts_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add leaderboard_opt_in to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS leaderboard_opt_in BOOLEAN DEFAULT false;

-- Enable RLS on all new tables
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for price_alerts
CREATE POLICY "Users can view their own alerts" ON public.price_alerts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own alerts" ON public.price_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON public.price_alerts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own alerts" ON public.price_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for watchlist
CREATE POLICY "Users can view their own watchlist" ON public.watchlist
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their watchlist" ON public.watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their watchlist" ON public.watchlist
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove from their watchlist" ON public.watchlist
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for updating updated_at on user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for chart images
INSERT INTO storage.buckets (id, name, public)
VALUES ('chart-images', 'chart-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chart images
CREATE POLICY "Anyone can view chart images" ON storage.objects
  FOR SELECT USING (bucket_id = 'chart-images');
CREATE POLICY "Authenticated users can upload chart images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chart-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own chart images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'chart-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own chart images" ON storage.objects
  FOR DELETE USING (bucket_id = 'chart-images' AND auth.uid()::text = (storage.foldername(name))[1]);