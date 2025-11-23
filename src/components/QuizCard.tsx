import { ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface QuizCardProps {
  text: string;
  onPlay?: () => void;
}

const QuizCard = ({ text, onPlay }: QuizCardProps) => {
  return (
    <div className="flex items-center justify-between bg-quiz-card hover:bg-quiz-card-hover transition-colors rounded-2xl px-6 py-4 shadow-md">
      <span className="text-lg font-medium text-card-foreground">{text}</span>
      <Button
        variant="ghost"
        size="icon"
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-10 w-10 flex-shrink-0"
        onClick={onPlay}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default QuizCard;
