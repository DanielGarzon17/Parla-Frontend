import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TimerCircle from "@/components/TimerCircle";
import QuizCard from "@/components/QuizCard";
import AvatarBubble from "@/components/AvatarBubble";
import cap4 from "@/assets/cap4.png";
import { useToast } from "@/hooks/use-toast";

const TimeTrialPage = () => {
  const [answer, setAnswer] = useState("");
  const { toast } = useToast();

  const handleConfirm = () => {
    if (answer.trim()) {
      toast({
        title: "Answer submitted!",
        description: "Great job! Keep learning.",
      });
      setAnswer("");
    } else {
      toast({
        title: "Empty answer",
        description: "Please type your answer first.",
        variant: "destructive",
      });
    }
  };

  const handleSkip = () => {
    toast({
      title: "Question skipped",
      description: "Moving to the next question.",
    });
    setAnswer("");
  };

  const handleTimeComplete = () => {
    toast({
      title: "Time's up!",
      description: "Don't worry, you can try again.",
    });
  };

  const handlePlayCard = () => {
    toast({
      title: "Playing audio",
      description: "Listen carefully!",
    });
  };

  return (
    <div className="timetrial-theme">
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-12"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Time trial
            </h1>

            <div className="w-12" />
          </header>

          {/* Main Content */}
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
            {/* Left Side */}
            <div className="space-y-6">
              {/* Avatar and Timer Row */}
              <div className="flex items-center justify-between">
                <AvatarBubble />
                <TimerCircle initialSeconds={30} onComplete={handleTimeComplete} />
              </div>

              {/* Instruction */}
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                  Translate the card below
                </h2>
              </div>

              {/* Quiz Cards */}
              <div className="space-y-4">
                <QuizCard text="Card X" onPlay={handlePlayCard} />
                <QuizCard text="Pronunciation X" onPlay={handlePlayCard} />
              </div>

              {/* Answer Input */}
              <div className="relative">
                <Textarea
                  placeholder="Type Your Answer Here"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-[200px] text-lg bg-input border-2 border-border rounded-3xl px-6 py-4 resize-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleConfirm}
                  className="w-full h-14 text-lg font-semibold bg-button-primary hover:bg-button-primary/90 text-primary-foreground rounded-2xl shadow-md"
                >
                  <span className="mr-2">◼</span>
                  Confirm Answer
                </Button>
                <Button
                  onClick={handleSkip}
                  variant="secondary"
                  className="w-full h-14 text-lg font-semibold bg-button-secondary hover:bg-button-secondary/90 text-secondary-foreground rounded-2xl shadow-md"
                >
                  Skip
                </Button>
              </div>
            </div>

            {/* Right Side - Mascot */}
            <div className="hidden md:flex items-center justify-center">
              <img
                src={cap4}
                alt="cap4 mascot in yellow jersey"
                className="w-64 h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTrialPage;
