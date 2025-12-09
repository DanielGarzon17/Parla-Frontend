// Dashboard / Index Page (HU13)
// Main view with practice mode selector and stats

import PracticeModeSelector from "@/components/PracticeModeSelector";
import StatsPanel from "@/components/StatsPanel";
import ParticlesBackground from "@/components/ParticlesBackground";
import { useTheme } from "@/hooks/useTheme";
import cap3 from "@/assets/cap3.png";

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
         
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-center mb-6 mt-12 lg:mt-0">
            <style>{`
              @keyframes fade-in {
                from {
                  opacity: 0;
                  transform: translateY(-10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .animate-fade-in {
                animation: fade-in 0.8s ease-out;
              }
            `}</style>
            <span className="animate-fade-in inline-block">
              ¡Bienvenido a <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 bg-clip-text text-transparent">Parla</span>!
            </span>
          </h1>
          
          {/* Subtítulo descriptivo */}
          <p className={`text-center text-lg lg:text-xl mb-8 max-w-2xl mx-auto transition-colors ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Tu compañero perfecto para aprender idiomas de forma divertida
          </p>

          {/* Contenedor de imagen mejorado */}
          <div className="flex items-center justify-center mt-8 mb-12">
            <div className="relative group">
              {/* */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              
              {/* Image con hover effect */}
              <img 
                src={cap3} 
                alt="Capybara mascot" 
                className="relative w-full max-w-[200px] lg:max-w-[250px] object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-2xl"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Main Content - Practice Mode Selector */}
            <main className="lg:col-span-8">
              <div className="bg-card/80 backdrop-blur rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
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