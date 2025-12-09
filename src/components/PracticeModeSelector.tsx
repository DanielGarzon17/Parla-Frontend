// Practice Mode Selector Component (HU13)
// Allows users to choose between different practice modes

import { useNavigate } from 'react-router-dom';
import { Layers, Timer, Shuffle, Sparkles } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { getUserStats } from '@/services/gamificationService';
import cap3 from "@/assets/cap3.png";

interface PracticeMode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  gradient: string;
}

const practiceModes: PracticeMode[] = [
  {
    id: 'flashcards',
    name: 'FlashCards',
    description: 'Practica con tarjetas de memoria',
    icon: <Layers className="w-8 h-8" />,
    path: '/flashcards',
    color: 'text-purple-500',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'timetrial',
    name: 'Contrarreloj',
    description: 'Traduce antes de que se acabe el tiempo',
    icon: <Timer className="w-8 h-8" />,
    path: '/timetrial',
    color: 'text-red-500',
    gradient: 'from-red-500 to-orange-500',
  },
  {
    id: 'matchcards',
    name: 'Emparejar',
    description: 'Relaciona frases con traducciones',
    icon: <Shuffle className="w-8 h-8" />,
    path: '/match',
    color: 'text-blue-500',
    gradient: 'from-blue-500 to-cyan-500',
  },
];

const PracticeModeSelector = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const stats = getUserStats();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          Elige tu modo de práctica
        </h2>
        <p className="text-muted-foreground">
          Selecciona cómo quieres practicar hoy
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {practiceModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => navigate(mode.path)}
            className={`
              group relative overflow-hidden rounded-2xl p-6 text-left
              bg-gradient-to-br ${mode.gradient} text-white
              transition-all duration-300 transform
              hover:scale-105 hover:shadow-xl
              active:scale-95
            `}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative z-10">
              <div className="mb-4 p-3 bg-white/20 rounded-xl w-fit">
                {mode.icon}
              </div>
              
              <h3 className="text-xl font-bold mb-1">{mode.name}</h3>
              <p className="text-sm text-white/80">{mode.description}</p>
            </div>

            {/* Arrow indicator */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Quick stats */}
      <div className="flex items-center justify-center gap-6 pt-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{stats.totalSessionsCompleted}</p>
          <p className="text-xs text-muted-foreground">Sesiones completadas</p>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-500">{stats.currentStreak}</p>
          <p className="text-xs text-muted-foreground">Días de racha</p>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-green-500">{stats.totalPoints}</p>
          <p className="text-xs text-muted-foreground">Puntos totales</p>
        </div>
      </div>
    </div>
  );
};

export default PracticeModeSelector;
