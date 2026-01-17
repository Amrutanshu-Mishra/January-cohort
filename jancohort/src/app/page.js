import Image from "next/image";
import Header from "./header";
import Loader from "@/components/ui/loader";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <Header />
      <Suspense fallback={<LoadingScreen />}>
        <main className="flex-1 bg-slate-950 min-h-screen">
          {/* Add your page content here */}
        </main>
      </Suspense>
    </>
  );
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <Loader />
    </div>
  );
}
