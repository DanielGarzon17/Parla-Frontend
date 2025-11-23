import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchCardProps {
  id: string;
  text: string;
  type: "question" | "answer";
  isSelected: boolean;
  isMatched: boolean;
  onClick: () => void;
}

export const MatchCard = ({
  text,
  type,
  isSelected,
  isMatched,
  onClick,
}: MatchCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-6 py-4 rounded-2xl font-medium text-left flex items-center justify-between transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        type === "question" && !isSelected && "bg-card-left text-card-left-foreground",
        type === "question" && isSelected && "bg-card-left-selected text-primary-foreground",
        type === "answer" && !isSelected && "bg-card-right text-card-right-foreground",
        type === "answer" && isSelected && "bg-card-right-selected text-primary-foreground",
        isMatched && "opacity-70"
      )}
    >
      <span>{text}</span>
      <div
        className={cn(
          "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300",
          type === "question" && !isSelected && "border-card-left-foreground/30",
          type === "question" && isSelected && "border-primary-foreground bg-primary-foreground",
          type === "answer" && !isSelected && "border-card-right-foreground/30",
          type === "answer" && isSelected && "border-primary-foreground bg-primary-foreground"
        )}
      >
        {isSelected && (
          <Check
            className={cn(
              "w-4 h-4",
              type === "question" && "text-check-icon",
              type === "answer" && "text-check-icon"
            )}
          />
        )}
      </div>
    </button>
  );
};
