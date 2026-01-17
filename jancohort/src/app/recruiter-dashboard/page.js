"use client";
import RecruiterPOV from "@/components/dashboard/RecruiterPOV";
import Loader from "@/components/ui/loader";
import { useUser } from "@clerk/nextjs";

export default function RecruiterDashboardPage() {
    const { isLoaded } = useUser();

    if (!isLoaded) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950">
            <RecruiterPOV />
        </div>
    );
}
