// Dictionary Page
// Search and manage vocabulary words

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Book, 
  Plus, 
  Volume2, 
  Star, 
  StarOff,
  Check,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  Trash2,
  Globe,
  BarChart3,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import ParticlesBackground from '@/components/ParticlesBackground';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { DictionaryWord, DictionaryFilters, DictionarySort, DICTIONARY_SORT_NAMES } from '@/types/dictionary';
import { 
  LANGUAGE_NAMES, 
  GRAMMATICAL_CATEGORY_NAMES,
  GRAMMATICAL_CATEGORY_COLORS,
  GrammaticalCategory,
  Language,
  Difficulty,
} from '@/types/phrases';
import {
  searchWords,
  filterWords,
  sortWords,
  getWordStats,
} from '@/services/dictionaryService';
import { lookupWord } from '@/services/translationService';
import { useDictionary } from '@/contexts/DictionaryContext';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import logo from '@/assets/logo.png';

const Dictionary = () => {
  const { speak, isSpeaking, isSupported } = useSpeechSynthesis();
  const { toast } = useToast();
  const { isDark } = useTheme();
  
  // Use dictionary context for cached data
  const { 
    words, 
    isLoading, 
    isImporting, 
    importProgress, 
    loadDictionary, 
    addWord: addWordToContext,
    updateWord: updateWordInContext,
    deleteWord: deleteWordFromContext,
    isInitialized 
  } = useDictionary();
  
  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<DictionarySort>('alphabetical');
  const [filters, setFilters] = useState<DictionaryFilters>({
    language: 'all',
    wordType: 'all',
    difficulty: 'all',
    status: 'all',
  });
  const [expandedWord, setExpandedWord] = useState<string | null>(null);
  const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [wordToDelete, setWordToDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  
  // Load dictionary on mount (uses cache if available)
  useEffect(() => {
    if (!isInitialized) {
      loadDictionary();
    }
  }, [isInitialized, loadDictionary]);

  // New word form
  const [newWord, setNewWord] = useState({
    word: '',
    translation: '',
    pronunciation: '',
    definition: '',
    example: '',
    exampleTranslation: '',
    language: 'en' as Language,
    targetLanguage: 'es' as Language,
    difficulty: 'medium' as Difficulty,
    wordType: 'noun' as GrammaticalCategory,
  });

  // Filter and sort words
  const displayedWords = useMemo(() => {
    let result = [...words];
    
    // Search
    if (searchQuery) {
      result = searchWords(result, searchQuery);
    }
    
    // Filter
    result = filterWords(result, filters);
    
    // Sort
    result = sortWords(result, sort);
    
    return result;
  }, [words, searchQuery, filters, sort]);

  // Stats
  const stats = useMemo(() => getWordStats(words), [words]);

  // Handlers
  const handleSpeak = (text: string, wordId: string, lang: string) => {
    if (isSupported) {
      setSpeakingWordId(wordId);
      speak(text);
      setTimeout(() => setSpeakingWordId(null), 2000);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const word = words.find(w => w.id === id);
    if (word) {
      updateWordInContext(id, { isFavorite: !word.isFavorite });
    }
  };

  const handleToggleLearned = (id: string) => {
    const word = words.find(w => w.id === id);
    if (word) {
      updateWordInContext(id, { isLearned: !word.isLearned });
    }
  };

  const handleDeleteClick = (id: string) => {
    setWordToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Auto-lookup word using APIs
  const handleLookupWord = async () => {
    if (!newWord.word.trim()) {
      toast({
        title: 'Ingresa una palabra',
        description: 'Escribe la palabra que deseas buscar',
        variant: 'destructive',
      });
      return;
    }

    setIsLookingUp(true);
    
    try {
      const result = await lookupWord(
        newWord.word.trim(),
        newWord.language,
        newWord.targetLanguage
      );

      if (result.error) {
        toast({
          title: 'Error en la búsqueda',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      // Update form with results
      setNewWord(prev => ({
        ...prev,
        translation: result.translation || prev.translation,
        pronunciation: result.pronunciation || prev.pronunciation,
        definition: result.definitions[0]?.meaning || prev.definition,
        example: result.examples[0]?.sentence || prev.example,
        wordType: result.definitions[0]?.partOfSpeech || prev.wordType,
      }));

      toast({
        title: '¡Palabra encontrada!',
        description: `Traducción: ${result.translation}${result.definitions.length > 0 ? ` | ${result.definitions.length} definiciones` : ''}`,
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo buscar la palabra',
        variant: 'destructive',
      });
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleConfirmDelete = () => {
    if (wordToDelete) {
      deleteWordFromContext(wordToDelete);
    }
    setIsDeleteDialogOpen(false);
    setWordToDelete(null);
  };

  const handleAddWord = () => {
    if (!newWord.word.trim() || !newWord.translation.trim()) return;

    const created: DictionaryWord = {
      id: `word_${Date.now()}`,
      word: newWord.word,
      translation: newWord.translation,
      pronunciation: newWord.pronunciation || '',
      definitions: newWord.definition ? [
        { id: `d${Date.now()}`, meaning: newWord.definition, partOfSpeech: newWord.wordType }
      ] : [],
      examples: newWord.example ? [
        { id: `e${Date.now()}`, sentence: newWord.example, translation: newWord.exampleTranslation }
      ] : [],
      synonyms: [],
      antonyms: [],
      language: newWord.language,
      targetLanguage: newWord.targetLanguage,
      difficulty: newWord.difficulty,
      wordType: newWord.wordType,
      isFavorite: false,
      isLearned: false,
      createdAt: new Date(),
      reviewCount: 0,
    };

    addWordToContext(created);
    setNewWord({
      word: '',
      translation: '',
      pronunciation: '',
      definition: '',
      example: '',
      exampleTranslation: '',
      language: 'en',
      targetLanguage: 'es',
      difficulty: 'medium',
      wordType: 'noun',
    });
    setIsAddDialogOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      language: 'all',
      wordType: 'all',
      difficulty: 'all',
      status: 'all',
    });
  };

  const hasActiveFilters = filters.language !== 'all' || 
    filters.wordType !== 'all' || 
    filters.difficulty !== 'all' || 
    filters.status !== 'all';

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900/10 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-100'
    }`}>
      <ParticlesBackground 
        particleCount={20}
        colors={['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981']}
        darkColors={['#60a5fa', '#a78bfa', '#22d3ee', '#34d399']}
      />

      <div className="relative z-10">
        {/* Header */}
        <header className={`sticky top-0 z-20 backdrop-blur border-b transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-900/95 border-gray-700' 
            : 'bg-background/95 border-border'
        }`}>
          <div className="max-w-7xl mx-auto px-4 py-4 pl-20 lg:pl-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
                    <Book className="w-6 h-6 text-blue-500" />
                    Mi Diccionario
                  </h1>
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    {stats.total} palabras · {stats.learned} aprendidas · {stats.favorites} favoritas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Agregar</span>
                </Button>
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-lg">
                  <img src={logo} alt="Parla mascot" className="w-12 h-12 object-contain" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar palabras, definiciones, sinónimos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl"
              />
            </div>

            <Select value={sort} onValueChange={(v) => setSort(v as DictionarySort)}>
              <SelectTrigger className="w-[160px] h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DICTIONARY_SORT_NAMES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  !
                </Badge>
              )}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-card rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
              <Select 
                value={filters.language} 
                onValueChange={(v) => setFilters(f => ({ ...f, language: v as Language | 'all' }))}
              >
                <SelectTrigger className="w-[140px] h-10">
                  <Globe className="w-4 h-4 mr-2 text-blue-500" />
                  <SelectValue placeholder="Idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                    <SelectItem key={code} value={code}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.wordType} 
                onValueChange={(v) => setFilters(f => ({ ...f, wordType: v as GrammaticalCategory | 'all' }))}
              >
                <SelectTrigger className="w-[140px] h-10">
                  <BookOpen className="w-4 h-4 mr-2 text-teal-500" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(GRAMMATICAL_CATEGORY_NAMES).map(([code, name]) => (
                    <SelectItem key={code} value={code}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.difficulty} 
                onValueChange={(v) => setFilters(f => ({ ...f, difficulty: v as Difficulty | 'all' }))}
              >
                <SelectTrigger className="w-[130px] h-10">
                  <BarChart3 className="w-4 h-4 mr-2 text-orange-500" />
                  <SelectValue placeholder="Dificultad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="easy">🟢 Fácil</SelectItem>
                  <SelectItem value="medium">🟡 Medio</SelectItem>
                  <SelectItem value="hard">🔴 Difícil</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.status} 
                onValueChange={(v) => setFilters(f => ({ ...f, status: v as 'all' | 'learned' | 'learning' | 'favorites' }))}
              >
                <SelectTrigger className="w-[140px] h-10">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="learned">✅ Aprendidas</SelectItem>
                  <SelectItem value="learning">📚 Aprendiendo</SelectItem>
                  <SelectItem value="favorites">⭐ Favoritas</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpiar
                </Button>
              )}

              <div className="ml-auto text-sm text-muted-foreground">
                {displayedWords.length} de {words.length} palabras
              </div>
            </div>
          )}

          {/* Words List */}
          {isLoading || isImporting ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card/80 backdrop-blur rounded-3xl">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {isImporting ? 'Importando palabras...' : 'Cargando diccionario...'}
              </h3>
              {isImporting && importProgress.total > 0 && (
                <div className="w-64">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Procesando palabras</span>
                    <span>{importProgress.current}/{importProgress.total}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Buscando traducciones y definiciones...
                  </p>
                </div>
              )}
            </div>
          ) : displayedWords.length === 0 ? (
            <div className="text-center py-20 bg-card/80 backdrop-blur rounded-3xl">
              <Book className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery || hasActiveFilters ? 'No se encontraron palabras' : 'Tu diccionario está vacío'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || hasActiveFilters
                  ? 'Intenta con otros filtros o términos'
                  : 'Comienza agregando palabras a tu diccionario'}
              </p>
              {!searchQuery && !hasActiveFilters && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Agregar palabra
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {displayedWords.map((word) => (
                <div
                  key={word.id}
                  className="bg-card/90 backdrop-blur rounded-2xl shadow-sm border border-border overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Word Header */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedWord(expandedWord === word.id ? null : word.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-foreground">{word.word}</h3>
                          {word.pronunciation && (
                            <span className="text-sm text-muted-foreground">{word.pronunciation}</span>
                          )}
                          <Badge className={GRAMMATICAL_CATEGORY_COLORS[word.wordType]}>
                            {GRAMMATICAL_CATEGORY_NAMES[word.wordType]}
                          </Badge>
                        </div>
                        <p className="text-lg text-primary font-medium">{word.translation}</p>
                        {word.definitions[0] && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {word.definitions[0].meaning}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isSupported && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSpeak(word.word, word.id, word.language);
                            }}
                            className={speakingWordId === word.id ? 'text-primary' : ''}
                          >
                            <Volume2 className="w-5 h-5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(word.id);
                          }}
                        >
                          {word.isFavorite ? (
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff className="w-5 h-5 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLearned(word.id);
                          }}
                        >
                          {word.isLearned ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground" />
                          )}
                        </Button>
                        {expandedWord === word.id ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {word.tags && word.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {word.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expanded Content */}
                  {expandedWord === word.id && (
                    <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                      {/* Definitions */}
                      {word.definitions.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-2">Definiciones</h4>
                          <ul className="space-y-2">
                            {word.definitions.map((def, i) => (
                              <li key={def.id} className="flex gap-2">
                                <span className="text-primary font-bold">{i + 1}.</span>
                                <div>
                                  <span className="text-foreground">{def.meaning}</span>
                                  {def.usage && (
                                    <span className="text-muted-foreground italic ml-2">({def.usage})</span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Examples */}
                      {word.examples.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-2">Ejemplos</h4>
                          <ul className="space-y-2">
                            {word.examples.map((ex) => (
                              <li key={ex.id} className="bg-muted/50 rounded-lg p-3">
                                <p className="text-foreground italic">"{ex.sentence}"</p>
                                <p className="text-primary text-sm mt-1">→ {ex.translation}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Synonyms & Antonyms */}
                      <div className="flex flex-wrap gap-4">
                        {word.synonyms && word.synonyms.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Sinónimos</h4>
                            <div className="flex flex-wrap gap-1">
                              {word.synonyms.map((syn, i) => (
                                <Badge key={i} variant="secondary">{syn}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {word.antonyms && word.antonyms.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Antónimos</h4>
                            <div className="flex flex-wrap gap-1">
                              {word.antonyms.map((ant, i) => (
                                <Badge key={i} variant="outline">{ant}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end pt-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(word.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add Word Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar palabra</DialogTitle>
            <DialogDescription>
              Añade una nueva palabra a tu diccionario personal
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Word input with lookup button */}
            <div>
              <Label>Palabra *</Label>
              <div className="flex gap-2">
                <Input
                  value={newWord.word}
                  onChange={(e) => setNewWord(w => ({ ...w, word: e.target.value }))}
                  placeholder="Hello"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleLookupWord()}
                />
                <Button 
                  type="button"
                  onClick={handleLookupWord}
                  disabled={isLookingUp || !newWord.word.trim()}
                  className="gap-2"
                >
                  {isLookingUp ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Buscar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Presiona "Buscar" para auto-completar traducción y definición
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Idioma origen</Label>
                <Select 
                  value={newWord.language} 
                  onValueChange={(v) => setNewWord(w => ({ ...w, language: v as Language }))}
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
              <div>
                <Label>Idioma destino</Label>
                <Select 
                  value={newWord.targetLanguage} 
                  onValueChange={(v) => setNewWord(w => ({ ...w, targetLanguage: v as Language }))}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Traducción *</Label>
                <Input
                  value={newWord.translation}
                  onChange={(e) => setNewWord(w => ({ ...w, translation: e.target.value }))}
                  placeholder="Hola"
                />
              </div>
              <div>
                <Label>Pronunciación</Label>
                <Input
                  value={newWord.pronunciation}
                  onChange={(e) => setNewWord(w => ({ ...w, pronunciation: e.target.value }))}
                  placeholder="/həˈloʊ/"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de palabra</Label>
                <Select 
                  value={newWord.wordType} 
                  onValueChange={(v) => setNewWord(w => ({ ...w, wordType: v as GrammaticalCategory }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GRAMMATICAL_CATEGORY_NAMES).map(([code, name]) => (
                      <SelectItem key={code} value={code}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Dificultad</Label>
                <Select 
                  value={newWord.difficulty} 
                  onValueChange={(v) => setNewWord(w => ({ ...w, difficulty: v as Difficulty }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Medio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Definición</Label>
              <Textarea
                value={newWord.definition}
                onChange={(e) => setNewWord(w => ({ ...w, definition: e.target.value }))}
                placeholder="Significado de la palabra..."
                rows={2}
              />
            </div>

            <div>
              <Label>Ejemplo</Label>
              <Input
                value={newWord.example}
                onChange={(e) => setNewWord(w => ({ ...w, example: e.target.value }))}
                placeholder="Hello, how are you?"
                className="mb-2"
              />
              <Input
                value={newWord.exampleTranslation}
                onChange={(e) => setNewWord(w => ({ ...w, exampleTranslation: e.target.value }))}
                placeholder="Hola, ¿cómo estás?"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddWord} disabled={!newWord.word.trim() || !newWord.translation.trim()}>
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar palabra?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La palabra será eliminada permanentemente de tu diccionario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dictionary;
