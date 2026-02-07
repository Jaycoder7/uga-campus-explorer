import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ALL_LOCATION_NAMES } from '@/data/locations';
import MapPicker from '@/components/ui/MapPicker';
import { useGame } from '@/context/GameContext';

type Coords = { lng: number; lat: number }

function haversine(a: Coords, b: Coords) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371e3;
  const phi1 = toRad(a.lat);
  const phi2 = toRad(b.lat);
  const dPhi = toRad(b.lat - a.lat);
  const dLambda = toRad(b.lng - a.lng);
  const aa = Math.sin(dPhi / 2) * Math.sin(dPhi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
}

interface GuessModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (guess: string) => void;
}

export function GuessModal({ open, onClose, onSubmit }: GuessModalProps) {
  const [guess, setGuess] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { todayChallenge, setLastMapDistance } = useGame();

  const suggestions = useMemo(() => {
    if (guess.length < 2) return [];
    const lower = guess.toLowerCase();
    return ALL_LOCATION_NAMES.filter(name =>
      name.toLowerCase().includes(lower)
    ).slice(0, 6);
  }, [guess]);

  const handleSubmit = () => {
    if (guess.trim()) {
      onSubmit(guess.trim());
      setGuess('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setGuess(suggestion);
    setShowSuggestions(false);
  };

  const handleClose = () => {
    setGuess('');
    setShowSuggestions(false);
    onClose();
  };

  return (
    <>
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Where is this location?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Type a building or landmark name..."
              value={guess}
              onChange={(e) => {
                setGuess(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10"
              autoFocus
            />
            {guess && (
              <button
                onClick={() => setGuess('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-card">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left text-sm transition-colors hover:bg-accent first:rounded-t-lg last:rounded-b-lg"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowMap(true)}
              className="flex-1"
            >
              Select on Map
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!guess.trim()}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Submit Guess
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <MapPicker
      isOpen={showMap}
      initial={undefined}
      onClose={() => setShowMap(false)}
      onSelect={(c) => {
        if (!todayChallenge) {
          setShowMap(false);
          return;
        }
        const dist = haversine({ lng: c.lng, lat: c.lat }, { lng: todayChallenge.coordinates.lng, lat: todayChallenge.coordinates.lat });
        const radiusMeters = 152.4; // 500 ft
        if (dist <= radiusMeters) {
          setShowMap(false);
          onSubmit(todayChallenge.locationName);
        } else {
          // record lastMapDistance in context and submit a wrong guess to move to result screen
          setShowMap(false);
          if (setLastMapDistance) setLastMapDistance(dist);
          onSubmit('');
        }
      }}
    />
    </>
  );
}
