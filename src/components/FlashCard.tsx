import { Button } from "@/components/ui/button";
import { Check, MoreHorizontal } from "lucide-react";

interface FlashCardProps {
  word: string;
  isLearned: boolean;
  onToggleLearned: () => void;
  onLearn: () => void;
}

const FlashCard = ({ word, isLearned, onToggleLearned, onLearn }: FlashCardProps) => {
  return (
    <div className="bg-card text-card-foreground rounded-2xl p-4 flex items-center justify-between gap-4 hover:scale-[1.02] transition-transform">
      <span className="text-lg font-medium">{word}</span>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
        <Button
          variant={isLearned ? "success" : "secondary"}
          size="icon"
          className="h-10 w-10 rounded-lg"
          onClick={onToggleLearned}
        >
          {isLearned && <Check className="h-5 w-5" />}
        </Button>
        <Button
          variant="primary"
          className="rounded-lg px-6"
          onClick={onLearn}
        >
          Learn
        </Button>
      </div>
    </div>
  );
};

export default FlashCard;
