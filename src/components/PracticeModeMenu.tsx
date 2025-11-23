import { useNavigate } from "react-router-dom";

const PracticeModeMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Practice Mode</h2>

      {/* FlashCards */}
      <button
        className="w-full bg-purple-800 hover:bg-purple-900 text-white py-3 rounded-xl transition"
        onClick={() => navigate("/flashcards")}
      >
        FlashCards
      </button>

      {/* Time Trial */}
      <button
        className="w-full bg-purple-800 hover:bg-purple-900 text-white py-3 rounded-xl transition"
        onClick={() => navigate("/timetrial")}
      >
        Time Trial
      </button>

      {/* Match Cards - ESTE ES EL QUE TE INTERESA */}
      <button
        className="w-full bg-purple-800 hover:bg-purple-900 text-white py-3 rounded-xl transition"
        onClick={() => navigate("/match")}
      >
        Match cards
      </button>
    </div>
  );
};

export default PracticeModeMenu;
