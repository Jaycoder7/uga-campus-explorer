import { NavLink, useLocation } from 'react-router-dom';
import { Home, BarChart3, Map, Trophy, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/explore', icon: Map, label: 'Explore' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaders' },
  { to: '/how-to-play', icon: Info, label: 'How To' },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-lg md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="mx-auto flex max-w-[1024px] items-center justify-around px-2 py-2 md:justify-center md:gap-8 md:py-3">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 md:flex-row md:gap-2 md:px-4 md:text-sm',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? 'text-primary' : ''
                )}
              />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
