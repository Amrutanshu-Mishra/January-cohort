"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { user } = useUser();
  const router = useRouter();
  const [role, setRole] = useState(null); // 'candidate' or 'recruiter'
  const [step, setStep] = useState(0);
  
  // State matching your Mongoose Schema
  const [companyData, setCompanyData] = useState({
    companyName: "",
    website: "",
    description: "",
    industry: "",
    size: "Startup",
  });

  const finishRegistration = async () => {
    // Logic to save to MongoDB and update Clerk Metadata
    // For now, redirecting to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div layout className="max-w-xl w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-100">
        <AnimatePresence mode="wait">
          {step === 0 && (
             <motion.div key="role-select" className="text-center space-y-6">
                <h2 className="text-3xl font-bold">Choose your path</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => {setRole('candidate'); setStep(1)}} className="p-6 border rounded-2xl hover:bg-orange-50">Candidate</button>
                  <button onClick={() => {setRole('recruiter'); setStep(1)}} className="p-6 border rounded-2xl hover:bg-blue-50">Recruiter</button>
                </div>
             </motion.div>
          )}

          {step === 1 && role === 'recruiter' && (
            <motion.div key="recruiter-form" className="space-y-4">
              <h2 className="text-2xl font-bold">Company Profile</h2>
              <input 
                placeholder="Company Name" 
                className="w-full p-3 border rounded-xl"
                onChange={(e) => setCompanyData({...companyData, companyName: e.target.value})}
              />
              <input 
                placeholder="Website (Optional)" 
                className="w-full p-3 border rounded-xl"
                onChange={(e) => setCompanyData({...companyData, website: e.target.value})}
              />
              <select 
                className="w-full p-3 border rounded-xl"
                onChange={(e) => setCompanyData({...companyData, size: e.target.value})}
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
                onChange={(e) => setCompanyData({...companyData, description: e.target.value})}
              />
              <button onClick={finishRegistration} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">
                Complete Setup
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}