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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch bg-sky-900/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                {images.map((img) => (
                    <motion.div
                        key={img.src}
                        className="w-full rounded-2xl overflow-visible"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <div className="relative rounded-2xl p-4 md:p-6 lg:p-8">
                            {/* shared translucent gradient background behind the image */}
                            <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-sky-500/10 via-sky-900/10 to-transparent border border-white/5" />

                            <div className="w-full aspect-video flex items-center justify-center overflow-hidden">
                                <TiltImage
                                    src={img.src}
                                    alt={img.alt}
                                    width={1200}
                                    height={800}
                                    className="w-full h-full"
                                />
                            </div>

                            <div className="pt-4">
                                <h3 className={`${lavishlyYours.className} text-3xl text-white text-center`}>{img.alt}</h3>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}