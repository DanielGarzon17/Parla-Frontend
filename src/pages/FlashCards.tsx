import { FlashCard } from "@/components/FlashCard2";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import cap2 from "@/assets/cap2.png";

const FlashCardsPage = () => {
  return (
    <div className="flashcards min-h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <Button variant="ghost" size="icon" className="rounded-full"
          onClick={() => window.history.back()}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">FlashCards</h1>
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center shadow-lg">
          <img
            src={logo}
            alt="Capybara mascot"
            className="w-20 h-20 object-contain"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-8">
        <FlashCard
          level="A1 Level"
          word="mother"
          pronunciation="[ˈmʌðə]"
          translation="mama"
        />
      </main>

      {/* Capybara Mascot */}
      <div className="fixed bottom-0 left-0 w-80 h-100 pointer-events-none">
        <img
          src={cap2}
          alt="Capybara mascot"
          className="w-full h-full object-contain -scale-x-100"
        />
      </div>
    </div>
  );
};

export default FlashCardsPage;
