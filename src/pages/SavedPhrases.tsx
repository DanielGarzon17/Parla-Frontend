// SavedPhrases page - HU06, HU07, HU15
// Lista personal de frases guardadas con pronunciación y filtros avanzados

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Volume2, Plus, BookOpen, Globe, BarChart3, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/hooks/useTheme';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PhraseCard from '@/components/PhraseCard';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { 
  SavedPhrase, 
  PhraseFilter, 
  PhraseSort, 
  Language, 
  Difficulty,
  GrammaticalCategory,
  LANGUAGE_NAMES,
  DIFFICULTY_NAMES,
  CATEGORIES,
  GRAMMATICAL_CATEGORY_NAMES,
  GRAMMATICAL_CATEGORY_COLORS,
} from '@/types/phrases';
import {
  fetchPhrases,
  toggleFavorite,
  toggleLearned,
  deletePhrase,
  addPhrase,
  filterPhrases,
  sortPhrases,
  searchPhrases,
  filterByLanguage,
  filterByDifficulty,
  filterByCategory,
  filterByWordType,
  getUniqueCategories,
  getUniqueWordTypes,
} from '@/services/phrasesService';
import logo from '@/assets/logo.png';

const SavedPhrases = () => {
  const { speak, stop, isSpeaking, isSupported, voices, selectedVoice, setSelectedVoice } = useSpeechSynthesis();
  const { isDark } = useTheme();

  // State
  const [phrases, setPhrases] = useState<SavedPhrase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<PhraseFilter>('all');
  const [sort, setSort] = useState<PhraseSort>('newest');
  const [speakingPhraseId, setSpeakingPhraseId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [phraseToDelete, setPhraseToDelete] = useState<string | null>(null);
  
  // HU15 - Additional filters
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  // HU16 - Word type filter
  const [wordTypeFilter, setWordTypeFilter] = useState<string>('all');

  // New phrase form state
  const [newPhrase, setNewPhrase] = useState({
    phrase: '',
    translation: '',
    context: '',
    category: '',
    language: 'en' as const,
    difficulty: 'medium' as const,
    wordType: 'phrase' as GrammaticalCategory,
  });

  // Load phrases on mount
  useEffect(() => {
    const loadPhrases = async () => {
      try {
        const data = await fetchPhrases();
        setPhrases(data);
      } catch (error) {
        console.error('Error loading phrases:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPhrases();
  }, []);

  // Filter and sort phrases (HU15, HU16)
  const displayedPhrases = useMemo(() => {
    let result = [...phrases];
    
    // Apply search
    if (searchQuery) {
      result = searchPhrases(result, searchQuery);
    }
    
    // Apply basic filter
    result = filterPhrases(result, filter);
    
    // Apply language filter (HU15)
    if (languageFilter !== 'all') {
      result = filterByLanguage(result, languageFilter as Language);
    }
    
    // Apply difficulty filter (HU15)
    if (difficultyFilter !== 'all') {
      result = filterByDifficulty(result, difficultyFilter as Difficulty);
    }
    
    // Apply category filter (HU15)
    if (categoryFilter !== 'all') {
      result = filterByCategory(result, categoryFilter);
    }
    
    // Apply word type filter (HU16)
    if (wordTypeFilter !== 'all') {
      result = filterByWordType(result, wordTypeFilter as GrammaticalCategory);
    }
    
    // Apply sort
    result = sortPhrases(result, sort);
    
    return result;
  }, [phrases, searchQuery, filter, sort, languageFilter, difficultyFilter, categoryFilter, wordTypeFilter]);
  
  // Get unique categories for filter dropdown
  const availableCategories = useMemo(() => getUniqueCategories(phrases), [phrases]);
  
  // Get unique word types for filter dropdown (HU16)
  const availableWordTypes = useMemo(() => getUniqueWordTypes(phrases), [phrases]);

  // Stats
  const stats = useMemo(() => ({
    total: phrases.length,
    learned: phrases.filter(p => p.isLearned).length,
    favorites: phrases.filter(p => p.isFavorite).length,
  }), [phrases]);

  // Handlers
  const handleSpeak = (text: string, phraseId: string) => {
    if (speakingPhraseId === phraseId && isSpeaking) {
      stop();
      setSpeakingPhraseId(null);
    } else {
      speak(text);
      setSpeakingPhraseId(phraseId);
    }
  };

  // Reset speaking state when speech ends
  useEffect(() => {
    if (!isSpeaking) {
      setSpeakingPhraseId(null);
    }
  }, [isSpeaking]);

  const handleToggleFavorite = async (id: string) => {
    const updated = await toggleFavorite(id);
    if (updated) {
      setPhrases(prev => prev.map(p => p.id === id ? updated : p));
    }
  };

  const handleToggleLearned = async (id: string) => {
    const updated = await toggleLearned(id);
    if (updated) {
      setPhrases(prev => prev.map(p => p.id === id ? updated : p));
    }
  };

  const handleDeleteClick = (id: string) => {
    setPhraseToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (phraseToDelete) {
      const success = await deletePhrase(phraseToDelete);
      if (success) {
        setPhrases(prev => prev.filter(p => p.id !== phraseToDelete));
      }
    }
    setIsDeleteDialogOpen(false);
    setPhraseToDelete(null);
  };

  const handleAddPhrase = async () => {
    if (!newPhrase.phrase.trim() || !newPhrase.translation.trim()) return;

    const created = await addPhrase({
      phrase: newPhrase.phrase,
      translation: newPhrase.translation,
      context: newPhrase.context || undefined,
      category: newPhrase.category || undefined,
      language: newPhrase.language,
      difficulty: newPhrase.difficulty,
      wordType: newPhrase.wordType,
      isFavorite: false,
      isLearned: false,
    });

    setPhrases(prev => [created, ...prev]);
    setNewPhrase({ phrase: '', translation: '', context: '', category: '', language: 'en', difficulty: 'medium', wordType: 'phrase' });
    setIsAddDialogOpen(false);
  };

  // English voices for the voice selector
  const englishVoices = voices.filter(v => v.lang.startsWith('en-'));

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-emerald-900/10 to-gray-900' 
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-purple-100'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-900/95 border-gray-700' 
          : 'bg-background/95 border-border'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4 pl-20 lg:pl-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                  Mis Frases Guardadas
                </h1>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  {stats.total} frases · {stats.learned} aprendidas · {stats.favorites} favoritas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Voice selector for pronunciation */}
              {isSupported && englishVoices.length > 0 && (
                <Select
                  value={selectedVoice?.name || ''}
                  onValueChange={(name) => {
                    const voice = voices.find(v => v.name === name);
                    if (voice) setSelectedVoice(voice);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <Volume2 className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Seleccionar voz" />
                  </SelectTrigger>
                  <SelectContent>
                    {englishVoices.map((voice) => (
                      <SelectItem key={voice.name} value={voice.name}>
                        {voice.name.split(' ').slice(0, 2).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg">
                <img
                  src={logo}
                  alt="Parla mascot"
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search and Basic Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar frases, traducciones, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>

          {/* Filter */}
          <Select value={filter} onValueChange={(v) => setFilter(v as PhraseFilter)}>
            <SelectTrigger className="w-[150px] h-12 rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="favorites">Favoritas</SelectItem>
              <SelectItem value="learned">Aprendidas</SelectItem>
              <SelectItem value="new">Por aprender</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sort} onValueChange={(v) => setSort(v as PhraseSort)}>
            <SelectTrigger className="w-[150px] h-12 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="oldest">Más antiguas</SelectItem>
              <SelectItem value="alphabetical">Alfabético</SelectItem>
            </SelectContent>
          </Select>

          {/* Add Button */}
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="h-12 px-6 rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar
          </Button>
        </div>

        {/* HU15 - Advanced Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Language Filter */}
          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="w-[200px] h-10 rounded-lg bg-card">
              <SelectValue placeholder="Idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los idiomas</SelectItem>
              {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                <SelectItem key={code} value={code}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Difficulty Filter */}
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[200px] h-10 rounded-lg bg-card">
              <SelectValue placeholder="Dificultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las dificultades</SelectItem>
              <SelectItem value="easy">🟢 Fácil</SelectItem>
              <SelectItem value="medium">🟡 Medio</SelectItem>
              <SelectItem value="hard">🔴 Difícil</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px] h-10 rounded-lg bg-card">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {availableCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* HU16 - Word Type Filter */}
          <Select value={wordTypeFilter} onValueChange={setWordTypeFilter}>
            <SelectTrigger className="w-[200px] h-10 rounded-lg bg-card">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {availableWordTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${GRAMMATICAL_CATEGORY_COLORS[type]}`}>
                    {GRAMMATICAL_CATEGORY_NAMES[type]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear filters button */}
          {(languageFilter !== 'all' || difficultyFilter !== 'all' || categoryFilter !== 'all' || wordTypeFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLanguageFilter('all');
                setDifficultyFilter('all');
                setCategoryFilter('all');
                setWordTypeFilter('all');
              }}
              className="h-10 text-muted-foreground hover:text-foreground"
            >
              Limpiar filtros
            </Button>
          )}

          {/* Results count */}
          <div className="flex items-center ml-auto text-sm text-muted-foreground">
            {displayedPhrases.length} de {phrases.length} frases
          </div>
        </div>

        {/* Phrases List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : displayedPhrases.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery || filter !== 'all' 
                ? 'No se encontraron frases' 
                : 'No tienes frases guardadas'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || filter !== 'all'
                ? 'Intenta con otros filtros o términos de búsqueda'
                : 'Comienza agregando frases desde la extensión o manualmente'}
            </p>
            {!searchQuery && filter === 'all' && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Agregar tu primera frase
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedPhrases.map((phrase) => (
              <PhraseCard
                key={phrase.id}
                phrase={phrase}
                onSpeak={(text) => handleSpeak(text, phrase.id)}
                isSpeaking={speakingPhraseId === phrase.id && isSpeaking}
                onToggleFavorite={handleToggleFavorite}
                onToggleLearned={handleToggleLearned}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}

        {/* Speech not supported warning */}
        {!isSupported && (
          <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 p-4 rounded-xl shadow-lg">
            <p className="text-sm">
              Tu navegador no soporta la síntesis de voz. Intenta con Chrome o Edge para escuchar la pronunciación.
            </p>
          </div>
        )}
      </main>

      {/* Add Phrase Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar nueva frase</DialogTitle>
            <DialogDescription>
              Agrega una frase en inglés con su traducción para practicar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phrase">Frase en inglés *</Label>
              <Input
                id="phrase"
                placeholder="e.g., Break a leg"
                value={newPhrase.phrase}
                onChange={(e) => setNewPhrase(prev => ({ ...prev, phrase: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="translation">Traducción *</Label>
              <Input
                id="translation"
                placeholder="e.g., Buena suerte"
                value={newPhrase.translation}
                onChange={(e) => setNewPhrase(prev => ({ ...prev, translation: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="context">Contexto (opcional)</Label>
              <Textarea
                id="context"
                placeholder="¿En qué situación se usa esta frase?"
                value={newPhrase.context}
                onChange={(e) => setNewPhrase(prev => ({ ...prev, context: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría (opcional)</Label>
              <Select
                value={newPhrase.category}
                onValueChange={(v) => setNewPhrase(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Idioms">Idioms</SelectItem>
                  <SelectItem value="Proverbs">Proverbs</SelectItem>
                  <SelectItem value="Expressions">Expressions</SelectItem>
                  <SelectItem value="Slang">Slang</SelectItem>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddPhrase}
              disabled={!newPhrase.phrase.trim() || !newPhrase.translation.trim()}
            >
              Agregar frase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar frase?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La frase será eliminada permanentemente de tu lista.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedPhrases;
