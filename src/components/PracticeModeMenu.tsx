import { Button } from "@/components/ui/button";

const PracticeModeMenu = () => {
  const modes = [
    { name: "FlashCards", id: "flashcards" },
    { name: "Time trial", id: "timetrial" },
    { name: "Match cards", id: "match" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground mb-4">Practice Mode</h2>
      {modes.map((mode) => (
        <Button
          key={mode.id}
          variant="primary"
          className="w-full"
          onClick={() => console.log(`Selected ${mode.name}`)}
        >
          {mode.name}
        </Button>
      ))}
    </div>
  );
};

export default PracticeModeMenu;
