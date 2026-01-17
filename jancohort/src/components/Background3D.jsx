'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';

function RotatingShape() {
    const meshRef = useRef(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;

        // Rotate based on time and scroll position
        if (meshRef.current) {
            meshRef.current.rotation.x = time * 0.2 + scrollY * 0.001;
            meshRef.current.rotation.y = time * 0.3 + scrollY * 0.0015;
        }
    });

    return (
        <mesh ref={meshRef}>
            {/* TorusKnotGeometry: radius, tube, tubularSegments, radialSegments */}
            <torusKnotGeometry args={[3, 1, 200, 32]} />
            <meshStandardMaterial
                color="#6e57ff"
                emissive="#110033"
                roughness={0.1}
                metalness={0.8}
                wireframe={true}
            />
        </mesh>
    );
}

export default function Background3D() {
    return (
        <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none bg-black">
            <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ff0080" />
                <pointLight position={[-10, -10, -10]} intensity={1.5} color="#00ffff" />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <RotatingShape />
                </Float>
            </Canvas>
        </div>
    );
}
