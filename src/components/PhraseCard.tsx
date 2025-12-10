// PhraseCard component for displaying saved phrases (HU06 & HU07)

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Volume2, 
  VolumeX,
  Heart, 
  Check, 
  Trash2, 
  MoreVertical,
  ExternalLink,
  Edit2,
  Layers,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SavedPhrase } from '@/types/phrases';

interface PhraseCardProps {
  phrase: SavedPhrase;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
  onToggleFavorite: (id: string) => void;
  onToggleLearned: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (phrase: SavedPhrase) => void;
  onCreateFlashcard?: (phraseId: string) => Promise<void>;
  hasFlashcard?: boolean;
}

const PhraseCard = ({
  phrase,
  onSpeak,
  isSpeaking,
  onToggleFavorite,
  onToggleLearned,
  onDelete,
  onEdit,
  onCreateFlashcard,
  hasFlashcard = false,
}: PhraseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreatingFlashcard, setIsCreatingFlashcard] = useState(false);

  const handleSpeak = () => {
    onSpeak(phrase.phrase);
  };

  const handleCreateFlashcard = async () => {
    if (!onCreateFlashcard || isCreatingFlashcard || hasFlashcard) return;
    setIsCreatingFlashcard(true);
    try {
      await onCreateFlashcard(phrase.id);
    } finally {
      setIsCreatingFlashcard(false);
    }
  };

  return (
    <div 
      className={`bg-card text-card-foreground rounded-2xl p-4 transition-all duration-200 hover:shadow-lg ${
        phrase.isLearned ? 'border-l-4 border-l-green-500' : ''
      }`}
    >
      {/* Main Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Phrase Info */}
        <div 
          className="flex-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">
              {phrase.phrase}
            </h3>
            {phrase.isFavorite && (
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {phrase.translation}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Create Flashcard Button - Only show if not already a flashcard */}
          {onCreateFlashcard && !hasFlashcard && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-10 w-10 rounded-full transition-colors ${
                isCreatingFlashcard ? 'bg-purple-500/20 text-purple-500' : 'hover:bg-purple-500/10 text-purple-500'
              }`}
              onClick={handleCreateFlashcard}
              disabled={isCreatingFlashcard}
              title="Crear Flashcard"
            >
              {isCreatingFlashcard ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Layers className="h-5 w-5" />
              )}
            </Button>
          )}
          
          {/* Flashcard indicator - Show if already has flashcard */}
          {hasFlashcard && (
            <div 
              className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center"
              title="Ya tiene Flashcard"
            >
              <Layers className="h-5 w-5 text-green-500" />
            </div>
          )}

          {/* Speak Button (HU07) */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 rounded-full transition-colors ${
              isSpeaking ? 'bg-primary/20 text-primary' : 'hover:bg-primary/10'
            }`}
            onClick={handleSpeak}
            title="Escuchar pronunciación"
          >
            {isSpeaking ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>

          {/* Learned Toggle */}
          <Button
            variant={phrase.isLearned ? 'success' : 'secondary'}
            size="icon"
            className="h-10 w-10 rounded-lg"
            onClick={() => onToggleLearned(phrase.id)}
            title={phrase.isLearned ? 'Marcar como no aprendida' : 'Marcar como aprendida'}
          >
            {phrase.isLearned && <Check className="h-5 w-5" />}
          </Button>

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onToggleFavorite(phrase.id)}>
                <Heart className={`mr-2 h-4 w-4 ${phrase.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                {phrase.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(phrase)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {phrase.sourceUrl && (
                <DropdownMenuItem asChild>
                  <a href={phrase.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver fuente
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(phrase.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-3 animate-in slide-in-from-top-2 duration-200">
          {phrase.context && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Contexto
              </span>
              <p className="text-sm text-foreground mt-1">{phrase.context}</p>
            </div>
          )}
          
          {phrase.category && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Categoría:
              </span>
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                {phrase.category}
              </span>
            </div>
          )}

          {phrase.notes && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Notas
              </span>
              <p className="text-sm text-foreground mt-1">{phrase.notes}</p>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              Guardada: {new Date(phrase.createdAt).toLocaleDateString('es-ES')}
            </span>
            {phrase.lastReviewedAt && (
              <span>
                Última revisión: {new Date(phrase.lastReviewedAt).toLocaleDateString('es-ES')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhraseCard;
