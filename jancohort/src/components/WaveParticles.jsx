"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Lavishly_Yours } from "next/font/google";

const lavishlyYours = Lavishly_Yours({ subsets: ["latin"], weight: "400" });

export default function WaveParticles({ count = 5000 }) {
    const text = "we incorporate technology and manpower to forge the future";
    const characters = text.split("");

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.03,
                delayChildren: 0.2
            }
        }
    };

    const charVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="w-full h-[500px] relative bg-black/20 backdrop-blur-sm overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0">
                <Canvas camera={{ position: [0, 8, 15], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <Particles count={count} />
                </Canvas>
            </div>

            <motion.h2
                className={`${lavishlyYours.className} relative z-10 text-4xl md:text-6xl text-center text-white font-bold leading-tight px-4 max-w-4xl`}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {characters.map((char, index) => (
                    <motion.span key={index} variants={charVariants}>
                        {char}
                    </motion.span>
                ))}
            </motion.h2>
        </div>
    );
}

function Particles({ count }) {
    const mesh = useRef();

    // Generate specific grid-like positions for a cleaner wave
    const particles = useMemo(() => {
        const temp = [];
        const rows = 50;
        const cols = count / rows;

        for (let i = 0; i < count; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;

            // Map grid to 3D space, centering it
            const x = (col / cols) * 40 - 20; // Spread wide (-20 to 20)
            const z = (row / rows) * 20 - 10; // Depth (-10 to 10)
            const y = 0;

            temp.push({ x, y, z, originalX: x });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!mesh.current) return;

        const scrollY = typeof window !== 'undefined' ? window.scrollY || 0 : 0;
        const scrollFactor = scrollY * 0.01; // Sensitivity
        const t = state.clock.getElapsedTime();

        particles.forEach((particle, i) => {
            // Recalculate X based on scroll to move the whole sheet
            // We use modulo to loop the wave seamlessly
            let movedX = (particle.originalX + scrollFactor) % 40;
            if (movedX > 20) movedX -= 40;
            if (movedX < -20) movedX += 40;

            // Pure sine wave logic based on X and Z
            const waveY = Math.sin(movedX * 0.5 + t) * 1.5 + Math.sin(particle.z * 0.5 + t * 0.5) * 0.5;

            dummy.position.set(movedX, waveY, particle.z);

            // Reduced scale for finer particles
            const scale = 0.08;
            dummy.scale.set(scale, scale, scale);

            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });

        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial
                color="#00c6ff"
                emissive="#0072ff"
                emissiveIntensity={0.8}
                transparent
                opacity={0.6}
                roughness={0.2}
                metalness={0.8}
            />
        </instancedMesh>
    );
}
