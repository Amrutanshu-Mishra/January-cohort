"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { UserButton, useUser } from "@clerk/nextjs";
import { Briefcase, Target, Zap, BookOpen, FileUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CandidatePOV() {
  const { user } = useUser();
  const fileInputRef = useRef(null);
  const [activeView, setActiveView] = useState("jobs"); // 'jobs', 'skills', 'learning'

  // Mock data representing what will eventually come from MongoDB/AWS
  const jobMatches = [
    { id: 1, role: "Frontend Engineer", company: "TechFlow", match: 92, missing: [] },
    { id: 2, role: "DevOps Specialist", company: "CloudScale", match: 78, missing: ["Terraform", "Kubernetes"] },
    { id: 3, role: "Fullstack Dev", company: "DataSync", match: 85, missing: ["Redis"] },
  ];

  // Mock data for the graph - now in state
  const [skillGapData, setSkillGapData] = useState([
    { name: 'Upload 1', gap: 85 },
    { name: 'Upload 2', gap: 60 },
    { name: 'Upload 3', gap: 45 },
    { name: 'Upload 4', gap: 20 },
    { name: 'Current', gap: 15 },
  ]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(`Selected file: ${file.name}`);

      // Simulate API Call
      // const formData = new FormData();
      // formData.append("resume", file);
      // const res = await fetch("/api/analyze-resume", { method: "POST", body: formData });
      // const data = await res.json();

      // Mocking response for now
      setTimeout(() => {
        const newGapScore = Math.floor(Math.random() * 15) + 5; // Random score 5-20%

        setSkillGapData(prev => [
          ...prev,
          { name: `New Upload`, gap: newGapScore }
        ]);

        // Auto-switch to skills view to see the result
        setActiveView("skills");

        alert(`Resume analyzed! Gap reduced to ${newGapScore}%. Graph updated.`);
      }, 1500);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
          <h1 className="text-xl font-bold text-slate-900">Pro-Guide</h1>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem
            icon={<Briefcase size={20} />}
            label="Job Feed"
            active={activeView === "jobs"}
            onClick={() => setActiveView("jobs")}
          />
          <NavItem
            icon={<Target size={20} />}
            label="Skill Analysis"
            active={activeView === "skills"}
            onClick={() => setActiveView("skills")}
          />
          <NavItem
            icon={<BookOpen size={20} />}
            label="Learning Paths"
            active={activeView === "learning"}
            onClick={() => setActiveView("learning")}
          />
        </nav>

        <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900">{user?.firstName}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wider">Candidate</span>
          </div>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {activeView === 'jobs' ? 'Recommended for You' : activeView === 'skills' ? 'Skill Gap Analysis' : 'Learning Paths'}
            </h2>
            <p className="text-slate-500">
              {activeView === 'jobs' ? 'Based on your parsed resume and skill profile.' : 'Track your improvement over time.'}
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-500/20 active:scale-95"
            >
              <FileUp size={20} />
              Upload Resume
            </button>
          </div>
        </header>

        {activeView === "jobs" && (
          <div className="grid grid-cols-1 gap-6">
            {jobMatches.map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ y: -4 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                    <Briefcase size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{job.role}</h3>
                    <p className="text-slate-500">{job.company}</p>
                    {job.missing.length > 0 && (
                      <p className="text-xs mt-2 text-orange-600 font-medium">
                        Gap detected: {job.missing.join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-2xl font-black ${job.match >= 80 ? 'text-green-600' : 'text-orange-500'}`}>
                    {job.match}%
                  </div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Match Score</p>
                  <button className="mt-3 px-4 py-2 bg-slate-900 text-white text-sm rounded-lg font-medium hover:bg-slate-800 transition-all">
                    Apply Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeView === "skills" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Skill Gap Reduction Over Time</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={skillGapData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} label={{ value: 'Gap %', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="gap" stroke="#ea580c" strokeWidth={3} activeDot={{ r: 8 }} name="Skill Gap %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeView === "learning" && (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <p>Learning paths module coming soon...</p>
          </div>
        )}

      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}