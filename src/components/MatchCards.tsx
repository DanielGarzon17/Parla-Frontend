import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/MatchCard";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

interface Card {
  id: string;
  text: string;
}

interface MatchPair {
  questionId: string;
  answerId: string;
}

const questions: Card[] = [
  { id: "q1", text: "What is React?" },
  { id: "q2", text: "What is JSX?" },
  { id: "q3", text: "What is a Hook?" },
  { id: "q4", text: "What is a Component?" },
  { id: "q5", text: "What is State?" },
  { id: "q6", text: "What is Props?" },
];

const answers: Card[] = [
  { id: "a1", text: "A JavaScript library for building UIs" },
  { id: "a2", text: "JavaScript XML syntax extension" },
  { id: "a3", text: "Functions that use React features" },
  { id: "a4", text: "Reusable piece of UI" },
  { id: "a5", text: "Data that changes over time" },
  { id: "a6", text: "Data passed to components" },
];

const correctMatches: MatchPair[] = [
  { questionId: "q1", answerId: "a1" },
  { questionId: "q2", answerId: "a2" },
  { questionId: "q3", answerId: "a3" },
  { questionId: "q4", answerId: "a4" },
  { questionId: "q5", answerId: "a5" },
  { questionId: "q6", answerId: "a6" },
];

export const MatchCards = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchPair[]>([]);

  const handleQuestionClick = (id: string) => {
    if (matches.some((m) => m.questionId === id)) return;
    setSelectedQuestion(id === selectedQuestion ? null : id);
  };

  const handleAnswerClick = (id: string) => {
    if (matches.some((m) => m.answerId === id)) return;
    setSelectedAnswer(id === selectedAnswer ? null : id);

    // Check if we have a pair selected
    if (selectedQuestion) {
      const newMatch = { questionId: selectedQuestion, answerId: id };
      const isCorrect = correctMatches.some(
        (m) => m.questionId === selectedQuestion && m.answerId === id
      );

      if (isCorrect) {
        setMatches([...matches, newMatch]);
        toast({
          title: "Correct match!",
          description: "Great job! Keep going.",
        });
      } else {
        toast({
          title: "Not quite right",
          description: "Try a different combination.",
          variant: "destructive",
        });
      }

      setSelectedQuestion(null);
      setSelectedAnswer(null);
    }
  };

  const handleContinue = () => {
    if (matches.length === correctMatches.length) {
      toast({
        title: "All matched!",
        description: "You've completed all the matches successfully!",
      });
    } else {
      toast({
        title: "Not finished yet",
        description: `You have ${correctMatches.length - matches.length} more matches to find.`,
      });
    }
  };

  const handleBack = () => {
    toast({
      title: "Going back",
      description: "Navigation would go here",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Button
          onClick={() => window.history.back()}
          variant="ghost"
          size="icon"
          className="rounded-full bg-back-button text-primary-foreground hover:bg-back-button/90 h-12 w-12"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground absolute left-1/2 transform -translate-x-1/2">
          Match cards
        </h1>
        <div className="w-12" />
      </div>

      {/* Cards Grid */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Questions Column */}
          <div className="space-y-3">
            {questions.map((question) => (
              <MatchCard
                key={question.id}
                id={question.id}
                text={question.text}
                type="question"
                isSelected={selectedQuestion === question.id}
                isMatched={matches.some((m) => m.questionId === question.id)}
                onClick={() => handleQuestionClick(question.id)}
              />
            ))}
          </div>

          {/* Answers Column */}
          <div className="space-y-3">
            {answers.map((answer) => (
              <MatchCard
                key={answer.id}
                id={answer.id}
                text={answer.text}
                type="answer"
                isSelected={selectedAnswer === answer.id}
                isMatched={matches.some((m) => m.answerId === answer.id)}
                onClick={() => handleAnswerClick(answer.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 flex items-center justify-between">
        {/* Mascot */}
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
          <img
            src={logo}
            alt="logo"
            className="w-20 h-20 object-contain"
          />
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          className="bg-continue-button hover:bg-continue-button/90 text-primary-foreground px-16 py-6 text-lg rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Continue
        </Button>

        {/* Spacer for balance */}
        <div className="w-20" />
      </div>
    </div>
  );
};
