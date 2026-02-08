import React from "react";

type Player = {
  id: string;
  username?: string;
  current_streak?: number;
};

type LeaderboardTableProps = {
  players: Player[];
};

export default function LeaderboardTable({ players }: LeaderboardTableProps) {
  if (!players || players.length === 0) {
    return <div className="text-center text-gray-500 py-4">No players to display.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <tr>
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Player</th>
            <th className="p-3 text-left">Streak</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr
              key={player.id || index}
              className={`border-b hover:bg-gray-100 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <td className="p-3 font-medium">{index + 1}</td>
              <td className="p-3 flex items-center gap-3">
                <span className="text-gray-800 font-semibold">
                  {player.username || "Unknown Player"}
                </span>
              </td>
              <td className="p-3 font-mono text-gray-700">
                {typeof player.current_streak === "number"
                  ? player.current_streak.toLocaleString()
                  : "0"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
