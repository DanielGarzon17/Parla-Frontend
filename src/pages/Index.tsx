import UserProfile from "@/components/UserProfile";
import PracticeModeMenu from "@/components/PracticeModeMenu";
import CardList from "@/components/CardList";
import StatsPanel from "@/components/StatsPanel";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Index = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testPhrasesEndpoint = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/phrases/phrases/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({ success: true, data });
        console.log('API Test Success:', data);
      } else {
        const error = await response.json();
        setTestResult({ success: false, error });
        console.error('API Test Failed:', error);
      }
    } catch (error) {
      setTestResult({ success: false, error: String(error) });
      console.error('API Test Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-foreground mb-8">
          Saved Cards
        </h1>
        
        {/* Test Button */}
        <div className="mb-6 flex justify-center gap-4 items-center">
          <Button 
            onClick={testPhrasesEndpoint}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? "Testing..." : "Test Phrases API"}
          </Button>
          {testResult && (
            <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p className="font-semibold">{testResult.success ? '✓ Success' : '✗ Failed'}</p>
              <pre className="text-xs mt-2 max-w-md overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
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
