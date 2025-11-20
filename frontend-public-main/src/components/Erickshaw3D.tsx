import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function ErickshawModel() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  // Create a simple e-rickshaw shape since we don't have a 3D model
  return (
    <group>
      {/* Base */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.2, 1]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      
      {/* Driver's seat */}
      <mesh position={[-0.7, 0.3, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#166534" />
      </mesh>
      
      {/* Passenger seats */}
      <mesh position={[0.3, 0.3, 0]}>
        <boxGeometry args={[0.8, 0.4, 0.8]} />
        <meshStandardMaterial color="#166534" />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[2.2, 0.1, 1.2]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      
      {/* Front wheel */}
      <mesh position={[-0.8, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      
      {/* Back wheels */}
      <mesh position={[0.6, -0.2, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0.6, -0.2, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}

const Erickshaw3D: React.FC = () => {
  return (
    <div className="w-full h-[400px]">
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <ErickshawModel />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};

export default Erickshaw3D; 