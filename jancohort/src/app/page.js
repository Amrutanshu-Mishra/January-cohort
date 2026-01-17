"use client";

import Image from "next/image";
import Header from "./header";
import Loader from "@/components/ui/loader";
import Button from "@/components/ui/main_button";
import ImageGroup1 from "./image_body";
import { Suspense } from "react";

import { Lavishly_Yours } from "next/font/google";

import { motion } from "framer-motion"

const lavishlyYours = Lavishly_Yours({ subsets: ["latin"], weight: "400" });

export default function Home() {
  const text = "Let us guide you to your success";
  const characters = text.split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.5,
      },
    },
  };

  const characterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: "easeOut",
      },
    },
  };

  return (
    <>
      <Header />
      <Suspense fallback={<LoadingScreen />}>
        <main className="flex-1 bg-white">
          {/* Full Width Responsive Video */}
          <div className="w-screen h-auto aspect-video relative pointer-events-none">
            <video
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
              src="/8632606-uhd_3840_2160_25fps.mp4"
            >
              Your browser does not support the video tag.
            </video>
            {/* Dark Transparent Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Animated Text Over Video */}
            <motion.h1
              className={`${lavishlyYours.className} absolute inset-0 flex items-center justify-center text-7xl lg:text-8xl xl:text-9xl font-bold text-white text-center px-4 pointer-events-auto`}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {characters.map((char, index) => (
                <motion.span
                  key={index}
                  variants={characterVariants}
                  className="inline-block"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.h1>
          </div>

          {/* Button Below Video */}
          <motion.div
            className="flex justify-center py-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Button />
          </motion.div>

          {/* Image group below video */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <ImageGroup1 />
          </motion.div>
        </main>
      </Suspense>
      
    </>
  );
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <Loader />
    </div>
  );
}
