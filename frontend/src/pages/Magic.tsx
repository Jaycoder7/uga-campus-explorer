import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Map as MapIcon, Sparkles, Star } from "lucide-react";

export default function Magic() {
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuest = async () => {
    setLoading(true);
    setError("");
    setStory("");

    try {
      const response = await fetch("http://localhost:3001/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "name": "Ricky",
          "location": "North Campus Fountain",
          "length": 200
        }
        ),
      });

      if (!response.ok) {
        throw new Error("Failed to generate story");
      }

      const data = await response.json();
      console.log("Story generated:", data);

      // Update frontend state to show the story
      setStory(data.story);
    } catch (err) {
      console.error("Error generating story:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Today's Magical Adventure">
      <div className="flex flex-col items-center gap-8">
        {/* Magical Icon */}
        <div className="relative mx-auto">
          <div className="absolute -top-4 -left-4 animate-pulse">
            <Sparkles className="h-6 w-6 text-primary/70" />
          </div>
          <div className="absolute -top-4 -right-4 animate-bounce">
            <Star className="h-5 w-5 text-yellow-400/80" />
          </div>
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-purple-400/30 to-indigo-500/30 shadow-lg">
            <MapIcon className="h-12 w-12 text-primary" />
          </div>
        </div>

        {/* Story Card */}
        <div className="max-w-xl rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-800/60 p-8 text-center shadow-2xl border border-slate-700">
          <h2 className="text-2xl font-bold text-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Today's Magical Story
          </h2>

          {/* Story content */}
          {loading && (
            <p className="text-slate-300">Casting magic... generating your adventure ✨</p>
          )}
          {error && <p className="text-red-400">{error}</p>}
          {story && (
            <p className="text-lg text-slate-200 whitespace-pre-line mt-2">{story}</p>
          )}

          {!story && !loading && !error && (
            <p className="text-lg text-slate-200 mb-4">
              A mysterious challenge awaits you on the UGA campus! Your mission: explore the landmark, uncover secrets, and become the hero of your adventure.
            </p>
          )}

          {/* Action Button */}
          <button
            onClick={handleQuest}
            disabled={loading}
            className="mt-4 rounded-full bg-primary px-6 py-3 text-white font-semibold shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Preparing your Quest..." : "Begin Your Quest"}
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
