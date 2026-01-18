"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { registerCompany, syncUser } from "@/lib/api";
import { Building2, User, Loader2, CheckCircle, AlertCircle, Rocket, Briefcase } from "lucide-react";

export default function RegisterPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState(null); // 'candidate' or 'recruiter'
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // State matching Company Mongoose Schema
  const [companyData, setCompanyData] = useState({
    companyName: "",
    website: "",
    description: "",
    industry: "",
    size: "Startup",
  });

  // Check if user already has a role (redirect if so)
  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role) {
      const existingRole = user.publicMetadata.role;
      if (existingRole === 'company') {
        router.push('/recruiter-dashboard');
      } else if (existingRole === 'user') {
        router.push('/dashboard');
      }
    }
  }, [isLoaded, user, router]);

  // Handle candidate selection - sync user to MongoDB and redirect
  const handleCandidateSelection = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Sync user to MongoDB (webhook might have done this already, but this ensures it)
      await syncUser(getToken);

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      console.error("Error syncing user:", err);
      // Even if sync fails, the user was likely already created via webhook
      // Still redirect to dashboard
      router.push('/dashboard');
    }
  };

  // Handle company registration
  const finishCompanyRegistration = async () => {
    if (!companyData.companyName.trim()) {
      setError("Company name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await registerCompany(companyData, getToken);

      setSuccess(true);
      setTimeout(() => {
        router.push('/recruiter-dashboard');
      }, 1000);
    } catch (err) {
      console.error("Error registering company:", err);
      setError(err.message || "Failed to register company. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-orange-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        layout
        className="relative max-w-xl w-full bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/30">
            <Rocket className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-white">Pro-Guide</h1>
        </div>

        <AnimatePresence mode="wait">
          {/* Success State */}
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">You're all set!</h2>
              <p className="text-slate-400">Redirecting to your dashboard...</p>
            </motion.div>
          )}

          {/* Step 0: Role Selection */}
          {!success && step === 0 && (
            <motion.div
              key="role-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome, {user?.firstName || 'there'}!</h2>
                <p className="text-slate-400">Choose how you want to use Pro-Guide</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Candidate Option */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setRole('candidate');
                    handleCandidateSelection();
                  }}
                  disabled={isSubmitting}
                  className="relative p-6 rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-600/5 hover:border-orange-500/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-all">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-1">Job Seeker</h3>
                      <p className="text-sm text-slate-400">Find jobs that match your skills</p>
                    </div>
                  </div>
                  {isSubmitting && role === 'candidate' && (
                    <div className="absolute inset-0 bg-slate-900/50 rounded-2xl flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                    </div>
                  )}
                </motion.button>

                {/* Recruiter Option */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setRole('recruiter');
                    setStep(1);
                  }}
                  disabled={isSubmitting}
                  className="relative p-6 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:border-blue-500/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-1">Recruiter</h3>
                      <p className="text-sm text-slate-400">Post jobs & find talent</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 1: Company Registration Form */}
          {!success && step === 1 && role === 'recruiter' && (
            <motion.div
              key="recruiter-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <button
                onClick={() => setStep(0)}
                className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
              >
                ← Back
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Company Profile</h2>
                <p className="text-slate-400">Tell us about your company</p>
              </div>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    placeholder="e.g. Acme Inc."
                    value={companyData.companyName}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Website</label>
                  <input
                    placeholder="https://yourcompany.com"
                    value={companyData.website}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Industry</label>
                  <input
                    placeholder="e.g. Technology, Healthcare, Finance"
                    value={companyData.industry}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Company Size</label>
                  <select
                    value={companyData.size}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                    onChange={(e) => setCompanyData({ ...companyData, size: e.target.value })}
                  >
                    <option value="Startup" className="bg-slate-800">Startup (1-10)</option>
                    <option value="Small" className="bg-slate-800">Small (11-50)</option>
                    <option value="Medium" className="bg-slate-800">Medium (51-200)</option>
                    <option value="Large" className="bg-slate-800">Large (201-1000)</option>
                    <option value="Enterprise" className="bg-slate-800">Enterprise (1000+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                  <textarea
                    placeholder="Tell candidates about your company culture, mission, and values..."
                    value={companyData.description}
                    rows={4}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={finishCompanyRegistration}
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Company...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Complete Setup
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}