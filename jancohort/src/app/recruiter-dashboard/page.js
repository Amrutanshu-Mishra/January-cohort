"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import RecruiterPOV from "@/components/dashboard/RecruiterPOV";
import Loader from "@/components/ui/loader";
import { useUser } from "@clerk/nextjs";

export default function RecruiterDashboardPage() {
    const { isLoaded } = useUser();

    if (!isLoaded) return <Loader />;

    return (
        <ProtectedRoute allowedRoles="company">
            <div className="min-h-screen">
                <RecruiterPOV />
            </div>
        </ProtectedRoute>
    );
}
