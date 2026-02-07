import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/context/GameContext";
import { Navigation } from "@/components/layout/Navigation";
import Index from "./pages/Index";
import Stats from "./pages/Stats";
import Explore from "./pages/Explore";
import Leaderboard from "./pages/Leaderboard";
import HowToPlay from "./pages/HowToPlay";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GameProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/how-to-play" element={<HowToPlay />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
