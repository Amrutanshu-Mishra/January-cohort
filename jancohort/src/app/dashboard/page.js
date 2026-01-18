"use client";
import { useUser } from "@clerk/nextjs";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import CandidatePOV from "@/components/dashboard/CandidatePOV";
import Loader from "@/components/ui/loader";

export default function DashboardPage() {
  const { isLoaded } = useUser();

  if (!isLoaded) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader />
    </div>
  );

  return (
    <ProtectedRoute allowedRoles="user">
      <div className="min-h-screen">
        <CandidatePOV />
      </div>
    </ProtectedRoute>
  );
}