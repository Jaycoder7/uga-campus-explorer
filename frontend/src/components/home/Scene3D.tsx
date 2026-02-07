import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Text,
  useGLTF
} from '@react-three/drei';
import * as THREE from 'three';
import { UGA_LOCATIONS, MOCK_CHALLENGES } from '@/data/locations';

interface Scene3DProps {
  locationId?: string;
  zoom?: number;
}

// Building types based on location categories
function AcademicBuilding({ position, scale, name }: { position: [number, number, number], scale: [number, number, number], name: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} scale={scale} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <Text
        position={[0, scale[1] + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
}

function HistoricBuilding({ position, scale, name }: { position: [number, number, number], scale: [number, number, number], name: string }) {
  return (
    <group position={position}>
      <mesh scale={scale} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      {/* Add some classical elements */}
      <mesh position={[0, scale[1] * 0.3, scale[2] * 0.51]} scale={[scale[0] * 0.8, 0.2, 0.1]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#b91c1c" />
      </mesh>
      <Text
        position={[0, scale[1] + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
}

function AthleticBuilding({ position, scale, name }: { position: [number, number, number], scale: [number, number, number], name: string }) {
  return (
    <group position={position}>
      <mesh scale={scale} castShadow receiveShadow>
        <cylinderGeometry args={[scale[0], scale[0], scale[1], 8]} />
        <meshStandardMaterial color="#059669" />
      </mesh>
      <Text
        position={[0, scale[1] + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
}

function ResidenceHall({ position, scale, name }: { position: [number, number, number], scale: [number, number, number], name: string }) {
  return (
    <group position={position}>
      <mesh scale={scale} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#7c3aed" />
      </mesh>
      {/* Add some windows */}
      {Array.from({ length: Math.floor(scale[1]) }, (_, i) => (
        <group key={i}>
          <mesh position={[scale[0] * 0.4, (i - scale[1]/2) + 0.5, scale[2] * 0.51]} scale={[0.1, 0.15, 0.01]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[-scale[0] * 0.4, (i - scale[1]/2) + 0.5, scale[2] * 0.51]} scale={[0.1, 0.15, 0.01]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
      <Text
        position={[0, scale[1] + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
}

function DiningBuilding({ position, scale, name }: { position: [number, number, number], scale: [number, number, number], name: string }) {
  return (
    <group position={position}>
      <mesh scale={scale} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
      {/* Add a roof */}
      <mesh position={[0, scale[1] * 0.6, 0]} rotation={[0, Math.PI / 4, 0]} scale={[scale[0] * 0.8, 0.1, scale[2] * 0.8]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <Text
        position={[0, scale[1] + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
}

// Special buildings
function TheArch({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Arch structure */}
      <mesh position={[-1, 0, 0]} scale={[0.3, 3, 0.3]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[1, 0, 0]} scale={[0.3, 3, 0.3]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[0, 1.2, 0]} scale={[2.5, 0.3, 0.3]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        The Arch
      </Text>
    </group>
  );
}

// GLB Model Component
function GLBModel({ url, position, scale = 1, rotation, autoRotate = false }: { 
  url: string; 
  position: [number, number, number]; 
  scale?: number | [number, number, number];
  rotation?: [number, number, number];
  autoRotate?: boolean;
}) {
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += 0.005; // Slow rotation
    }
  });
  
  return (
    <primitive 
      ref={meshRef}
      object={scene.clone()} 
      position={position} 
      scale={scale}
      rotation={rotation}
      castShadow
      receiveShadow
    />
  );
}

// Campus Ground
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#4ade80" />
    </mesh>
  );
}

// Sample Campus Scene
function CampusScene({ currentChallenge }: { currentChallenge?: any }) {
  const renderBuilding = (name: string, category: string, position: [number, number, number], scale: [number, number, number]) => {
    const isCurrentLocation = currentChallenge && (
      name === currentChallenge.locationName || 
      name.toLowerCase().includes(currentChallenge.locationName?.toLowerCase())
    );
    
    // Highlight the current challenge location
    const finalScale: [number, number, number] = isCurrentLocation 
      ? [scale[0] * 1.2, scale[1] * 1.2, scale[2] * 1.2] 
      : scale;
    
    switch (category) {
      case 'academic':
        return <AcademicBuilding key={name} position={position} scale={finalScale} name={isCurrentLocation ? name : ''} />;
      case 'historic':
        if (name === 'The Arch') {
          return <TheArch key={name} position={position} />;
        }
        return <HistoricBuilding key={name} position={position} scale={finalScale} name={isCurrentLocation ? name : ''} />;
      case 'athletic':
        return <AthleticBuilding key={name} position={position} scale={finalScale} name={isCurrentLocation ? name : ''} />;
      case 'residence':
        return <ResidenceHall key={name} position={position} scale={finalScale} name={isCurrentLocation ? name : ''} />;
      case 'dining':
        return <DiningBuilding key={name} position={position} scale={finalScale} name={isCurrentLocation ? name : ''} />;
      default:
        return <AcademicBuilding key={name} position={position} scale={finalScale} name={isCurrentLocation ? name : ''} />;
    }
  };

  return (
    <>
      {/* Only show your GLB model */}
      <Suspense fallback={null}>
        <GLBModel 
          url="/models/Dorm.glb" 
          position={[0, 0, 0]} 
          scale={1}
          rotation={[0, 0, 0]}
        />
      </Suspense>
    </>
  );
}

// Helper components
function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 2]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.8]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}

function Path({ points }: { points: [number, number, number][] }) {
  return (
    <group>
      {points.slice(0, -1).map((point, i) => {
        const nextPoint = points[i + 1];
        const midpoint: [number, number, number] = [
          (point[0] + nextPoint[0]) / 2,
          point[1],
          (point[2] + nextPoint[2]) / 2
        ];
        const length = Math.sqrt(
          Math.pow(nextPoint[0] - point[0], 2) + 
          Math.pow(nextPoint[2] - point[2], 2)
        );
        
        return (
          <mesh key={i} position={midpoint} rotation={[0, Math.atan2(nextPoint[2] - point[2], nextPoint[0] - point[0]), 0]}>
            <boxGeometry args={[length, 0.05, 0.5]} />
            <meshStandardMaterial color="#6b7280" />
          </mesh>
        );
      })}
    </group>
  );
}

// Loading component
function Loader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

export function Scene3D({ locationId, zoom = 1 }: Scene3DProps) {
  // Find current challenge from mock data
  const currentChallenge = MOCK_CHALLENGES.find(challenge => 
    challenge.date === new Date().toISOString().split('T')[0]
  );

  return (
    <div className="h-full w-full">
      <Canvas
        shadows
        camera={{ 
          position: [8 * zoom, 6 * zoom, 8 * zoom], 
          fov: 50 
        }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          
          {/* Environment */}
          <Environment preset="city" />
          
          {/* Scene Content */}
          <CampusScene currentChallenge={currentChallenge} />
          
          {/* Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={20}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}