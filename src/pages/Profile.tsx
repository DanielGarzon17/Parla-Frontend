// Profile Page
// User profile management and settings

import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Globe, 
  Bell, 
  Moon, 
  Sun,
  Volume2,
  VolumeX,
  Shield,
  LogOut,
  Camera,
  Edit2,
  Save,
  X,
  Trophy,
  Flame,
  Target,
  Calendar,
  BookOpen,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import ParticlesBackground from '@/components/ParticlesBackground';
import ShareButton from '@/components/ShareButton';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { getUserStats, getAccuracy, getUnlockedAchievementsCount } from '@/services/gamificationService';
import { generateStatsShareText } from '@/services/shareService';
import { LANGUAGE_NAMES, Language } from '@/types/phrases';
import logo from '@/assets/logo.png';


interface UserSettings {
  displayName: string;
  email: string;
  nativeLanguage: Language;
  learningLanguage: Language;
  dailyGoal: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  darkMode: boolean;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const [stats, setStats] = useState(getUserStats());
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  
  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    displayName: '',
    email: '',
    nativeLanguage: 'es',
    learningLanguage: 'en',
    dailyGoal: 10,
    soundEnabled: true,
    notificationsEnabled: true,
    darkMode: false,
  });

  const [editedSettings, setEditedSettings] = useState<UserSettings>(settings);

  // Cargar datos del usuario desde el backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile/`, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          // Actualizar settings con datos del backend
          setSettings(s => ({
            ...s,
            displayName: data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : data.email,
            email: data.email,
            // Los idiomas y otras preferencias vendrían del backend si están disponibles
            nativeLanguage: data.native_language || 'es',
            learningLanguage: data.learning_language || 'en',
            dailyGoal: data.daily_goal || 10,
          }));
          setEditedSettings(s => ({
            ...s,
            displayName: data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : data.email,
            email: data.email,
            nativeLanguage: data.native_language || 'es',
            learningLanguage: data.learning_language || 'en',
            dailyGoal: data.daily_goal || 10,
          }));
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Refresh stats
  useEffect(() => {
    setStats(getUserStats());
  }, []);

  const accuracy = getAccuracy(stats);
  const unlockedAchievements = getUnlockedAchievementsCount(stats);

  const handleSaveSettings = async () => {
    setSettings(editedSettings);
    setIsEditing(false);
    // Guardar cambios en el backend
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          native_language: editedSettings.nativeLanguage,
          learning_language: editedSettings.learningLanguage,
          daily_goal: editedSettings.dailyGoal,
        }),
      });
      if (!response.ok) {
        console.error('Error saving settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditedSettings(settings);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Stats cards data
  const statsCards = [
    { 
      icon: <Flame className="w-6 h-6" />, 
      label: 'Racha actual', 
      value: `${stats.currentStreak} días`,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    { 
      icon: <Trophy className="w-6 h-6" />, 
      label: 'Puntos totales', 
      value: stats.totalPoints.toLocaleString(),
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
    },
    { 
      icon: <BookOpen className="w-6 h-6" />, 
      label: 'Frases practicadas', 
      value: stats.totalPhrasesPracticed,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    { 
      icon: <Target className="w-6 h-6" />, 
      label: 'Precisión', 
      value: `${accuracy}%`,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    { 
      icon: <Zap className="w-6 h-6" />, 
      label: 'Sesiones', 
      value: stats.totalSessionsCompleted,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    { 
      icon: <Calendar className="w-6 h-6" />, 
      label: 'Días activos', 
      value: stats.activeDays,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
  ];

  if (isLoading) {
    return (
      <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-pink-900/10 to-gray-900' 
          : 'bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50'
      }`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-foreground">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-pink-900/10 to-gray-900' 
        : 'bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50'
    }`}>
      <ParticlesBackground 
        particleCount={25}
        colors={['#a855f7', '#8b5cf6', '#ec4899', '#f43f5e']}
        darkColors={['#c084fc', '#a78bfa', '#f472b6', '#fb7185']}
      />

      <div className="relative z-10 p-4 lg:p-8 pl-20 lg:pl-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Mi Perfil</h1>
            <ShareButton 
              content={generateStatsShareText(stats)} 
              variant="outline"
              size="default"
            />
          </div>

          {/* Profile Card */}
          <Card className="bg-card/90 backdrop-blur border-border overflow-hidden">
            {/* Cover gradient */}
            <div className="h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
            
            <CardContent className="relative pt-0 pb-6">
              {/* Avatar */}
              <div className="absolute -top-16 left-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-card shadow-xl">
                    {profileData?.profile_picture ? (
                      <img 
                        src={profileData.profile_picture} 
                        alt={settings.displayName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* User info */}
              <div className="pt-20 pl-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{settings.displayName}</h2>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {settings.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="gap-1">
                        <Globe className="w-3 h-3" />
                        {LANGUAGE_NAMES[settings.learningLanguage]}
                      </Badge>
                      <Badge variant="outline">
                        🏆 {unlockedAchievements} logros
                      </Badge>
                    </div>
                  </div>
                  
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveSettings}>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {statsCards.map((stat, i) => (
              <Card key={i} className={`${stat.bg} border-none`}>
                <CardContent className="p-4 text-center">
                  <div className={`${stat.color} mb-2 flex justify-center`}>
                    {stat.icon}
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Settings */}
          <Card className="bg-card/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Configuración
              </CardTitle>
              <CardDescription>
                Personaliza tu experiencia de aprendizaje
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Idiomas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Idioma nativo</Label>
                    <Select 
                      value={isEditing ? editedSettings.nativeLanguage : settings.nativeLanguage}
                      onValueChange={(v) => setEditedSettings(s => ({ ...s, nativeLanguage: v as Language }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                          <SelectItem key={code} value={code}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Idioma que estoy aprendiendo</Label>
                    <Select 
                      value={isEditing ? editedSettings.learningLanguage : settings.learningLanguage}
                      onValueChange={(v) => setEditedSettings(s => ({ ...s, learningLanguage: v as Language }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                          <SelectItem key={code} value={code}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Goals */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Objetivos
                </h3>
                <div className="space-y-2">
                  <Label>Meta diaria de frases</Label>
                  <Select 
                    value={String(isEditing ? editedSettings.dailyGoal : settings.dailyGoal)}
                    onValueChange={(v) => setEditedSettings(s => ({ ...s, dailyGoal: parseInt(v) }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 frases/día (Casual)</SelectItem>
                      <SelectItem value="10">10 frases/día (Regular)</SelectItem>
                      <SelectItem value="20">20 frases/día (Intensivo)</SelectItem>
                      <SelectItem value="30">30 frases/día (Experto)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Preferences */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Preferencias
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {settings.soundEnabled ? (
                        <Volume2 className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <Label>Efectos de sonido</Label>
                        <p className="text-sm text-muted-foreground">
                          Sonidos al completar acciones
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={isEditing ? editedSettings.soundEnabled : settings.soundEnabled}
                      onCheckedChange={(v) => setEditedSettings(s => ({ ...s, soundEnabled: v }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <Label>Notificaciones</Label>
                        <p className="text-sm text-muted-foreground">
                          Recordatorios de práctica diaria
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={isEditing ? editedSettings.notificationsEnabled : settings.notificationsEnabled}
                      onCheckedChange={(v) => setEditedSettings(s => ({ ...s, notificationsEnabled: v }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {settings.darkMode ? (
                        <Moon className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Sun className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <Label>Modo oscuro</Label>
                        <p className="text-sm text-muted-foreground">
                          Tema de la aplicación
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={isEditing ? editedSettings.darkMode : settings.darkMode}
                      onCheckedChange={(v) => setEditedSettings(s => ({ ...s, darkMode: v }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Danger Zone */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-destructive uppercase tracking-wide">
                  Zona de peligro
                </h3>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowLogoutDialog(true)}
                  className="w-full sm:w-auto"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar sesión
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mascot */}
          <div className="flex justify-center pb-8">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center shadow-lg">
              <img src={logo} alt="Parla mascot" className="w-20 h-20 object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Tu progreso está guardado. Podrás volver a iniciar sesión en cualquier momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground">
              Cerrar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
