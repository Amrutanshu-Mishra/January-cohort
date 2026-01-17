"use client";
import { motion } from "framer-motion";
import { UserButton, useUser } from "@clerk/nextjs";
import { Briefcase, Target, Zap, BookOpen } from "lucide-react";

export default function CandidatePOV() {
  const { user } = useUser();

  // Mock data representing what will eventually come from MongoDB/AWS
  const jobMatches = [
    { id: 1, role: "Frontend Engineer", company: "TechFlow", match: 92, missing: [] },
    { id: 2, role: "DevOps Specialist", company: "CloudScale", match: 78, missing: ["Terraform", "Kubernetes"] },
    { id: 3, role: "Fullstack Dev", company: "DataSync", match: 85, missing: ["Redis"] },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
          <h1 className="text-xl font-bold text-slate-900">Pro-Guide</h1>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem icon={<Briefcase size={20}/>} label="Job Feed" active />
          <NavItem icon={<Target size={20}/>} label="Skill Analysis" />
          <NavItem icon={<BookOpen size={20}/>} label="Learning Paths" />
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
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Recommended for You</h2>
          <p className="text-slate-500">Based on your parsed resume and skill profile.</p>
        </header>

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
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}