// Match Cards Game (HU12.2)
// Match phrases with their translations - Two column layout with connecting lines

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shuffle, Trophy, Flame, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ParticlesBackground from "@/components/ParticlesBackground";
import { useTheme } from "@/hooks/useTheme";
import { SavedPhrase } from "@/types/phrases";
import { fetchPhrases, getRandomPhrases } from "@/services/phrasesService";
import { getUserStats, completePracticeSession } from "@/services/gamificationService";
import { playCorrect, playWrong, playComplete, playClick } from "@/services/soundService";
import confetti from "canvas-confetti";
import logo from "@/assets/logo.png";

type GameState = 'loading' | 'ready' | 'playing' | 'complete' | 'empty';

interface CardItem {
  id: string;
  text: string;
  phraseId: string;
  type: 'phrase' | 'translation';
  index: number; // Position in its column
}

interface MatchedLine {
  phraseId: string;
  leftIndex: number;
  rightIndex: number;
}

const CARDS_PER_GAME = 6; // 6 pairs

export const MatchCards = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game state
  const [gameState, setGameState] = useState<GameState>('loading');
  const [phrases, setPhrases] = useState<SavedPhrase[]>([]);
  const [leftColumn, setLeftColumn] = useState<CardItem[]>([]); // English phrases
  const [rightColumn, setRightColumn] = useState<CardItem[]>([]); // Spanish translations
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<MatchedLine[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState(getUserStats());
  const [isChecking, setIsChecking] = useState(false);
  const [wrongPair, setWrongPair] = useState<{left: string, right: string} | null>(null);

  // Load phrases
  useEffect(() => {
    const loadPhrases = async () => {
      try {
        const allPhrases = await fetchPhrases();
        if (allPhrases.length < 3) {
          setGameState('empty');
          return;
        }
        setPhrases(allPhrases);
        setGameState('ready');
      } catch (error) {
        console.error('Error loading phrases:', error);
        setGameState('empty');
      }
    };
    loadPhrases();
  }, []);

  // Prepare cards for the game
  const prepareGame = () => {
    const selectedPhrases = getRandomPhrases(phrases, CARDS_PER_GAME);
    
    // Create left column (English phrases) - shuffled
    const left: CardItem[] = selectedPhrases.map((phrase, idx) => ({
      id: `phrase-${phrase.id}`,
      text: phrase.phrase,
      phraseId: phrase.id,
      type: 'phrase' as const,
      index: idx,
    })).sort(() => Math.random() - 0.5).map((item, idx) => ({ ...item, index: idx }));

    // Create right column (Spanish translations) - shuffled differently
    const right: CardItem[] = selectedPhrases.map((phrase, idx) => ({
      id: `trans-${phrase.id}`,
      text: phrase.translation,
      phraseId: phrase.id,
      type: 'translation' as const,
      index: idx,
    })).sort(() => Math.random() - 0.5).map((item, idx) => ({ ...item, index: idx }));

    setLeftColumn(left);
    setRightColumn(right);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs([]);
    setAttempts(0);
    setScore(0);
    setStreak(0);
    setWrongPair(null);
    setGameState('playing');
  };

  // Handle left column card click
  const handleLeftClick = (cardId: string) => {
    if (isChecking) return;
    const card = leftColumn.find(c => c.id === cardId);
    if (!card) return;
    if (matchedPairs.some(m => m.phraseId === card.phraseId)) return;

    playClick();
    setSelectedLeft(cardId);

    // If right is already selected, check for match
    if (selectedRight) {
      checkMatch(cardId, selectedRight);
    }
  };

  // Handle right column card click
  const handleRightClick = (cardId: string) => {
    if (isChecking) return;
    const card = rightColumn.find(c => c.id === cardId);
    if (!card) return;
    if (matchedPairs.some(m => m.phraseId === card.phraseId)) return;

    playClick();
    setSelectedRight(cardId);

    // If left is already selected, check for match
    if (selectedLeft) {
      checkMatch(selectedLeft, cardId);
    }
  };

  // Check if selected pair matches
  const checkMatch = (leftId: string, rightId: string) => {
    setIsChecking(true);
    setAttempts(prev => prev + 1);

    const leftCard = leftColumn.find(c => c.id === leftId)!;
    const rightCard = rightColumn.find(c => c.id === rightId)!;
    
    const isMatch = leftCard.phraseId === rightCard.phraseId;

    setTimeout(() => {
      if (isMatch) {
        playCorrect();
        const newMatch: MatchedLine = {
          phraseId: leftCard.phraseId,
          leftIndex: leftCard.index,
          rightIndex: rightCard.index,
        };
        setMatchedPairs(prev => [...prev, newMatch]);
        setStreak(prev => prev + 1);
        const streakBonus = streak * 5;
        setScore(prev => prev + 20 + streakBonus);
      } else {
        playWrong();
        setStreak(0);
        setWrongPair({ left: leftId, right: rightId });
        setTimeout(() => setWrongPair(null), 500);
      }
      
      setSelectedLeft(null);
      setSelectedRight(null);
      setIsChecking(false);
    }, 600);
  };

  // Handle game completion
  const handleGameComplete = () => {
    playComplete();
    const totalPairs = leftColumn.length;
    const result = completePracticeSession('matchcards', totalPairs, totalPairs);
    setStats(result.stats);
    
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });
    
    setGameState('complete');
  };

  // Check if game is complete
  useEffect(() => {
    if (gameState === 'playing' && matchedPairs.length === leftColumn.length && leftColumn.length > 0) {
      handleGameComplete();
    }
  }, [matchedPairs.length, leftColumn.length, gameState]);

  // Calculate efficiency
  const efficiency = attempts > 0 ? Math.round((matchedPairs.length / attempts) * 100) : 0;

  // Get card state for left column
  const getLeftCardState = (card: CardItem) => {
    if (matchedPairs.some(m => m.phraseId === card.phraseId)) return 'matched';
    if (wrongPair?.left === card.id) return 'wrong';
    if (selectedLeft === card.id) return 'selected';
    return 'default';
  };

  // Get card state for right column
  const getRightCardState = (card: CardItem) => {
    if (matchedPairs.some(m => m.phraseId === card.phraseId)) return 'matched';
    if (wrongPair?.right === card.id) return 'wrong';
    if (selectedRight === card.id) return 'selected';
    return 'default';
  };

  // Calculate line positions for SVG
  const getLineY = (index: number, totalItems: number) => {
    const itemHeight = 100 / totalItems;
    return itemHeight * index + itemHeight / 2;
  };

  return (
    <div className={`min-h-screen relative overflow-hidden flex flex-col transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900' 
        : 'bg-gradient-to-br from-blue-100 via-purple-50 to-cyan-100'
    }`}>
      <ParticlesBackground 
        particleCount={25}
        colors={['#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e']}
        darkColors={['#60a5fa', '#a78bfa', '#22d3ee', '#4ade80']}
      />

      <div className="relative z-10 flex-1 flex flex-col p-4 md:p-6 pl-20 lg:pl-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Shuffle className="w-7 h-7 text-blue-500" />
            Emparejar
          </h1>
          {gameState === 'playing' && (
            <div className="flex items-center gap-3">
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
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando frases...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {gameState === 'empty' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center bg-card/90 backdrop-blur rounded-3xl p-8 max-w-md">
              <Shuffle className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Necesitas más frases</h2>
              <p className="text-muted-foreground mb-6">
                Agrega al menos 3 frases para jugar.
              </p>
              <Button onClick={() => navigate('/phrases')}>Ir a Mis Frases</Button>
            </div>
          </div>
        )}

        {/* Ready State */}
        {gameState === 'ready' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center bg-card/90 backdrop-blur rounded-3xl p-8 max-w-md dark:bg-blue-900">
              <h2 className="text-3xl font-bold mb-2">¡Emparejar Cartas!</h2>
              <p className="text-muted-foreground mb-2">
                Encuentra los pares de frases y traducciones
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {Math.min(CARDS_PER_GAME, phrases.length)} pares para emparejar
              </p>
              
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="bg-orange-500/20 px-4 py-2 rounded-xl">
                  <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                  <p className="text-sm font-bold">{stats.currentStreak} días</p>
                </div>
                <div className="bg-purple-500/20 px-4 py-2 rounded-xl">
                  <Trophy className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                  <p className="text-sm font-bold">{stats.totalPoints} pts</p>
                </div>
              </div>

              <Button size="lg" className="h-14 px-12 text-lg" onClick={prepareGame}>
                ¡Comenzar!
              </Button>
            </div>
          </div>
        )}

        {/* Playing State - Two Column Layout */}
        {gameState === 'playing' && (
          <div className="flex-1 flex flex-col">
            {/* Progress */}
            <div className={`flex items-center justify-between mb-4 px-4 py-2 rounded-xl ${
              isDark ? 'bg-gray-800/50' : 'bg-white/50'
            }`}>
              <div className="text-sm text-muted-foreground">
                Parejas: {matchedPairs.length} / {leftColumn.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Intentos: {attempts}
              </div>
            </div>

            {/* Progress bar */}
            <div className={`w-full rounded-full h-2 mb-6 ${isDark ? 'bg-gray-700' : 'bg-muted'}`}>
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(matchedPairs.length / leftColumn.length) * 100}%` }}
              />
            </div>

            {/* Two Column Layout with Lines */}
            <div className="flex-1 relative" ref={containerRef}>
              <div className="grid grid-cols-[1fr_80px_1fr] md:grid-cols-[1fr_120px_1fr] gap-2 h-full max-w-4xl mx-auto">
                {/* Left Column - English */}
                <div className="flex flex-col gap-3">
                  <div className={`text-center py-2 rounded-lg font-bold text-sm ${
                    isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    🇬🇧 English
                  </div>
                  {leftColumn.map((card) => {
                    const state = getLeftCardState(card);
                    return (
                      <button
                        key={card.id}
                        onClick={() => handleLeftClick(card.id)}
                        disabled={state === 'matched' || isChecking}
                        className={`
                          relative p-3 md:p-4 rounded-xl min-h-[60px] md:min-h-[70px]
                          transition-all duration-300 transform text-left
                          ${state === 'matched' 
                            ? 'bg-green-500/20 border-2 border-green-500 scale-95' 
                            : state === 'wrong'
                            ? 'bg-red-500/30 border-2 border-red-500 animate-shake'
                            : state === 'selected'
                            ? `${isDark ? 'bg-blue-600' : 'bg-blue-500'} text-white scale-105 shadow-lg ring-2 ring-blue-400`
                            : `${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-blue-50'} border-2 border-transparent hover:border-blue-300`
                          }
                        `}
                      >
                        <span className={`text-sm md:text-base font-medium ${
                          state === 'matched' ? 'text-green-700 dark:text-green-400' : ''
                        }`}>
                          {card.text}
                        </span>
                        {state === 'matched' && (
                          <Check className="absolute top-2 right-2 w-4 h-4 text-green-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Center - Connection Lines */}
                <div className="relative flex items-center justify-center">
                  <svg 
                    className="absolute inset-0 w-full h-full" 
                    style={{ top: '40px' }}
                    preserveAspectRatio="none"
                  >
                    {matchedPairs.map((match, idx) => {
                      const y1 = getLineY(match.leftIndex, leftColumn.length);
                      const y2 = getLineY(match.rightIndex, rightColumn.length);
                      return (
                        <line
                          key={match.phraseId}
                          x1="0"
                          y1={`${y1}%`}
                          x2="100%"
                          y2={`${y2}%`}
                          stroke={isDark ? '#4ade80' : '#22c55e'}
                          strokeWidth="3"
                          strokeLinecap="round"
                          className="animate-draw-line"
                          style={{
                            filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.5))',
                            animationDelay: `${idx * 100}ms`
                          }}
                        />
                      );
                    })}
                  </svg>
                  
                  {/* Center decoration */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  } shadow-lg`}>
                    <Shuffle className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                  </div>
                </div>

                {/* Right Column - Spanish */}
                <div className="flex flex-col gap-3">
                  <div className={`text-center py-2 rounded-lg font-bold text-sm ${
                    isDark ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'
                  }`}>
                    🇪🇸 Español
                  </div>
                  {rightColumn.map((card) => {
                    const state = getRightCardState(card);
                    return (
                      <button
                        key={card.id}
                        onClick={() => handleRightClick(card.id)}
                        disabled={state === 'matched' || isChecking}
                        className={`
                          relative p-3 md:p-4 rounded-xl min-h-[60px] md:min-h-[70px]
                          transition-all duration-300 transform text-left
                          ${state === 'matched' 
                            ? 'bg-green-500/20 border-2 border-green-500 scale-95' 
                            : state === 'wrong'
                            ? 'bg-red-500/30 border-2 border-red-500 animate-shake'
                            : state === 'selected'
                            ? `${isDark ? 'bg-purple-600' : 'bg-purple-500'} text-white scale-105 shadow-lg ring-2 ring-purple-400`
                            : `${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-purple-50'} border-2 border-transparent hover:border-purple-300`
                          }
                        `}
                      >
                        <span className={`text-sm md:text-base font-medium ${
                          state === 'matched' ? 'text-green-700 dark:text-green-400' : ''
                        }`}>
                          {card.text}
                        </span>
                        {state === 'matched' && (
                          <Check className="absolute top-2 right-2 w-4 h-4 text-green-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className={`text-center mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
              Selecciona una palabra en inglés y su traducción en español
            </div>
          </div>
        )}

        {/* Complete State */}
        {gameState === 'complete' && (
          <div className="flex-1 flex items-center justify-center">
            <div className={`backdrop-blur rounded-3xl p-8 text-center max-w-md w-full ${
              isDark ? 'bg-gray-800/95' : 'bg-card/90'
            }`}>
              {/* <div className="text-6xl mb-4">🎉</div> */}
              <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : ''}`}>¡Completado!</h2>
              
              <div className="grid grid-cols-3 gap-4 my-8">
                <div className={`rounded-xl p-4 ${isDark ? 'bg-green-500/30' : 'bg-green-500/20'}`}>
                  <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{matchedPairs.length}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>Parejas</p>
                </div>
                <div className={`rounded-xl p-4 ${isDark ? 'bg-blue-500/30' : 'bg-blue-500/20'}`}>
                  <p className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{attempts}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>Intentos</p>
                </div>
                <div className={`rounded-xl p-4 ${isDark ? 'bg-purple-500/30' : 'bg-purple-500/20'}`}>
                  <p className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{score}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>Puntos</p>
                </div>
              </div>

              <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-primary'}`}>{efficiency}%</div>
              <p className={`mb-8 ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>Eficiencia</p>

              <div className="flex gap-4">
                <Button onClick={prepareGame} className={`flex-1 h-12 ${isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Jugar de nuevo
                </Button>
                <Button onClick={() => navigate('/dashboard')} variant="outline" className={`flex-1 h-12 ${isDark ? 'border-gray-600 text-white hover:bg-gray-700' : ''}`}>
                  Volver
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with mascot - only in playing state */}
      {gameState === 'playing' && (
        <div className="relative z-10 p-4 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <img
              src={logo}
              alt="Parla mascot"
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
