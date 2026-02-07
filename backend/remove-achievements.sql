-- Remove Achievement System Migration
-- Run this in Supabase SQL Editor to clean up achievement tables

-- Drop tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;

-- Drop related indexes if they exist
DROP INDEX IF EXISTS idx_user_achievements_user_id;

-- Note: Points and streaks remain in the users table:
-- - current_streak
-- - best_streak  
-- - total_points
-- These are preserved and continue to work as normal

-- Verify cleanup
SELECT 
  'user_achievements' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_achievements') 
    THEN 'EXISTS' 
    ELSE 'REMOVED' 
  END as status
UNION ALL
SELECT 
  'achievements' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'achievements') 
    THEN 'EXISTS' 
    ELSE 'REMOVED' 
  END as status;