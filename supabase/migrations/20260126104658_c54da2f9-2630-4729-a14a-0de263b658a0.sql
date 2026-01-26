-- Create a secure function to get leaderboard statistics
-- This aggregates data server-side, only for users who opted in
-- Using SECURITY DEFINER to bypass RLS and return aggregated stats
CREATE OR REPLACE FUNCTION public.get_leaderboard_stats()
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  win_count BIGINT,
  loss_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.user_id,
    COALESCE(p.display_name, 'Anonymous Trader') as display_name,
    COUNT(*) FILTER (WHERE a.outcome = 'WIN') as win_count,
    COUNT(*) FILTER (WHERE a.outcome = 'LOSS') as loss_count
  FROM analyses a
  INNER JOIN profiles p ON a.user_id = p.user_id
  WHERE p.leaderboard_opt_in = true
    AND a.outcome IN ('WIN', 'LOSS')
    AND a.user_id IS NOT NULL
  GROUP BY a.user_id, p.display_name
  HAVING COUNT(*) FILTER (WHERE a.outcome IN ('WIN', 'LOSS')) >= 5
  ORDER BY 
    CASE WHEN COUNT(*) FILTER (WHERE a.outcome IN ('WIN', 'LOSS')) > 0 
      THEN COUNT(*) FILTER (WHERE a.outcome = 'WIN')::float / 
           COUNT(*) FILTER (WHERE a.outcome IN ('WIN', 'LOSS'))::float 
      ELSE 0 
    END DESC
  LIMIT 10;
END;
$$;