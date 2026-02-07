import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF
} from '@react-three/drei';
import * as THREE from 'three';

interface Scene3DProps {
  locationId?: string;
  zoom?: number;
}

// GLB Model Component
function GLBModel({ url, position, scale = 1, rotation }: { 
  url: string; 
  position: [number, number, number]; 
  scale?: number | [number, number, number];
  rotation?: [number, number, number];
}) {
  const { scene } = useGLTF(url);
  
  return (
    <primitive 
      object={scene.clone()} 
      position={position} 
      scale={scale}
      rotation={rotation}
    />
  );
}

export function Scene3D({ zoom = 1 }: Scene3DProps) {

  return (
    <div style={{ width: '100%', height: '100%', margin: 0, padding: 0, overflow: 'hidden', position: 'relative' }}>
      <Canvas
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%', 
          height: '100%', 
          display: 'block', 
          margin: 0, 
          padding: 0,
          border: 'none',
          outline: 'none'
        }}
        shadows
        camera={{ 
          position: [0, 0, 0.2], // Camera closer inside the model
          fov: 50 
        }}
        gl={{ antialias: true }}
      >
         <Suspense fallback={null}>
          {/* Lighting - Maximum brightness for interior viewing */}
          <ambientLight intensity={3} />
          <directionalLight position={[10, 10, 5]} intensity={3} />
          <directionalLight position={[-10, -10, -5]} intensity={3} />
          <directionalLight position={[5, -10, 10]} intensity={2.5} />
          <directionalLight position={[-5, 10, -10]} intensity={2.5} />
          <pointLight position={[0, 15, 0]} intensity={2} />
          <pointLight position={[15, 0, 0]} intensity={1.5} />
          <pointLight position={[-15, 0, 0]} intensity={1.5} />
          <pointLight position={[0, 0, 15]} intensity={1.5} />
          <pointLight position={[0, 0, -15]} intensity={1.5} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <pointLight position={[-10, -10, -10]} intensity={1.2} />
          <pointLight position={[10, -10, 10]} intensity={1.2} />
          <pointLight position={[-10, 10, -10]} intensity={1.2} />
          {/* Your GLB Model */}
          <Suspense fallback={null}>
            <GLBModel 
              url="/models/TurtlePond.glb" 
              position={[0, -1, 0]} 
              scale={1}
              rotation={[0, 0, 0]}
            />
          </Suspense>
          
          {/* Controls - Center view with limited zoom */}
          <OrbitControls 
            enablePan={false}        // Disable panning (stay at center)
            enableZoom={true}        // Enable zoom in/out
            enableRotate={true}      // Allow 360° rotation
            minDistance={0.1}        // Zoom in close
            maxDistance={0.2}          // Zoom out limit
            target={[0, 0, 0]}       // Always look at center
            autoRotate={false}
            autoRotateSpeed={0}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}