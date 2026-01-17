"use client";

import { motion } from "framer-motion";
import TiltImage from "@/components/ui/tiltImage";
import { Lavishly_Yours } from "next/font/google";

const lavishlyYours = Lavishly_Yours({ subsets: ["latin"], weight: "400" });

export default function ImageGroup1() {
    const images = [
        { src: "/gap-analysis.jpg", alt: "Gap analysis by our expert tech" },
        { src: "/resume-opt.jpg", alt: "Resume optimization and ats improvement" },
        { src: "/roadmap.jpg", alt: "Roadmap generation for upskill" },
    ];

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-32">
            {images.map((img, index) => (
                <div
                    key={img.src}
                    className={`flex flex-col md:flex-row items-center gap-12 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''
                        }`}
                >
                    {/* Image Side */}
                    <motion.div
                        className="w-full md:w-1/2"
                        initial={{ opacity: 0, x: index % 2 === 1 ? 50 : -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <TiltImage
                            src={img.src}
                            alt={img.alt}
                            width={800}
                            height={600}
                            className="w-full aspect-[4/3] object-cover rounded-2xl shadow-2xl border border-white/10"
                        />
                    </motion.div>

                    {/* Text Side */}
                    <div className="w-full md:w-1/2 text-center md:text-left">
                        <TypewriterText text={img.alt} className={`${lavishlyYours.className} text-4xl md:text-6xl text-white leading-tight`} />
                    </div>
                </div>
            ))}
        </section>
    );
}

function TypewriterText({ text, className }) {
    const characters = text.split("");

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.3
            }
        }
    };

    const charVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.h3
            className={className}
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
        </motion.h3>
    );
}