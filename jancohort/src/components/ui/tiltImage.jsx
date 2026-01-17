"use client";

import React, { useRef } from "react";
import Image from "next/image";
import {
    motion,
    useMotionValue,
    useTransform,
    useSpring,
} from "framer-motion";

export default function TiltImage({
    src,
    alt,
    width,
    height,
    className,
    ...props
}) {
    const ref = useRef(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseXPos = e.clientX - rect.left;
        const mouseYPos = e.clientY - rect.top;

        const xPct = mouseXPos / width - 0.5;
        const yPct = mouseYPos / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={`relative rounded-xl ${className || ""}`}
        >
            <div
                style={{
                    transform: "translateZ(50px)",
                    transformStyle: "preserve-3d"
                }}
                className="rounded-xl overflow-hidden block"
            >
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    className={`object-cover rounded-xl shadow-lg pointer-events-none ${className}`}
                    {...props}
                />
            </div>
        </motion.div>
    );
}
