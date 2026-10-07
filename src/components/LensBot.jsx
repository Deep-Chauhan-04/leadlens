import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

export function LensBotModel(props) {
  const group = useRef();
  
  // Follow mouse and float
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // make the whole bot float slightly
    group.current.position.y = Math.sin(t * 2) * 0.1;
    
    // rotate head towards mouse slowly
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, (state.pointer.x * Math.PI) / 4, 0.1);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, (-state.pointer.y * Math.PI) / 4, 0.1);
  });

  return (
    <group ref={group} {...props} dispose={null}>
      {/* Body */}
      <Sphere args={[0.5, 32, 32]} position={[0, -0.6, 0]}>
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.8} />
      </Sphere>
      
      {/* Neck */}
      <Cylinder args={[0.1, 0.15, 0.3, 16]} position={[0, -0.15, 0]}>
        <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.5} />
      </Cylinder>

      {/* Head */}
      <Sphere args={[0.7, 32, 32]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.6} />
      </Sphere>

      {/* Lens Outer Ring */}
      <Cylinder args={[0.4, 0.45, 0.2, 32]} position={[0, 0.5, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} roughness={0.1} metalness={0.8} />
      </Cylinder>

      {/* Lens Inner Glass */}
      <Sphere args={[0.35, 32, 32]} position={[0, 0.5, 0.55]} scale={[1, 1, 0.5]}>
        <meshStandardMaterial color="#111111" roughness={0} metalness={1} envMapIntensity={2} />
      </Sphere>

      {/* Glowing Eye Core */}
      <Sphere args={[0.1, 16, 16]} position={[0, 0.5, 0.65]} scale={[1, 1, 0.2]}>
        <meshStandardMaterial color="#aa00ff" emissive="#aa00ff" emissiveIntensity={2} />
      </Sphere>

      {/* Antenna */}
      <Cylinder args={[0.02, 0.02, 0.4, 8]} position={[0.4, 1.2, 0]} rotation={[0, 0, -Math.PI / 8]}>
        <meshStandardMaterial color="#eeeeee" metalness={0.8} />
      </Cylinder>
      <Sphere args={[0.08, 16, 16]} position={[0.55, 1.35, 0]}>
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1} />
      </Sphere>
      
      {/* Arms */}
      <Cylinder args={[0.08, 0.08, 0.6, 16]} position={[-0.6, -0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
         <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.8} />
      </Cylinder>
      <Cylinder args={[0.08, 0.08, 0.6, 16]} position={[0.6, -0.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
         <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.8} />
      </Cylinder>
    </group>
  );
}

export default function LensBotWidget() {
  return (
    <div style={{ width: '100%', height: '200px', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} color="#aa00ff" intensity={1} />
        <Suspense fallback={null}>
          <LensBotModel position={[0, -0.2, 0]} />
          <Environment preset="city" />
          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        </Suspense>
      </Canvas>
    </div>
  );
}
