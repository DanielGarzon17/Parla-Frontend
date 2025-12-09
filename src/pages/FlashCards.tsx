// FlashCards Practice Page (HU10, HU10.1, HU10.2, HU10.3)
// Practice saved phrases with gamification using SM-2 spaced repetition

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shuffle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FlashCardPractice from '@/components/FlashCardPractice';
import SessionSummary from '@/components/SessionSummary';
import ParticlesBackground from '@/components/ParticlesBackground';
import { useTheme } from '@/hooks/useTheme';
import { SavedPhrase } from '@/types/phrases';
import { PhrasesApiError } from '@/services/phrasesService';
import { 
  fetchDueFlashcardsWithPhrases, 
  answerFlashcard,
  FlashcardForPractice 
} from '@/services/flashcardsService';
import { getUserStats, completePracticeSession as completeLocalSession } from '@/services/gamificationService';
import { 
  startPracticeSession as startBackendSession, 
  completePracticeSession as completeBackendSession,
  addPracticeDetail
} from '@/services/gamificationApi';
import { useStreak } from '@/contexts/StreakContext';
import { usePoints } from '@/contexts/PointsContext';
import { useAuth } from '@/hooks/useAuth';
import { Achievement } from '@/types/gamification';
import logo from '@/assets/logo.png';
import cap2 from '@/assets/cap2.png';

type SessionState = 'idle' | 'loading' | 'ready' | 'practicing' | 'summary' | 'empty' | 'error';

const FlashCardsPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { streak, recordPractice, refreshStreak } = useStreak();
  const { addPoints } = usePoints();
  const { user } = useAuth();
  
  // State - Start in 'idle' state, no API calls until user clicks play
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [dueFlashcards, setDueFlashcards] = useState<FlashcardForPractice[]>([]);
  const [practiceQueue, setPracticeQueue] = useState<FlashcardForPractice[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [userStats, setUserStats] = useState(getUserStats());
  const [sessionResults, setSessionResults] = useState<{
    pointsEarned: { basePoints: number; streakBonus: number; perfectBonus: number; total: number };
    newAchievements: Achievement[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendSessionId, setBackendSessionId] = useState<number | null>(null);
  const hasCompletedRef = useRef<boolean>(false); // Prevent duplicate completion

  // Start game - load flashcards and start session
  const startPractice = async () => {
    setSessionState('loading');
    setErrorMessage(null);
    
    try {
      // Load flashcards when user clicks play
      const data = await fetchDueFlashcardsWithPhrases();
      // //console.log('Due flashcards loaded:', data);
      
      if (data.length === 0) {
        setSessionState('empty');
        return;
      }
      
      setDueFlashcards(data);
      
      // Shuffle and prepare practice queue
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      const sessionFlashcards = shuffled.slice(0, Math.min(10, shuffled.length));
      setPracticeQueue(sessionFlashcards);
      setCurrentIndex(0);
      setCorrectAnswers(0);
      setSessionStreak(0);
      hasCompletedRef.current = false;
      
      // Start backend session to track stats
      try {
        const session = await startBackendSession('flashcard');
        setBackendSessionId(session.id);
        // //console.log('Backend session started:', session.id);
      } catch (error) {
        console.error('Error starting backend session:', error);
      }
      
      setSessionState('practicing');
    } catch (error) {
      console.error('Error loading due flashcards:', error);
      if (error instanceof PhrasesApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Error al cargar las flashcards. Por favor, intenta de nuevo.');
      }
      setSessionState('error');
    }
  };
  
  // Continue practicing (after summary) - reuse existing flashcards or reload
  const continuePractice = async () => {
    if (dueFlashcards.length > 0) {
      const shuffled = [...dueFlashcards].sort(() => Math.random() - 0.5);
      const sessionFlashcards = shuffled.slice(0, Math.min(10, shuffled.length));
      setPracticeQueue(sessionFlashcards);
      setCurrentIndex(0);
      setCorrectAnswers(0);
      setSessionStreak(0);
      hasCompletedRef.current = false;
      
      try {
        const session = await startBackendSession('flashcard');
        setBackendSessionId(session.id);
      } catch (error) {
        console.error('Error starting backend session:', error);
      }
      
      setSessionState('practicing');
    } else {
      // Reload flashcards
      await startPractice();
    }
  };

  // Handle answer - sends quality to backend SM-2 algorithm
  // Quality mapping: correct = 4 (good), wrong = 1 (hard/again)
  const handleAnswer = async (correct: boolean) => {
    const currentItem = practiceQueue[currentIndex];
    
    // Send answer to backend to update SM-2 schedule
    // Quality: 0-2 = fail, 3-5 = pass (we use 4 for correct, 1 for wrong)
    const quality = correct ? 4 : 1;
    
    try {
      await answerFlashcard(currentItem.flashcard.phrase, quality);
      // //console.log(`Flashcard ${currentItem.flashcard.id} answered with quality ${quality}`);
    } catch (error) {
      console.error('Error updating flashcard:', error);
      // Continue even if update fails - don't block the user
    }
    
    // Record answer in backend session (updates DailyStatistic)
    if (backendSessionId && currentItem.phrase) {
      try {
        await addPracticeDetail(backendSessionId, {
          phrase_id: parseInt(currentItem.phrase.id),
          was_correct: correct,
          response_time_seconds: 0
        });
      } catch (error) {
        console.error('Error recording practice detail:', error);
      }
    }
    
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
      setSessionStreak(prev => prev + 1);
    } else {
      setSessionStreak(0);
    }

    // Move to next card or finish
    if (currentIndex < practiceQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Prevent duplicate completion
      if (hasCompletedRef.current) return;
      hasCompletedRef.current = true;
      
      // Complete backend session
      if (backendSessionId) {
        try {
          await completeBackendSession(backendSessionId);
          // //console.log('Backend session completed:', backendSessionId);
        } catch (error) {
          console.error('Error completing backend session:', error);
        }
      }
      
      // Session complete - calculate results (local)
      const finalCorrect = correct ? correctAnswers + 1 : correctAnswers;
      const result = completeLocalSession('flashcards', practiceQueue.length, finalCorrect);
      setUserStats(result.stats);
      setSessionResults({
        pointsEarned: result.pointsEarned,
        newAchievements: result.newAchievements,
      });
      // Record activity to update streak
      recordPractice();
      // Send points to backend (already sent via addPracticeDetail, but this ensures local sync)
      if (result.pointsEarned.total > 0) {
        addPoints(result.pointsEarned.total).catch(err => console.error('Error adding points:', err));
      }
      setSessionState('summary');
    }
  };

  // Get current phrase from the practice queue
  const currentItem = practiceQueue[currentIndex];
  const currentPhrase: SavedPhrase | undefined = currentItem?.phrase;

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900' 
        : 'bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100'
    }`}>
      {/* Animated particles background */}
      <ParticlesBackground 
        particleCount={40}
        colors={['#a855f7', '#8b5cf6', '#fbbf24', '#22c55e']}
        darkColors={['#c084fc', '#a78bfa', '#fcd34d', '#4ade80']}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6 pl-20 lg:pl-6">
        <div className="w-10 lg:hidden"></div> {/* Spacer for mobile menu button */}
        
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">FlashCards</h1>
          {sessionState === 'practicing' && (
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold">
              ⭐ {user?.total_points ?? 0} pts
            </div>
          )}
        </div>

        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg">
          <img
            src={logo}
            alt="Capybara mascot"
            className="w-16 h-16 object-contain"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center px-4 py-8 min-h-[calc(100vh-120px)]">
        {/* Loading State */}
        {sessionState === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando frases...</p>
          </div>
        )}

        {/* Error State */}
        {sessionState === 'error' && (
          <div className={`text-center backdrop-blur rounded-3xl p-8 max-w-md ${
            isDark ? 'bg-gray-800/95' : 'bg-card/90'
          }`}>
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-foreground'}`}>
              Error al cargar las frases
            </h2>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>
              {errorMessage}
            </p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        )}

        {/* Empty State */}
        {sessionState === 'empty' && (
          <div className={`text-center backdrop-blur rounded-3xl p-8 max-w-md ${
            isDark ? 'bg-gray-800/95' : 'bg-card/90'
          }`}>
            <BookOpen className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-muted-foreground/50'}`} />
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-foreground'}`}>
              ¡No hay flashcards pendientes!
            </h2>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>
              Has completado todas tus flashcards por hoy. Vuelve más tarde o agrega más frases.
            </p>
            <Button onClick={() => navigate('/phrases')}>
              Ir a Mis Frases
            </Button>
          </div>
        )}

        {/* Idle State - Initial screen before loading */}
        {sessionState === 'idle' && (
          <div className={`text-center backdrop-blur rounded-3xl p-8 max-w-md ${
            isDark ? 'bg-gray-800/95' : 'bg-card/90'
          }`}>
            <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-foreground'}`}>
              ¡Tus Flash-Cards te esperan!
            </h2>
            <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>
              Practica tus frases guardadas
            </p>
            
            {/* Current streak indicator - using real data from backend */}
            <div className={`rounded-xl p-4 mb-6 flex items-center justify-center gap-3 ${
              isDark ? 'bg-orange-500/20' : 'bg-orange-500/10'
            }`}>
              <span className="text-3xl">🔥</span>
              <div className="text-left">
                <p className={`text-2xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{user?.current_streak ?? streak ?? 0} días</p>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>Racha actual</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                size="lg" 
                className={`w-full h-14 text-lg ${isDark ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                onClick={startPractice}
              >
                <Shuffle className="w-5 h-5 mr-2" />
                Jugar!
              </Button>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
                Practicarás hasta 10 frases aleatorias
              </p>
            </div>
          </div>
        )}

        {/* Practicing State */}
        {sessionState === 'practicing' && currentPhrase && (
          <FlashCardPractice
            phrase={currentPhrase}
            onAnswer={handleAnswer}
            currentIndex={currentIndex}
            totalCards={practiceQueue.length}
            streak={sessionStreak}
          />
        )}

        {/* Summary State */}
        {sessionState === 'summary' && sessionResults && (
          <SessionSummary
            correctAnswers={correctAnswers}
            totalQuestions={practiceQueue.length}
            pointsEarned={sessionResults.pointsEarned}
            currentStreak={user?.current_streak ?? streak ?? 0}
            newAchievements={sessionResults.newAchievements}
            onContinue={continuePractice}
            onGoHome={() => navigate('/dashboard')}
          />
        )}
      </main>

      {/* Capybara Mascot - only show when not practicing */}
      {sessionState !== 'practicing' && sessionState !== 'summary' && (
        <div className="fixed bottom-0 left-0 w-64 h-80 pointer-events-none z-10">
          <img
            src={cap2}
            alt="Capybara mascot"
            className="w-full h-full object-contain -scale-x-100"
          />
        </div>
      )}
    </div>
  );
};

export default FlashCardsPage;
