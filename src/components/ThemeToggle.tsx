import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('watchtracker-theme') === 'dark' ? 'dark' : 'light'; }
    catch { return 'light'; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('watchtracker-theme', theme); } catch { /* Session-only theme when storage is unavailable. */ }
  }, [theme]);
  return <Button variant="outline" size="icon" className="size-11" aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
    {theme === 'light' ? <Moon/> : <Sun/>}
  </Button>;
}
