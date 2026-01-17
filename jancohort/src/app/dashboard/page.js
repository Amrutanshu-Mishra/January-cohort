"use client";
import { useUser } from "@clerk/nextjs";
import RecruiterPOV from "@/components/dashboard/RecruiterPOV";
import CandidatePOV from "@/components/dashboard/CandidatePOV";
import Loader from "@/components/ui/loader";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <Loader />;

  // We check the role saved in Clerk metadata
  const userRole = user?.publicMetadata?.role;

  return (
    <div className="min-h-screen">
      {userRole === "recruiter" ? (
        <RecruiterPOV />
      ) : (
        <CandidatePOV />
      )}
    </div>
  );
}