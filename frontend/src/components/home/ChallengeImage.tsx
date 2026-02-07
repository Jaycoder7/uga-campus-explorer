import { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Lightbulb, MapPin, Image, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { Scene3D } from './Scene3D';

interface ChallengeImageProps {
  onGuess: () => void;
}

export function ChallengeImage({ onGuess }: ChallengeImageProps) {
  const { todayChallenge } = useGame();
  const [zoom, setZoom] = useState(1.5);
  const [showHint, setShowHint] = useState(false);
  const [hintAvailable, setHintAvailable] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        if (newTime >= 30) {
          setHintAvailable(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 1));
  };

  if (!todayChallenge) return null;

  return (
    <div className="animate-scale-in space-y-4">
      {/* Image Container */}
      <div className={`relative overflow-hidden bg-muted shadow-card ${viewMode === '3d' ? '' : 'rounded-2xl'}`}>
        <div className="aspect-video overflow-hidden">
          {viewMode === '3d' ? (
            <div className="h-full w-full m-0 p-0">
              <Scene3D 
                locationId={todayChallenge?.location} 
                zoom={zoom}
              />
            </div>
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-muted to-secondary/20 transition-transform duration-300"
              style={{ transform: `scale(${zoom})` }}
            >
              {/* Placeholder for actual image */}
              <div className="flex flex-col items-center gap-4 text-center">
                <MapPin className="h-16 w-16 text-primary/50" />
                <p className="text-sm text-muted-foreground">
                  Mystery Location Photo
                </p>
                <p className="text-xs text-muted-foreground/70">
                  (Image would display here)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant={viewMode === '3d' ? 'default' : 'secondary'}
            size="icon"
            onClick={() => setViewMode('3d')}
            className="h-10 w-10 rounded-full bg-card/90 shadow-lg backdrop-blur-sm"
          >
            <Box className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === '2d' ? 'default' : 'secondary'}
            size="icon"
            onClick={() => setViewMode('2d')}
            className="h-10 w-10 rounded-full bg-card/90 shadow-lg backdrop-blur-sm"
          >
            <Image className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="h-10 w-10 rounded-full bg-card/90 shadow-lg backdrop-blur-sm"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="h-10 w-10 rounded-full bg-card/90 shadow-lg backdrop-blur-sm"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hint Section */}
      {showHint && (
        <div className="animate-slide-up rounded-xl bg-warning/10 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-warning">
            <Lightbulb className="h-5 w-5" />
            <span className="font-medium">Hint</span>
          </div>
          <p className="mt-2 text-sm text-foreground">{todayChallenge.hint}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={onGuess}
          className="flex-1 bg-success text-success-foreground hover:bg-success/90"
          size="lg"
        >
          <MapPin className="mr-2 h-5 w-5" />
          I know this place!
        </Button>
        
        {hintAvailable && !showHint ? (
          <Button
            variant="outline"
            onClick={() => setShowHint(true)}
            className="flex-1"
            size="lg"
          >
            <Lightbulb className="mr-2 h-5 w-5 text-warning" />
            Give me a hint
          </Button>
        ) : !hintAvailable ? (
          <Button
            variant="outline"
            disabled
            className="flex-1"
            size="lg"
          >
            <Lightbulb className="mr-2 h-5 w-5" />
            Hint in {30 - timeElapsed}s
          </Button>
        ) : null}
      </div>
    </div>
  );
}
