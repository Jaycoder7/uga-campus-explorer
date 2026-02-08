import { useState, useEffect } from 'react';
import { Check, X, Flame, MapPin, Navigation, ExternalLink, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { UGA_LOCATIONS } from '@/data/locations';

type Coords = { lng: number; lat: number }

function haversine(a: Coords, b: Coords) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000; // Earth's radius in meters (more precise)
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  
  const aa = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c; // distance in meters
}

interface ResultScreenProps {
  correct: boolean;
  pointsEarned: number;
  error?: string;
}

export function ResultScreen({ correct, pointsEarned, error }: ResultScreenProps) {
  const { gameState, todayChallenge, lastMapDistance } = useGame();
  const [showDirections, setShowDirections] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [userDistance, setUserDistance] = useState<number | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);


  const handleExplore = () => {
    setLoadingLocation(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = {
            lng: position.coords.longitude,
            lat: position.coords.latitude
          }
          
          // Find the correct location from locations.ts
          const correctLocation = UGA_LOCATIONS.find(loc => loc.id === todayChallenge?.location);
          if (!correctLocation) {
            alert('Location data not found');
            setLoadingLocation(false);
            return;
          }
          
          const targetCoords = {
            lng: correctLocation.coordinates.lng,
            lat: correctLocation.coordinates.lat
          }
          const distance = haversine(userCoords, targetCoords)
          setUserDistance(distance)
          setShowExplore(true)
          setLoadingLocation(false)
        },
        (error) => {
          console.error('Geolocation error:', error)
          alert('Unable to get your location. Please enable location services and try again.')
          setLoadingLocation(false)
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
      setLoadingLocation(false)
    }
  }

  if (!todayChallenge) return null;

  return (
    <div className="animate-scale-in space-y-6">
      {/* Result Header */}
      <div className="rounded-2xl bg-card p-6 text-center shadow-card">
        {error ? (
          <>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
              <X className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Oops! 😕</h2>
            <p className="mt-2 text-destructive">{error}</p>
          </>
        ) : correct ? (
          <>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
              <Check className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Correct! 🎉</h2>
            <p className="mt-2 text-lg text-success">+{pointsEarned} points</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-warning">
              <Flame className="h-5 w-5" />
              <span className="font-medium">{gameState.currentStreak} day streak!</span>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
              <X className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Not quite right 😕</h2>
            <p className="mt-2 text-muted-foreground">
              Streak reset. Start a new one tomorrow!
            </p>
          </>
        )}
      </div>

      {/* Location Reveal */}
      {!error && <div className="rounded-2xl bg-card p-6 shadow-card">
        <div className="flex items-center gap-2 text-primary">
          <MapPin className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider">
            The Answer
          </span>
        </div>
        <h3 className="mt-2 text-xl font-bold text-foreground">
          {todayChallenge.locationName}
        </h3>
        {todayChallenge.buildingCode && (
          <span className="mt-1 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {todayChallenge.buildingCode}
          </span>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          {todayChallenge.funFact}
        </p>
        {!correct && lastMapDistance != null && (
          <p className="mt-2 text-sm text-destructive">
            You were {(() => {
              const distFt = lastMapDistance / 0.3048;
              if (distFt > 600) {
                return `${(distFt / 5280).toFixed(2)} miles`;
              }
              return `${distFt.toFixed(0)} ft`;
            })()} away from the correct location.
          </p>
        )}
        
        {/* View Location on Map Button */}
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowLocationMap(true)}
          >
            <MapPin className="mr-2 h-4 w-4" />
            View Location on Map
          </Button>
        </div>
      </div>}

      {/* Directions (for incorrect answers) */}
      {!error && !correct && (
        <div className="rounded-2xl bg-card shadow-card">
          <button
            onClick={() => setShowDirections(!showDirections)}
            className="flex w-full items-center justify-between p-6 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <Navigation className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Get Directions</p>
                <p className="text-sm text-muted-foreground">
                  ~8 minute walk • 0.4 miles
                </p>
              </div>
            </div>
            <span className="text-2xl text-muted-foreground">
              {showDirections ? '−' : '+'}
            </span>
          </button>

          {showDirections && (
            <div className="border-t border-border px-6 pb-6">
              <div className="space-y-3 py-4">
                {todayChallenge.directions.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <p className="text-sm text-foreground">{step}</p>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => {
                  // Placeholder - would open native maps
                  alert('This would open your maps app with directions!');
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Maps
              </Button>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                🎓 Visit this spot to learn more about UGA's history!
              </p>
            </div>
          )}
          <div className="px-6 pb-6">
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={handleExplore}
              disabled={loadingLocation}
            >
              <Navigation className="mr-2 h-4 w-4" />
              {loadingLocation ? 'Getting your location...' : 'Explore'}
            </Button>
          </div>
        </div>
      )}


      {/* Share Button */}
      {!error && <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          // Placeholder share functionality
          alert('Share feature coming soon!');
        }}
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share Result
      </Button>}

      {/* Explore Modal */}
      {showExplore && userDistance !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-2xl bg-card p-6 shadow-lg max-w-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Navigation className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Distance to {todayChallenge.locationName}</h3>
            <p className="mt-3 text-3xl font-bold text-primary">
              {(userDistance / 1609.34).toFixed(2)} miles
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              from your current location
            </p>
            <Button
              variant="outline"
              className="mt-6 w-full"
              onClick={() => {
                const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=33.95765026696892,-83.37532867077132'
                window.open(mapsUrl, '_blank')
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Google Maps
            </Button>
            <Button
              className="mt-3 w-full"
              onClick={() => {
                setShowExplore(false)
                setUserDistance(null)
              }}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
