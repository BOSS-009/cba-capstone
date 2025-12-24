import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function FloatingParticles({ count = 50 }) {
  const mesh = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Alternate between cyan and purple
      const isCyan = Math.random() > 0.5;
      colors[i * 3] = isCyan ? 0 : 0.74;
      colors[i * 3 + 1] = isCyan ? 0.95 : 0.08;
      colors[i * 3 + 2] = isCyan ? 1 : 1;
    }

    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.getElapsedTime() * 0.05;
      mesh.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function GlowingSphere({ position, color }: { position: [number, number, number]; color: string }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() + position[0]) * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={mesh} args={[0.3, 32, 32]} position={position}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </Sphere>
    </Float>
  );
}

export function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#00f3ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#bc13fe" />
        
        <FloatingParticles count={100} />
        
        <GlowingSphere position={[-3, 1, -2]} color="#00f3ff" />
        <GlowingSphere position={[3, -1, -3]} color="#bc13fe" />
        <GlowingSphere position={[0, 2, -4]} color="#00f3ff" />
        <GlowingSphere position={[-2, -2, -2]} color="#bc13fe" />
        <GlowingSphere position={[2, 1.5, -1]} color="#00f3ff" />
      </Canvas>
    </div>
  );
}

export function SubtleBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.1} />
        <FloatingParticles count={30} />
      </Canvas>
    </div>
  );
}
