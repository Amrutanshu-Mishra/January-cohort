"use client";

import Image from "next/image";
import Header from "./header";
import Loader from "@/components/ui/loader";
import Button from "@/components/ui/main_button";
import ImageGroup1 from "./image_body";
import { Suspense } from "react";
import { Lavishly_Yours } from "next/font/google";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation"; // 1. Import useRouter

// 2. Import useUser along with useClerk
import { useClerk, useUser } from "@clerk/nextjs";

const lavishlyYours = Lavishly_Yours({ subsets: ["latin"], weight: "400" });

import Background3D from "@/components/Background3D";

export default function Home() {
  const { openSignIn, openSignUp } = useClerk();
  const { isSignedIn } = useUser(); // 3. Check if user is logged in
  const router = useRouter(); // 4. Initialize router

  // Logic for Start Session
  const handleSignInClick = () => {
    if (isSignedIn) {
      router.push("/register");
    } else {
      openSignIn({ afterSignInUrl: '/dashboard' });
    }
  };

  // Logic for Register
  const handleRegisterClick = () => {
    if (isSignedIn) {
      router.push("/register");
    } else {
      openSignUp({ afterSignUpUrl: '/dashboard' });
    }
  };

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
      <Background3D />
      <Header />
      <Suspense fallback={<LoadingScreen />}>
        <main className="flex-1 relative">
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
            <div className="absolute inset-0 bg-black/40"></div>

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

          {/* Centered Buttons Container */}
          <motion.div
            className="relative z-50 flex flex-col sm:flex-row items-center justify-center gap-6 py-12 pointer-events-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {/* Start Session Button */}
            <Button onClick={handleSignInClick}>
              Start Session
            </Button>

            {/* Register Button with Logic */}
            <Button onClick={handleRegisterClick}>
              Register Now
            </Button>
          </motion.div>

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
