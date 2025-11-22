import UserProfile from "@/components/UserProfile";
import PracticeModeMenu from "@/components/PracticeModeMenu";
import CardList from "@/components/CardList";
import StatsPanel from "@/components/StatsPanel";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-foreground mb-8">
          Saved Cards
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3 space-y-8">
            <UserProfile />
            <PracticeModeMenu />
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-6">
            <CardList />
          </main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-3">
            <StatsPanel />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Index;
