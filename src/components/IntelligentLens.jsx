import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Environment, 
  MeshTransmissionMaterial, 
  Sphere, 
  Torus, 
  Cylinder,
  Line,
  Float,
  Html
} from '@react-three/drei';
import * as THREE from 'three';

export function LensModel({ leads = [] }) {
  const innerOptics = useRef();
  const innerRing = useRef();
  
  const [focusIndex, setFocusIndex] = useState(-1);

  // Map real leads to particles (up to 50)
  const particleData = useMemo(() => {
    const activeLeads = leads.slice(0, 50);
    
    return activeLeads.map((lead, i) => {
      const radius = 2.0 + Math.random() * 2.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = Math.abs(radius * Math.cos(phi)) * 0.4 + 0.2; // mostly in front

      let state = 'dim';
      if (lead.icp_score >= 60) state = 'active';
      if (lead.icp_score >= 80) state = 'highIntent';

      return {
        id: i,
        leadId: lead.id,
        position: new THREE.Vector3(x, y, z),
        state,
        company: lead.company_name,
        score: Math.round(lead.icp_score || 0),
      };
    });
  }, [leads]);

  const highIntentIndices = useMemo(() => particleData.map((p, i) => p.state === 'highIntent' ? i : -1).filter(i => i !== -1), [particleData]);

  // Event-driven focus mechanism
  useEffect(() => {
    if (highIntentIndices.length === 0) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        const randomIdx = highIntentIndices[Math.floor(Math.random() * highIntentIndices.length)];
        setFocusIndex(randomIdx);
      } else {
        setFocusIndex(-1);
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [highIntentIndices]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    
    // Inner optics rotation
    if (innerOptics.current) {
      if (focusIndex !== -1 && particleData[focusIndex]) {
        // Rotate towards the target node
        const targetPos = particleData[focusIndex].position;
        // Basic lookAt logic for inner group
        const targetRot = new THREE.Quaternion().setFromRotationMatrix(
          new THREE.Matrix4().lookAt(new THREE.Vector3(0,0,0), targetPos, new THREE.Vector3(0,1,0))
        );
        innerOptics.current.quaternion.slerp(targetRot, delta * 4);
      } else {
        // Idle slow rotation
        innerOptics.current.rotation.z += delta * 0.1;
        innerOptics.current.rotation.x = Math.sin(t * 0.2) * 0.1;
      }
    }

    if (innerRing.current) {
      const pulse = focusIndex !== -1 ? (Math.sin(t * 8) + 1) / 2 : (Math.sin(t * 2) + 1) / 2;
      innerRing.current.material.emissiveIntensity = focusIndex !== -1 ? 1.5 + pulse : 0.2 + pulse * 0.5;
    }
  });

  return (
    <group dispose={null}>
      
      {/* 1. OUTER HOUSING (Optimized geometry) */}
      <group>
        <Torus args={[1.2, 0.08, 16, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.7} />
        </Torus>
        <Torus args={[1.1, 0.04, 16, 64]} position={[0, 0, -0.04]}>
          <meshStandardMaterial color="#111111" roughness={0.8} metalness={0.5} />
        </Torus>
        <Cylinder args={[1.08, 1.08, 0.05, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.1]}>
          <meshStandardMaterial color="#030405" roughness={0.9} />
        </Cylinder>
      </group>

      {/* 2. INNER OPTICS (Optimized Refractive Layers using fast meshPhysicalMaterial) */}
      <group ref={innerOptics}>
        <Sphere args={[0.2, 16, 16]} position={[0, 0, -0.05]} scale={[1, 1, 0.2]}>
          <meshStandardMaterial color="#000000" roughness={0.1} metalness={0.9} />
        </Sphere>
        
        {/* Active Cyan Iris */}
        <Torus ref={innerRing} args={[0.35, 0.01, 16, 64]} position={[0, 0, -0.02]}>
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" toneMapped={false} />
        </Torus>

        {/* Deep Optical Glass Layers */}
        <Sphere args={[0.65, 32, 32]} scale={[1, 1, 0.1]} position={[0, 0, -0.03]}>
          <meshPhysicalMaterial
            color="#e0ffff"
            transmission={0.9}
            opacity={1}
            transparent
            roughness={0.1}
            ior={1.5}
          />
        </Sphere>
        
        <Sphere args={[0.9, 32, 32]} scale={[1, 1, 0.15]} position={[0, 0, 0]}>
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.7}
            opacity={1}
            transparent
            roughness={0.2}
            ior={1.2}
          />
        </Sphere>
      </group>

      {/* 3. MAIN OUTER GLASS SHIELD (Kept high-end but lowered samples) */}
      <Sphere args={[1.1, 32, 32]} scale={[1, 1, 0.25]} position={[0, 0, 0.04]}>
        <MeshTransmissionMaterial
          samples={2}
          thickness={0.3}
          chromaticAberration={0.02}
          anisotropy={0.1}
          distortion={0.05}
          distortionScale={0.1}
          color="#ffffff" 
          clearcoat={1}
          attenuationDistance={1}
          attenuationColor="#ffffff"
          roughness={0.05}
          transmission={1}
          ior={1.5}
        />
      </Sphere>

      {/* 4. SIGNAL ELEMENTS (PARTICLES) */}
      <group>
        {particleData.map((data, i) => {
          const isFocused = focusIndex === i;
          
          let color = "#333333";
          let emissive = "#000000";
          let intensity = 0;
          let size = 0.015;

          if (data.state === 'active') {
            color = "#00e5ff"; emissive = "#00e5ff"; intensity = 0.6; size = 0.02;
          } else if (data.state === 'highIntent') {
            color = "#00e5ff"; emissive = "#00e5ff"; intensity = 1.2; size = 0.03;
          }

          if (isFocused) {
            intensity = 2.5;
            size = 0.04;
          }

          return (
            <React.Fragment key={i}>
              {/* Core Particle */}
              <Sphere args={[size, 16, 16]} position={data.position}>
                <meshStandardMaterial 
                  color={color} 
                  emissive={emissive}
                  emissiveIntensity={intensity}
                  toneMapped={false}
                />
              </Sphere>
              
              {/* Expanding ring for high intent */}
              {data.state === 'highIntent' && !isFocused && (
                 <Torus args={[0.08, 0.002, 16, 32]} position={data.position}>
                   <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.5} toneMapped={false} transparent opacity={0.5} />
                 </Torus>
              )}

              {/* Focus Line & Label */}
              {isFocused && (
                <>
                  <Line
                    points={[new THREE.Vector3(0, 0, 0), data.position]}
                    color="#00e5ff"
                    opacity={0.4}
                    transparent
                    lineWidth={1.5}
                  />
                  <Html position={data.position} center distanceFactor={10} zIndexRange={[100, 0]}>
                    <div style={{ 
                      background: 'rgba(10,12,16,0.85)', 
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(0, 229, 255, 0.2)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      color: '#F4F5F6',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      whiteSpace: 'nowrap',
                      transform: 'translate3d(16px, -16px, 0)'
                    }}>
                      <strong style={{ color: '#fff', fontWeight: 600 }}>{data.company}</strong>
                      <span style={{ color: 'var(--brand-cyan)', marginLeft: '6px' }}>{data.score} Intent</span>
                    </div>
                  </Html>
                </>
              )}
            </React.Fragment>
          );
        })}
      </group>
    </group>
  );
}

export default function IntelligentLensWidget({ leads }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 7.5], fov: 40 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.1} />
        {/* Soft, cool key light */}
        <directionalLight position={[5, 5, 5]} intensity={0.5} color="#00e5ff" />
        {/* Very subtle violet reflection purely for optical realism */}
        <directionalLight position={[-5, -5, -2]} intensity={0.15} color="#c084fc" />
        <spotLight position={[0, 5, 0]} intensity={1.5} color="#00e5ff" angle={0.4} penumbra={1} />
        
        <Suspense fallback={null}>
          <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.1} floatingRange={[-0.05, 0.05]}>
            <LensModel leads={leads} position={[0, 0, 0]} />
          </Float>
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
}
