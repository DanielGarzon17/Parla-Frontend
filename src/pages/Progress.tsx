import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

// Mock data for the weekly progress chart
const weeklyData = [
  { name: 'MAY', flashcards: 5, timetrial: 0, matchcards: 0 },
  { name: 'JUN', flashcards: 20, timetrial: 4, matchcards: 0 },
  { name: 'JUL', flashcards: 15, timetrial: 3, matchcards: 0 },
  { name: 'AUG', flashcards: 22, timetrial: 8, matchcards: 0 },
  { name: 'SEP', flashcards: 12, timetrial: 1, matchcards: 0 },
];

const Progress = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors mr-6"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="text-4xl font-bold text-primary">
            Your Progress!
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Section - User Profile */}
          <div className="lg:col-span-3">
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="w-32 h-32 rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-4xl">🐹</span>
                </div>
              </div>
              <div className="bg-accent text-accent-foreground px-8 py-3 rounded-xl font-bold text-lg w-full text-center">
                Pepito Perez
              </div>
            </div>

            {/* Capybara mascot */}
            {/* <div className="flex items-center justify-center mt-8">
              <div className="w-full max-w-sm bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl p-8 flex items-center justify-center">
                <div className="text-8xl">🐹</div>
              </div>
            </div> */}
          </div>

          {/* Center Section - Total Progress */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-6 text-center">
                Total Progress
              </h2>
              
              <div className="space-y-4">
                {/* Day Streak */}
                <div className="bg-stat-bg text-stat-foreground rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-lg font-medium">Day Streak</span>
                  <span className="bg-accent text-accent-foreground px-4 py-1 rounded-lg font-bold">
                    15!
                  </span>
                </div>

                {/* Total cards learned */}
                <div className="bg-stat-bg text-stat-foreground rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-lg font-medium">Total cards learned</span>
                  <span className="bg-success text-success-foreground px-4 py-1 rounded-lg font-bold">
                    154
                  </span>
                </div>

                {/* Achievements */}
                <div className="bg-stat-bg text-stat-foreground rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-lg font-medium">Achievements</span>
                  <span className="bg-white text-foreground px-4 py-1 rounded-lg font-bold">
                    25
                  </span>
                </div>
              </div>
            </div>

            {/* Weekly Progress Chart */}
            <div>
              <h2 className="text-2xl font-bold text-primary mb-6 text-center">
                Weekly progress
              </h2>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#666' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#666' }}
                        domain={[0, 25]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="flashcards" 
                        stroke="#fbbf24" 
                        strokeWidth={3}
                        dot={{ fill: '#fbbf24', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="timetrial" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="matchcards" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Favorite Mode */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-primary mb-6 text-center">
              Your Favorite mode
            </h2>
            
            <div className="space-y-4">
              {/* FlashCards */}
              <div className="bg-primary text-primary-foreground rounded-2xl p-4 flex items-center justify-between">
                <span className="text-lg font-medium">FlashCards</span>
                <span className="text-sm font-bold">
                  35 session clear!
                </span>
              </div>

              {/* Time trial */}
              <div className="bg-primary text-primary-foreground rounded-2xl p-4 flex items-center justify-between">
                <span className="text-lg font-medium">Time trial</span>
                <span className="text-sm font-bold">
                  20 session clear!
                </span>
              </div>

              {/* Match cards */}
              <div className="bg-primary text-primary-foreground rounded-2xl p-4 flex items-center justify-between">
                <span className="text-lg font-medium">Match cards</span>
                <span className="text-sm font-bold">
                  12 session clear!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
