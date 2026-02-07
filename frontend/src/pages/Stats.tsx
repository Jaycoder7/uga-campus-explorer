import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Star, Flame, Trophy, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';


export default function Stats() {
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    async function fetchUserStats() {
      try {
        // Get currently logged-in user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Fetch stats from backend
        const res = await fetch(`http://localhost:3001/api/users/${user.id}/stats`);
        const data = await res.json();

        // Fallback in case backend returns nothing
        const fallbackData = {
          total_points: 0,
          current_streak: 0,
          best_streak: 0,
          total_locations: 0,
        };

        setStatsData(data || fallbackData);
      } catch (err) {
        console.error("Failed to fetch user stats", err);
        // Optional: set fallback if fetch fails
        setStatsData({
          total_points: 0,
          current_streak: 0,
          best_streak: 0,
          total_locations: 0,
        });
      }
    }

    fetchUserStats();
  }, []);

  if (!statsData) return <PageLayout title="Your Progress">Loading...</PageLayout>;

  const stats = [
    {
      icon: Star,
      label: 'Total Points',
      value: statsData.total_points.toLocaleString(),
      color: 'text-primary',
      bg: 'bg-primary/20',
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: statsData.current_streak,
      color: 'text-warning',
      bg: 'bg-warning/20',
    },
    {
      icon: Trophy,
      label: 'Best Streak',
      value: statsData.best_streak,
      color: 'text-success',
      bg: 'bg-success/20',
    },
    {
      icon: MapPin,
      label: 'Locations',
      value: `${statsData.total_locations}/50`,
      color: 'text-accent-foreground',
      bg: 'bg-accent',
    },
  ];

  return (
    <PageLayout title="Your Progress">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="rounded-xl bg-card p-4 text-center shadow-card">
            <div
              className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${bg}`}
            >
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl bg-card p-6 text-center shadow-card">
        <p className="text-muted-foreground">
          Full stats page with calendar view, history, and achievements coming soon!
        </p>
      </div>
    </PageLayout>
  );
}
