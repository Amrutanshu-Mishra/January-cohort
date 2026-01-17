"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, useClerk, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { GraduationCap, Building2, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { openSignIn, openSignUp } = useClerk();
  const router = useRouter();

  const [designation, setDesignation] = useState(null); // 'student' or 'organisation'
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync role to Clerk metadata after login
  useEffect(() => {
    const syncRole = async () => {
      if (isLoaded && isSignedIn && user) {
        const existingRole = user.unsafeMetadata?.role;

        // 1. Proactive Redirect: If role exists, go to dashboard
        if (existingRole) {
          redirectUser(existingRole);
          return;
        }

        // 2. Metadata Update: If we just finished selection/auth and have a designation
        const storedDesignation = designation || localStorage.getItem("selected_designation");

        if (storedDesignation) {
          setIsSyncing(true);
          try {
            await user.update({
              unsafeMetadata: {
                role: storedDesignation
              }
            });
            localStorage.removeItem("selected_designation");
            redirectUser(storedDesignation);
          } catch (err) {
            console.error("Error updating clerk metadata:", err);
            setIsSyncing(false);
          }
        }
      }
    };

    syncRole();
  }, [isLoaded, isSignedIn, user, designation]);

  const redirectUser = (role) => {
    if (role === 'student') {
      router.push("/dashboard");
    } else if (role === 'organisation') {
      router.push("/recruiter-dashboard");
    }
  };

  const handleSelect = (role) => {
    setDesignation(role);
    localStorage.setItem("selected_designation", role);
  };

  // Show global loader if Clerk hasn't loaded, if we are currently syncing,
  // or if the user is signed in and we are checking for their role to redirect them.
  if (!isLoaded || isSyncing || (isSignedIn && user?.unsafeMetadata?.role)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium tracking-wide">
          {isSyncing ? "Finalizing your profile..." : "Checking credentials..."}
        </p>
      </div>
    );
  }

  const currentRole = designation || user?.unsafeMetadata?.role;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-slate-900/50 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/10"
      >
        <AnimatePresence mode="wait">
          {!currentRole ? (
            <motion.div
              key="step-select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-center space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-4xl font-bold text-white tracking-tight">Select Designation</h2>
                <p className="text-slate-400">Choose how you want to use ResumeAI</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RoleCard
                  icon={<GraduationCap size={40} />}
                  title="Student"
                  description="Optimize your resume and track skill gaps for your dream job."
                  onClick={() => handleSelect('student')}
                />
                <RoleCard
                  icon={<Building2 size={40} />}
                  title="Organisation"
                  description="Post jobs and find the best talent using AI-powered matching."
                  onClick={() => handleSelect('organisation')}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-auth"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Great choice!</h2>
                <p className="text-slate-400">Now, let's {isSignedIn ? 'finalize' : 'create'} your account as a <span className="text-blue-400 font-bold capitalize">{currentRole}</span></p>
              </div>

              <div className="flex flex-col gap-4">
                {!isSignedIn ? (
                  <>
                    <button
                      onClick={() => openSignUp()}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/20"
                    >
                      Get Started <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500 font-semibold tracking-widest leading-6">Already have an account?</span></div>
                    </div>
                    <button
                      onClick={() => openSignIn()}
                      className="w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-lg transition-all"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <div className="p-8 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-blue-100 flex items-center gap-4">
                    <Loader2 className="animate-spin text-blue-400" />
                    <span className="font-medium font-mono text-sm uppercase tracking-wider">Syncing Role...</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    setDesignation(null);
                    localStorage.removeItem("selected_designation");
                  }}
                  className="text-sm text-slate-500 hover:text-white transition-colors pt-4"
                >
                  Change Designation
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function RoleCard({ icon, title, description, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center p-8 bg-white/5 border border-white/10 rounded-3xl text-center hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] shadow-xl"
    >
      <div className={`mb-4 p-4 rounded-2xl bg-slate-800 text-white group-hover:bg-blue-600 transition-colors duration-300`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      <div className="mt-6 text-blue-400 font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        Select <ArrowRight size={16} />
      </div>
    </button>
  );
}