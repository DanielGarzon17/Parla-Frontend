// Sidebar Component - Global navigation menu
// Responsive sidebar with user profile and navigation, collapsible on desktop

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Menu, 
  X, 
  LogOut, 
  BookOpen, 
  BarChart3,
  Layers,
  Timer,
  Sparkles,
  Flame,
  Trophy,
  Home,
  Book,
  Gamepad2,
  Library,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserStats } from '@/services/gamificationService';
import { useTheme } from '@/hooks/useTheme';
import logo from '@/assets/logo.png';

interface SidebarProps {
  className?: string;
  onCollapsedChange?: (collapsed: boolean) => void;
}

// Navigation sections with grouped items
const navSections = [
  {
    id: 'main',
    label: 'Principal',
    icon: Home,
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: Home, color: 'bg-purple-600 hover:bg-purple-700' },
    ],
  },
  {
    id: 'games',
    label: 'Juegos de Práctica',
    icon: Gamepad2,
    items: [
      { label: 'FlashCards', path: '/flashcards', icon: Layers, color: 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600' },
      { label: 'Time Trial', path: '/timetrial', icon: Timer, color: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600' },
      { label: 'Match Cards', path: '/match', icon: Sparkles, color: 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600' },
    ],
  },
  {
    id: 'vocabulary',
    label: 'Mi Vocabulario',
    icon: Library,
    items: [
      { label: 'Mis Frases', path: '/phrases', icon: BookOpen, color: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600' },
      { label: 'Diccionario', path: '/dictionary', icon: Book, color: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' },
    ],
  },
  {
    id: 'stats',
    label: 'Estadísticas',
    icon: BarChart3,
    items: [
      { label: 'Mi Progreso', path: '/progress', icon: BarChart3, color: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' },
    ],
  },
];


const Sidebar = ({ className = '', onCollapsedChange }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState(getUserStats());

  // Refresh stats when sidebar opens
  useEffect(() => {
    if (isOpen || !isCollapsed) {
      setStats(getUserStats());
    }
  }, [isOpen, isCollapsed]);

  // Notify parent of collapse state change
  useEffect(() => {
    onCollapsedChange?.(isCollapsed);
  }, [isCollapsed, onCollapsedChange]);


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path: string) => location.pathname === path;

  // Get display name from user data
  const displayName = user?.username || 'Usuario';
  const userPicture = user?.profile_picture;

  // Sidebar content component for mobile (always expanded)
  const SidebarContentMobile = () => (
    <div className="flex flex-col h-full">
      {/* User Profile Section */}
      <div className="flex flex-col items-center pt-8 pb-4 px-4">
        <div 
          className="relative mb-3 cursor-pointer group"
          onClick={() => handleNavigate('/profile')}
        >
          <div className={`absolute inset-0 rounded-full blur-xl scale-110 transition-all ${isDark ? 'bg-purple-500/20 group-hover:bg-purple-500/30' : 'bg-purple-400/30 group-hover:bg-purple-400/50'}`}></div>
          <div className={`relative w-20 h-20 rounded-full p-1 shadow-lg group-hover:scale-105 transition-transform ${isDark ? 'bg-gradient-to-br from-purple-600 to-purple-800' : 'bg-gradient-to-br from-purple-300 to-purple-400'}`}>
            <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-purple-200'}`}>
              {userPicture ? (
                <img src={userPicture} alt="User avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <img src={logo} alt="User avatar" className="w-full h-full object-cover" />
              )}
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => handleNavigate('/profile')} 
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-center shadow-md truncate cursor-pointer hover:bg-primary/90 transition-colors text-sm"
        >
          {displayName}
        </div>

        <div className="flex items-center justify-center gap-3 mt-3 w-full">
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${isDark ? 'bg-orange-500/30' : 'bg-orange-500/20'}`}>
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className={`text-xs font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{stats.currentStreak}</span>
          </div>
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${isDark ? 'bg-purple-500/30' : 'bg-purple-500/20'}`}>
            <Trophy className={`w-3.5 h-3.5 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
            <span className={`text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{stats.totalPoints}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 pb-3 overflow-y-auto">
        <nav className="space-y-4">
          {navSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <div key={section.id}>
                <div className="flex items-center gap-2 px-2 mb-2">
                  <SectionIcon className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.label}
                  </h3>
                </div>
                <div className="space-y-1.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigate(item.path)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium
                          transition-all duration-200 text-white text-sm
                          ${item.color}
                          ${active ? 'ring-2 ring-white/50 shadow-lg scale-[1.02]' : 'shadow-sm'}
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-3 border-t border-border/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
            bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );

  // Sidebar content for desktop (collapsible)
  const SidebarContentDesktop = () => (
    <div className="flex flex-col h-full">
      {/* Collapse Toggle Button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-8 z-10 w-6 h-6 bg-white border border-purple-200 rounded-full shadow-md flex items-center justify-center hover:bg-purple-50 transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-purple-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-purple-600" />
        )}
      </button>

      {/* User Profile Section */}
      <div className={`flex flex-col items-center pt-8 pb-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <div 
          className="relative mb-3 cursor-pointer group"
          onClick={() => handleNavigate('/profile')}
        >
          <div className="absolute inset-0 bg-purple-400/30 rounded-full blur-xl scale-110 group-hover:bg-purple-400/50 transition-all"></div>
          <div className={`relative rounded-full bg-gradient-to-br from-purple-300 to-purple-400 p-1 shadow-lg group-hover:scale-105 transition-all duration-300 ${isCollapsed ? 'w-12 h-12' : 'w-20 h-20'}`}>
            <div className="w-full h-full rounded-full bg-purple-200 flex items-center justify-center overflow-hidden">
              {userPicture ? (
                <img src={userPicture} alt="User avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <img src={logo} alt="User avatar" className="w-full h-full object-cover" />
              )}
            </div>
          </div>
        </div>
        
        {!isCollapsed && (
          <>
            <div 
              onClick={() => handleNavigate('/profile')} 
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-center shadow-md truncate cursor-pointer hover:bg-primary/90 transition-colors text-sm"
            >
              {displayName}
            </div>

            <div className="flex items-center justify-center gap-3 mt-3 w-full">
              <div className="flex items-center gap-1 bg-orange-500/20 px-2.5 py-1 rounded-full">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-bold text-orange-600">{stats.currentStreak}</span>
              </div>
              <div className="flex items-center gap-1 bg-purple-500/20 px-2.5 py-1 rounded-full">
                <Trophy className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs font-bold text-purple-600">{stats.totalPoints}</span>
              </div>
            </div>
          </>
        )}

        {isCollapsed && (
          <div className="flex flex-col items-center gap-1 mt-2">
            <div className="flex items-center gap-1 bg-orange-500/20 px-2 py-1 rounded-full">
              <Flame className="w-3 h-3 text-orange-500" />
              <span className="text-xs font-bold text-orange-600">{stats.currentStreak}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <div className={`flex-1 pb-3 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
        <nav className="space-y-4">
          {navSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <div key={section.id}>
                {!isCollapsed && (
                  <div className="flex items-center gap-2 px-2 mb-2">
                    <SectionIcon className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.label}
                    </h3>
                  </div>
                )}
                {isCollapsed && section.id !== 'main' && (
                  <div className="flex justify-center mb-2">
                    <div className="w-8 h-px bg-purple-200"></div>
                  </div>
                )}
                <div className={`space-y-1.5 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigate(item.path)}
                        title={isCollapsed ? item.label : undefined}
                        className={`
                          flex items-center gap-3 rounded-xl font-medium
                          transition-all duration-200 text-white text-sm
                          ${item.color}
                          ${active ? 'ring-2 ring-white/50 shadow-lg scale-[1.02]' : 'shadow-sm'}
                          ${isCollapsed ? 'w-10 h-10 justify-center p-0' : 'w-full px-3 py-2.5'}
                        `}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className={`p-3 border-t border-border/50 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Cerrar sesión' : undefined}
          className={`
            flex items-center justify-center gap-2 rounded-xl font-medium text-sm
            bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all duration-200
            ${isCollapsed ? 'w-10 h-10 p-0' : 'w-full px-4 py-2.5'}
          `}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/90 backdrop-blur shadow-lg rounded-full w-12 h-12"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 z-50 lg:hidden
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          shadow-2xl
          ${isDark 
            ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900' 
            : 'bg-gradient-to-b from-purple-100 via-purple-50 to-purple-100'
          }
        `}
      >
        <SidebarContentMobile />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex lg:flex-col lg:min-h-screen relative
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
          ${isDark 
            ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700/50' 
            : 'bg-gradient-to-b from-purple-100 via-purple-50 to-purple-100 border-r border-purple-200/50'
          }
          ${className}
        `}
      >
        <SidebarContentDesktop />
      </aside>
    </>
  );
};

export default Sidebar;
