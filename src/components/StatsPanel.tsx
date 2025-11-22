import mascot from "@/assets/capybara-mascot.png";

const StatsPanel = () => {
  return (
    <div className="space-y-4">
      <div className="bg-stat-bg text-stat-foreground rounded-2xl p-4 flex items-center justify-between">
        <span className="text-lg font-medium">Day Streak</span>
        <span className="bg-success text-success-foreground px-4 py-1 rounded-lg font-bold">
          15!
        </span>
      </div>

      <div className="bg-stat-bg text-stat-foreground rounded-2xl p-4 flex items-center justify-between">
        <span className="text-lg font-medium">Total cards learned</span>
        <span className="bg-success text-success-foreground px-4 py-1 rounded-lg font-bold">
          154
        </span>
      </div>

      <div className="bg-stat-bg text-stat-foreground rounded-2xl p-4 flex items-center justify-between">
        <span className="text-lg font-medium">Achievements</span>
        <span className="bg-white text-foreground px-4 py-1 rounded-lg font-bold">
          25
        </span>
      </div>

      <div className="flex items-center justify-center mt-8">
        <img 
          src={mascot} 
          alt="Capybara mascot" 
          className="w-full max-w-sm object-contain"
        />
      </div>
    </div>
  );
};

export default StatsPanel;
