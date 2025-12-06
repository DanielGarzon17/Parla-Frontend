// Theme Toggle Button - Floating button to switch between light/dark mode
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        fixed bottom-6 right-6 z-50
        w-14 h-14 rounded-full
        flex items-center justify-center
        shadow-lg hover:shadow-xl
        transition-all duration-500 ease-out
        hover:scale-110 active:scale-95
        ${isDark 
          ? 'bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600' 
          : 'bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400'
        }
      `}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <div className="relative w-6 h-6">
        {/* Sun icon */}
        <Sun 
          className={`
            absolute inset-0 w-6 h-6 text-white
            transition-all duration-500
            ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
          `}
        />
        {/* Moon icon */}
        <Moon 
          className={`
            absolute inset-0 w-6 h-6 text-white
            transition-all duration-500
            ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
          `}
        />
      </div>
      
      {/* Glow effect */}
      <div 
        className={`
          absolute inset-0 rounded-full blur-xl opacity-50
          transition-all duration-500
          ${isDark 
            ? 'bg-purple-500' 
            : 'bg-amber-400'
          }
        `}
      />
    </button>
  );
};

export default ThemeToggle;
