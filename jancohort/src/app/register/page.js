"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState(0); // 0 = role select, 1 = recruiter form
  const [role, setRole] = useState(null);

  const [companyData, setCompanyData] = useState({
    companyName: "",
    website: "",
    description: "",
    industry: "",
    size: "Startup",
  });

  const finishRegistration = async () => {
    // TODO: Save to MongoDB + Clerk metadata
    router.push("/recruiter-dashboard");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div
        layout
        className="max-w-2xl w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-8 shadow-xl"
      >
        <AnimatePresence mode="wait">
          {/* STEP 0: Role Selection */}
          {step === 0 && (
            <motion.div
              key="role-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <h2 className="text-3xl font-bold">Choose your path</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setRole("candidate");
                    router.push("/dashboard");
                  }}
                  className="p-6 border rounded-2xl hover:bg-orange-50"
                >
                  Candidate
                </button>

                <button
                  onClick={() => {
                    setRole("recruiter");
                    setStep(1);
                  }}
                  className="p-6 border rounded-2xl hover:bg-blue-50"
                >
                  Recruiter
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 1: Recruiter Form */}
          {step === 1 && role === "recruiter" && (
            <motion.div
              key="recruiter-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold">Company Profile</h2>

              <input
                placeholder="Company Name"
                className="w-full p-3 border rounded-xl"
                onChange={(e) =>
                  setCompanyData({ ...companyData, companyName: e.target.value })
                }
              />

              <input
                placeholder="Website (Optional)"
                className="w-full p-3 border rounded-xl"
                onChange={(e) =>
                  setCompanyData({ ...companyData, website: e.target.value })
                }
              />

              <select
                className="w-full p-3 border rounded-xl"
                onChange={(e) =>
                  setCompanyData({ ...companyData, size: e.target.value })
                }
              >
                <option value="Startup">Startup</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
                <option value="Enterprise">Enterprise</option>
              </select>

              <textarea
                placeholder="Company Description"
                className="w-full p-3 border rounded-xl"
                onChange={(e) =>
                  setCompanyData({
                    ...companyData,
                    description: e.target.value,
                  })
                }
              />

              <button
                onClick={finishRegistration}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold"
              >
                Complete Setup
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
