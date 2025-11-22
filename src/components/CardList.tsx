import { useState } from "react";
import FlashCard from "./FlashCard";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const CardList = () => {
  const [cards, setCards] = useState([
    { id: 1, word: "mother", isLearned: true },
    { id: 2, word: "day", isLearned: false },
    { id: 3, word: "you", isLearned: true },
    { id: 4, word: "get", isLearned: true },
    { id: 5, word: "put", isLearned: false },
    { id: 6, word: "race", isLearned: false },
    { id: 7, word: "start", isLearned: true },
  ]);

  const toggleLearned = (id: number) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, isLearned: !card.isLearned } : card
    ));
  };

  const learnedCount = cards.filter(c => c.isLearned).length;
  const totalCards = cards.length;
  const percentage = Math.round((learnedCount / totalCards) * 100);

  return (
    <div className="flex flex-col gap-4">
      <Button variant="secondary" className="w-full py-6 text-lg rounded-2xl">
        Add a Card
      </Button>
      
      <Button variant="destructive" className="w-full py-6 text-lg rounded-2xl">
        <Trash2 className="mr-2 h-5 w-5" />
        Delete a Card
      </Button>

      <div className="text-center text-muted-foreground text-sm py-2">
        {totalCards - learnedCount} new cards left · {percentage}% complete
      </div>

      <div className="space-y-3">
        {cards.map((card) => (
          <FlashCard
            key={card.id}
            word={card.word}
            isLearned={card.isLearned}
            onToggleLearned={() => toggleLearned(card.id)}
            onLearn={() => console.log(`Learning ${card.word}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default CardList;
