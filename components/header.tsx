'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  if (!mounted) {
    return <div className="h-16 bg-card border-b border-border"></div>;
  }

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">✓</span>
          </div>
          <h1 className="font-bold text-lg text-foreground hidden sm:block">Habit Tracker</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="icon"
            className="border-border hover:bg-muted"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            size="icon"
            className="border-border hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
