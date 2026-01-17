"use client";
import { useUser } from "@clerk/nextjs";
import RecruiterPOV from "@/components/dashboard/RecruiterPOV";
import CandidatePOV from "@/components/dashboard/CandidatePOV";
import Loader from "@/components/ui/loader";

export default function DashboardPage() {
  const { isLoaded } = useUser();

  if (!isLoaded) return <Loader />;

  return (
    <div className="min-h-screen">
      <CandidatePOV />
    </div>
  );
}