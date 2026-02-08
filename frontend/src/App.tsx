import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/context/GameContext";
import { Navigation } from "@/components/layout/Navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import Index from "./pages/Index";
import Stats from "./pages/Stats";
import Explore from "./pages/Magic";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup"; 
import HowToPlay from "./pages/HowToPlay";
import NotFound from "./pages/NotFound";
import Magic from "./pages/Magic";

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
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/how-to-play" element={<HowToPlay />} />
            <Route path="/magic" element={<Magic />} />

            {/* Protected routes */}
            <Route path="/stats" element={<AuthGuard><Stats /></AuthGuard>} />
            <Route path="/leaderboard" element={<AuthGuard><Leaderboard /></AuthGuard>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
