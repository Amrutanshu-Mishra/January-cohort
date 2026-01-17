"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle, Upload, ChevronRight } from "lucide-react";

const domains = [
  "Frontend", "Backend", "Fullstack", "DevOps", "Mobile Dev", 
  "Data Science", "AI/ML", "Cybersecurity", "UI/UX Design", "Cloud Arch"
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    interests: [],
    resume: null
  });

  const toggleInterest = (domain) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(domain)
        ? prev.interests.filter(i => i !== domain)
        : [...prev.interests, domain]
    }));
  };

  const handleNext = () => setStep(step + 1);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div 
        layout
        className="max-w-2xl w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-8 shadow-xl"
      >
        <AnimatePresence mode="wait">
          {/* STEP 1: Username & Domains */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Personalize your profile</h2>
                <p className="text-slate-500">Tell us what you're passionate about.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Choose a Username</label>
                <input 
                  type="text"
                  placeholder="@username"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Domains of Interest</label>
                <div className="flex flex-wrap gap-2">
                  {domains.map((domain) => (
                    <button
                      key={domain}
                      onClick={() => toggleInterest(domain)}
                      className={`px-4 py-2 rounded-full border text-sm transition-all ${
                        formData.interests.includes(domain)
                          ? "bg-gradient-to-r from-[#f27121] to-[#e94057] text-white border-transparent"
                          : "bg-white text-slate-600 border-slate-200 hover:border-orange-300"
                      }`}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleNext}
                disabled={!formData.username || formData.interests.length === 0}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-30"
              >
                Next Step <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 2: Resume Upload */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 text-center"
            >
              <div className="text-left">
                <h2 className="text-3xl font-bold text-slate-900">Upload Resume</h2>
                <p className="text-slate-500">Let's get your professional details set up.</p>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 hover:border-orange-500 transition-colors group cursor-pointer relative">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setFormData({...formData, resume: e.target.files[0]})}
                />
                <Upload className="mx-auto text-slate-400 group-hover:text-orange-500 mb-4" size={48} />
                <p className="text-slate-600 font-medium">
                  {formData.resume ? formData.resume.name : "Drop your PDF here or click to browse"}
                </p>
              </div>

              <button 
                onClick={() => router.push('/dashboard')}
                className="w-full py-4 bg-gradient-to-r from-[#f27121] via-[#e94057] to-[#8a2387] text-white rounded-xl font-bold shadow-lg shadow-orange-100"
              >
                Complete Registration
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}