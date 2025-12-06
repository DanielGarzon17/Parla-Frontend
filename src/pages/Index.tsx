// Dashboard / Index Page (HU13)
// Main view with practice mode selector and stats

import PracticeModeSelector from "@/components/PracticeModeSelector";
import StatsPanel from "@/components/StatsPanel";
import ParticlesBackground from "@/components/ParticlesBackground";
import { useTheme } from "@/hooks/useTheme";

const Index = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900' 
        : 'bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100'
    }`}>
      <ParticlesBackground 
        particleCount={20}
        colors={['#a855f7', '#8b5cf6', '#fbbf24', '#22c55e']}
        darkColors={['#c084fc', '#a78bfa', '#fcd34d', '#4ade80']}
      />
      
      <div className="relative z-10 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-8 mt-12 lg:mt-0">
            ¡Bienvenido a Parla!
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Main Content - Practice Mode Selector */}
            <main className="lg:col-span-8">
              <div className="bg-card/80 backdrop-blur rounded-3xl p-6 shadow-lg">
                <PracticeModeSelector />
              </div>
            </main>

            {/* Right Sidebar - Stats */}
            <aside className="lg:col-span-4">
              <StatsPanel />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
