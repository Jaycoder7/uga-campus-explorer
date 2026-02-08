import { useEffect, useState } from "react";
import { PageLayout } from '@/components/layout/PageLayout';
import PointLeaderboardTable from '@/components/ui/leaderboard-table-points';
import StreakLeaderboardTable from '@/components/ui/leaderboard-table-streak';

const fallbackPlayers = [
  { id: "1", name: "Alex", score: 1200 },
  { id: "2", name: "Jordan", score: 950 },
  { id: "3", name: "Taylor", score: 800 },
];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("points");
  const [pointsPlayers, setPointsPlayers] = useState(fallbackPlayers);
  const [streakPlayers, setStreakPlayers] = useState(fallbackPlayers);

  useEffect(() => {
    async function fetchPointsLeaderboard() {
      try {
        const res = await fetch("http://localhost:3001/api/leaderboard/topPoints");
        const data = await res.json();
        setPointsPlayers(data.users || fallbackPlayers);
      } catch (err) {
        console.error("Failed to fetch points leaderboard", err);
      }
    }

    async function fetchStreakLeaderboard() {
      try {
        const res = await fetch("http://localhost:3001/api/leaderboard/topStreak");
        const data = await res.json();
        setStreakPlayers(data.users || fallbackPlayers);
      } catch (err) {
        console.error("Failed to fetch streak leaderboard", err);
      }
    }

    fetchPointsLeaderboard();
    fetchStreakLeaderboard();
  }, []);

  return (
    <PageLayout title="Top Explorers">
      <div className="space-y-4">
        {/* Tab buttons */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("points")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "points"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Top Points
          </button>
          <button
            onClick={() => setActiveTab("streak")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "streak"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Top Streak
          </button>
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "points" && <PointLeaderboardTable players={pointsPlayers} />}
          {activeTab === "streak" && <StreakLeaderboardTable players={streakPlayers} />}
        </div>
      </div>
    </PageLayout>
  );
}