import Image from "next/image";
import Header from "./header";
import Loader from "@/components/ui/loader";
import { Suspense } from "react";

import {motion} from "framer-motion"

export default function Home() {
  return (
    <>
      <Header />
      <Suspense fallback={<LoadingScreen />}>
        <main className="flex-1 bg-white">
          {/* Full Width Responsive Video */}
          <div className="w-screen h-auto aspect-video">
            <video
              autoPlay
              muted
              controls
              className="w-full h-full object-cover"
              src="/8632606-uhd_3840_2160_25fps.mp4"
            >
              Your browser does not support the video tag.
            </video>
          </div>
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
