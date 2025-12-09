// Time Trial Page (HU12.1)
// Practice translating phrases against the clock

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Timer, Volume2, SkipForward, Check, X, Trophy, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ParticlesBackground from "@/components/ParticlesBackground";
import { useTheme } from "@/hooks/useTheme";
import { SavedPhrase } from "@/types/phrases";
import { fetchPhrases, getRandomPhrases } from "@/services/phrasesService";
import { getUserStats, completePracticeSession } from "@/services/gamificationService";
import { playCorrect, playWrong, playTimeWarning, playTimeUp, playComplete } from "@/services/soundService";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import confetti from "canvas-confetti";
import cap4 from "@/assets/cap4.png";

type GameState = 'loading' | 'ready' | 'playing' | 'feedback' | 'summary' | 'empty';

const TIME_PER_QUESTION = 30; // seconds
const QUESTIONS_PER_ROUND = 5;

const TimeTrialPage = () => {
  const navigate = useNavigate();
  const { speak, isSupported } = useSpeechSynthesis();
  const { isDark } = useTheme();
  
  // Game state
  const [gameState, setGameState] = useState<GameState>('loading');
  const [phrases, setPhrases] = useState<SavedPhrase[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [results, setResults] = useState<{ phrase: SavedPhrase; correct: boolean; userAnswer: string }[]>([]);
  const [stats, setStats] = useState(getUserStats());
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load phrases
  useEffect(() => {
    const loadPhrases = async () => {
      try {
        const allPhrases = await fetchPhrases();
        if (allPhrases.length === 0) {
          setGameState('empty');
          return;
        }
        const randomPhrases = getRandomPhrases(allPhrases, QUESTIONS_PER_ROUND);
        setPhrases(randomPhrases);
        setGameState('ready');
      } catch (error) {
        console.error('Error loading phrases:', error);
        setGameState('empty');
      }
    };
    loadPhrases();
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 6 && prev > 1) {
          playTimeWarning();
        }
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentIndex]);

  const handleTimeUp = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    playTimeUp();
    setIsCorrect(false);
    setStreak(0);
    setResults(prev => [...prev, { 
      phrase: phrases[currentIndex], 
      correct: false, 
      userAnswer: answer || '(sin respuesta)' 
    }]);
    setGameState('feedback');
  }, [currentIndex, phrases, answer]);

  const startGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setResults([]);
    setTimeLeft(TIME_PER_QUESTION);
    setAnswer("");
    setGameState('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const checkAnswer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const currentPhrase = phrases[currentIndex];
    const userAnswer = answer.trim().toLowerCase();
    const correctAnswer = currentPhrase.translation.toLowerCase();
    
    // Check if answer is correct (allowing for some flexibility)
    const isAnswerCorrect = correctAnswer.includes(userAnswer) || 
      userAnswer.includes(correctAnswer.split('/')[0].trim()) ||
      userAnswer === correctAnswer;
    
    setIsCorrect(isAnswerCorrect);
    
    if (isAnswerCorrect) {
      playCorrect();
      const timeBonus = Math.floor(timeLeft / 3);
      const streakBonus = streak * 2;
      setScore(prev => prev + 10 + timeBonus + streakBonus);
      setStreak(prev => prev + 1);
    } else {
      playWrong();
      setStreak(0);
    }
    
    setResults(prev => [...prev, { 
      phrase: currentPhrase, 
      correct: isAnswerCorrect, 
      userAnswer: answer || '(sin respuesta)' 
    }]);
    
    setGameState('feedback');
  };

  const nextQuestion = () => {
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAnswer("");
      setTimeLeft(TIME_PER_QUESTION);
      setIsCorrect(null);
      setGameState('playing');
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // Game complete
      playComplete();
      const correctCount = results.filter(r => r.correct).length + (isCorrect ? 1 : 0);
      const result = completePracticeSession('timetrial', phrases.length, correctCount);
      setStats(result.stats);
      
      if (correctCount >= phrases.length * 0.8) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      setGameState('summary');
    }
  };

  const skipQuestion = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsCorrect(false);
    setStreak(0);
    setResults(prev => [...prev, { 
      phrase: phrases[currentIndex], 
      correct: false, 
      userAnswer: '(saltada)' 
    }]);
    setGameState('feedback');
  };

  const speakPhrase = () => {
    if (isSupported && phrases[currentIndex]) {
      speak(phrases[currentIndex].phrase);
    }
  };

  const currentPhrase = phrases[currentIndex];
  const correctCount = results.filter(r => r.correct).length;
  const accuracy = phrases.length > 0 ? Math.round((correctCount / phrases.length) * 100) : 0;

  // Timer color based on time left
  const getTimerColor = () => {
    if (timeLeft > 20) return 'text-green-500';
    if (timeLeft > 10) return 'text-yellow-500';
    return 'text-red-500 animate-pulse';
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900' 
        : 'bg-gradient-to-br from-orange-100 via-red-50 to-purple-100'
    }`}>
      <ParticlesBackground 
        particleCount={30}
        colors={['#ef4444', '#f97316', '#fbbf24', '#a855f7']}
        darkColors={['#f87171', '#fb923c', '#fcd34d', '#c084fc']}
      />

      <div className="relative z-10 p-4 md:p-8 pl-20 lg:pl-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Timer className="w-8 h-8 text-red-500" />
              Contrarreloj
            </h1>
            {gameState === 'playing' && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1.5 rounded-full">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-bold text-orange-600">{streak}</span>
                </div>
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold">
                  {score} pts
                </div>
              </div>
            )}
          </header>

          {/* Loading State */}
          {gameState === 'loading' && (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando frases...</p>
            </div>
          )}

          {/* Empty State */}
          {gameState === 'empty' && (
            <div className="text-center py-20 bg-card/90 backdrop-blur rounded-3xl">
              <Timer className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-2xl font-bold mb-2">No hay frases disponibles</h2>
              <p className="text-muted-foreground mb-6">Agrega frases primero para practicar.</p>
              <Button onClick={() => navigate('/phrases')}>Ir a Mis Frases</Button>
            </div>
          )}

          {/* Ready State */}
          {gameState === 'ready' && (
            <div className={`text-center py-12 backdrop-blur rounded-3xl ${
              isDark ? 'bg-gray-800/95' : 'bg-card/90'
            }`}>
              {/* <div className="text-6xl mb-4">⏱️</div> */}
              <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : ''}`}>¡Modo Contrarreloj!</h2>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>
                Traduce {phrases.length} frases antes de que se acabe el tiempo
              </p>
              <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
                Tienes {TIME_PER_QUESTION} segundos por frase
              </p>
              
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className={`px-4 py-2 rounded-xl ${isDark ? 'bg-orange-500/30' : 'bg-orange-500/20'}`}>
                  <Flame className={`w-6 h-6 mx-auto mb-1 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : ''}`}>{stats.currentStreak} días</p>
                </div>
                <div className={`px-4 py-2 rounded-xl ${isDark ? 'bg-purple-500/30' : 'bg-purple-500/20'}`}>
                  <Trophy className={`w-6 h-6 mx-auto mb-1 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : ''}`}>{stats.totalPoints} pts</p>
                </div>
              </div>

              <Button size="lg" className={`h-14 px-12 text-lg ${isDark ? 'bg-red-600 hover:bg-red-700' : ''}`} onClick={startGame}>
                ¡Comenzar!
              </Button>
            </div>
          )}

          {/* Playing State */}
          {(gameState === 'playing' || gameState === 'feedback') && currentPhrase && (
            <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
              <div className="space-y-6">
                {/* Progress & Timer */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Pregunta {currentIndex + 1} de {phrases.length}
                  </div>
                  <div className={`text-4xl font-bold ${getTimerColor()}`}>
                    {timeLeft}s
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${((currentIndex + 1) / phrases.length) * 100}%` }}
                  />
                </div>

                {/* Phrase Card */}
                <div className="bg-card rounded-3xl p-8 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      {currentPhrase.difficulty === 'easy' ? '🟢 Fácil' : 
                       currentPhrase.difficulty === 'medium' ? '🟡 Medio' : '🔴 Difícil'}
                    </span>
                    {isSupported && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={speakPhrase}
                        disabled={gameState === 'feedback'}
                      >
                        <Volume2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {currentPhrase.phrase}
                  </h2>
                  
                  {currentPhrase.context && (
                    <p className="text-sm text-muted-foreground italic">
                      "{currentPhrase.context}"
                    </p>
                  )}
                </div>

                {/* Answer Input or Feedback */}
                {gameState === 'playing' ? (
                  <>
                    <Input
                      ref={inputRef}
                      placeholder="Escribe la traducción..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && answer.trim() && checkAnswer()}
                      className="h-14 text-lg rounded-2xl"
                      autoFocus
                    />

                    <div className="flex gap-3">
                      <Button
                        onClick={checkAnswer}
                        disabled={!answer.trim()}
                        className="flex-1 h-14 text-lg rounded-2xl"
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Confirmar
                      </Button>
                      <Button
                        onClick={skipQuestion}
                        variant="secondary"
                        className="h-14 px-6 rounded-2xl"
                      >
                        <SkipForward className="w-5 h-5" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className={`p-6 rounded-2xl ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      {isCorrect ? (
                        <Check className="w-8 h-8 text-green-500" />
                      ) : (
                        <X className="w-8 h-8 text-red-500" />
                      )}
                      <span className="text-xl font-bold">
                        {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground mb-2">
                      Tu respuesta: <span className="font-medium">{answer || '(vacía)'}</span>
                    </p>
                    <p className="font-medium">
                      Respuesta correcta: <span className="text-green-600">{currentPhrase.translation}</span>
                    </p>

                    <Button 
                      onClick={nextQuestion} 
                      className="w-full mt-4 h-12 rounded-xl"
                    >
                      {currentIndex < phrases.length - 1 ? 'Siguiente' : 'Ver Resultados'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Mascot */}
              <div className="hidden md:block">
                <img
                  src={cap4}
                  alt="Capybara mascot"
                  className="w-48 h-auto drop-shadow-2xl"
                />
              </div>
            </div>
          )}

          {/* Summary State */}
          {gameState === 'summary' && (
            <div className={`backdrop-blur rounded-3xl p-8 text-center ${
              isDark ? 'bg-gray-800/95' : 'bg-card/90'
            }`}>
              <div className="text-6xl mb-4">
                {accuracy >= 80 ? '🏆' : accuracy >= 50 ? '👍' : '💪'}
              </div>
              <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : ''}`}>¡Sesión Completada!</h2>
              
              <div className="grid grid-cols-3 gap-4 my-8">
                <div className={`rounded-xl p-4 ${isDark ? 'bg-green-500/30' : 'bg-green-500/20'}`}>
                  <p className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{correctCount}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>Correctas</p>
                </div>
                <div className={`rounded-xl p-4 ${isDark ? 'bg-red-500/30' : 'bg-red-500/20'}`}>
                  <p className={`text-3xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{phrases.length - correctCount}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>Incorrectas</p>
                </div>
                <div className={`rounded-xl p-4 ${isDark ? 'bg-purple-500/30' : 'bg-purple-500/20'}`}>
                  <p className={`text-3xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{score}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>Puntos</p>
                </div>
              </div>

              <div className={`text-5xl font-bold mb-2 ${isDark ? 'text-white' : 'text-primary'}`}>{accuracy}%</div>
              <p className={`mb-8 ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>Precisión</p>

              {/* Results list */}
              <div className="text-left space-y-2 mb-8 max-h-60 overflow-y-auto">
                {results.map((result, i) => (
                  <div 
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      result.correct 
                        ? isDark ? 'bg-green-500/20' : 'bg-green-500/10'
                        : isDark ? 'bg-red-500/20' : 'bg-red-500/10'
                    }`}
                  >
                    {result.correct ? (
                      <Check className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                    ) : (
                      <X className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isDark ? 'text-white' : ''}`}>{result.phrase.phrase}</p>
                      <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
                        {result.userAnswer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button onClick={startGame} className={`flex-1 h-12 ${isDark ? 'bg-red-600 hover:bg-red-700' : ''}`}>
                  Jugar de nuevo
                </Button>
                <Button onClick={() => navigate('/dashboard')} variant="outline" className={`flex-1 h-12 ${isDark ? 'border-gray-600 text-white hover:bg-gray-700' : ''}`}>
                  Volver al inicio
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeTrialPage;
