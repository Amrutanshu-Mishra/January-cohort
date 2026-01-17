"use client";

import { motion } from "framer-motion";
import TiltImage from "@/components/ui/tiltImage";

export default function ImageGroup1() {
    const images = [
        { src: "/gap-analysis.jpg", alt: "Gap analysis" },
        { src: "/resume-opt.jpg", alt: "Resume optimization" },
        { src: "/roadmap.jpg", alt: "Roadmap" },
    ];

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
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
                            {/* shared light-blue gradient background behind the image */}
                            <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-sky-100 via-sky-50 to-white" />

                            <div className="w-full h-64 md:h-72 lg:h-80 flex items-center justify-center">
                                <TiltImage
                                    src={img.src}
                                    alt={img.alt}
                                    width={1200}
                                    height={800}
                                    className="w-full h-full"
                                />
                            </div>

                            <div className="pt-4">
                                <h3 className="text-lg font-semibold text-slate-900">{img.alt}</h3>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}