import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, BookOpen, Loader2 } from "lucide-react";

const PracticeModeMenu = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
      // Navigate to login anyway
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Practice Mode</h2>

      {/* FlashCards */}
      <button
        className="w-full bg-purple-800 hover:bg-purple-900 text-white py-3 rounded-xl transition"
        onClick={() => navigate("/flashcards")}
      >
        FlashCards
      </button>

      {/* Time Trial */}
      <button
        className="w-full bg-purple-800 hover:bg-purple-900 text-white py-3 rounded-xl transition"
        onClick={() => navigate("/timetrial")}
      >
        Time Trial
      </button>

      {/* Match Cards - ESTE ES EL QUE TE INTERESA */}
      <button
        className="w-full bg-purple-800 hover:bg-purple-900 text-white py-3 rounded-xl transition"
        onClick={() => navigate("/match")}
      >
        Match cards
      </button>

      {/* Saved Phrases (HU06) */}
      <button
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl transition font-semibold flex items-center justify-center gap-2"
        onClick={() => navigate("/phrases")}
      >
        <BookOpen className="w-4 h-4" />
        Mis Frases
      </button>

      {/* Progress Dashboard */}
      <button
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 rounded-xl transition font-semibold"
        onClick={() => navigate("/progress")}
      >
        📊 Your Progress
      </button>

      {/* Logout Button */}
      <button
        className="w-full bg-destructive hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed text-destructive-foreground py-3 rounded-xl transition font-semibold flex items-center justify-center gap-2"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Cerrando sesión...
          </>
        ) : (
          <>
            <LogOut className="w-4 h-4" />
            Logout
          </>
        )}
      </button>
    </div>
  );
};

export default PracticeModeMenu;
