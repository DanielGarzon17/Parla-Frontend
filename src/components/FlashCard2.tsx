import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface FlashCardProps {
  level: string;
  word: string;
  pronunciation: string;
  translation: string;
}

export const FlashCard = ({ level, word, pronunciation, translation }: FlashCardProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedButton, setSelectedButton] = useState<"know" | "learn" | null>(null);

  const handleKnowClick = () => {
    setSelectedButton("know");
  };

  const handleLearnClick = () => {
    setSelectedButton("learn");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-primary rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <p className="text-primary-foreground/80 text-sm font-medium mb-4">{level}</p>
          <h2 className="text-4xl font-bold text-foreground mb-2">{word}</h2>
          <p className="text-muted-foreground text-sm">{pronunciation}</p>
        </div>

        <div
          className="bg-card rounded-2xl p-12 mb-8 min-h-[200px] flex items-center justify-center cursor-pointer transition-all hover:shadow-lg"
          onClick={() => setIsRevealed(!isRevealed)}
        >
          {isRevealed ? (
            <p className="text-3xl font-bold text-foreground">{translation}</p>
          ) : (
            <Eye className="w-12 h-12 text-muted-foreground/40" />
          )}
        </div>

        <div className="flex gap-4">
          <Button
            variant={selectedButton === "know" ? "success" : "flashcard"}
            size="lg"
            className="flex-1 h-14"
            onClick={handleKnowClick}
          >
            I Know
          </Button>
          <Button
            variant={selectedButton === "learn" ? "learn" : "flashcard"}
            size="lg"
            className="flex-1 h-14"
            onClick={handleLearnClick}
          >
            Learn
          </Button>
        </div>
      </div>
    </div>
  );
};
