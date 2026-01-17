"use client";
import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { PlusCircle, Database, Users, Briefcase, Wand2, Download, Save, Building2 } from "lucide-react";
import { jsPDF } from "jspdf";

export default function RecruiterPOV() {
  const { user } = useUser();
  const [activeView, setActiveView] = useState("overview");
  const [isEditingCompany, setIsEditingCompany] = useState(false);

  const [companyDetails, setCompanyDetails] = useState({
    name: "Acme Corp",
    industry: "Technology",
    size: "100-500 employees",
    website: "https://acme.org",
    description: "Innovating the future with AI and Cloud solutions."
  });

  const [jobForm, setJobForm] = useState({
    title: "",
    requirements: "",
    location: "",
    type: "Full Time",
    experience: "Mid Level",
    salary: "",
    status: "Active"
  });

  const handleCompanyUpdate = (e) => {
    e.preventDefault();
    setIsEditingCompany(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Job Posted:", jobForm);
    alert("Job Posted Successfully! (Mock)");
  };

  const handleGenerateDescription = () => {
    const generated = `We are looking for a ${jobForm.title || "passionate professional"} to join our team in ${jobForm.location || "a fast-paced environment"}.

Key Responsibilities:
- Design and implement scalable solutions.
- Collaborate with cross-functional teams.
- Mentor junior developers and drive code quality.

Requirements:
- Proven experience in relevant technologies.
- Strong problem-solving skills.
- Excellent communication abilities.`;
    setJobForm(prev => ({ ...prev, requirements: generated }));
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Job Posting Details", 20, 20);
    doc.setFontSize(12);
    doc.text(`Title: ${jobForm.title}`, 20, 40);
    doc.text(`Location: ${jobForm.location}`, 20, 50);
    doc.text(`Type: ${jobForm.type}`, 20, 60);
    doc.text(`Experience: ${jobForm.experience}`, 20, 70);
    doc.text(`Salary: $${jobForm.salary}`, 20, 80);
    doc.text(`Status: ${jobForm.status}`, 20, 90);
    doc.text("Requirements:", 20, 110);
    const splitText = doc.splitTextToSize(jobForm.requirements, 170);
    doc.text(splitText, 20, 120);
    doc.save(`${jobForm.title.replace(/\s+/g, '_')}_job_posting.pdf`);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <aside className="w-72 bg-slate-900 border-r border-slate-800 p-6 flex flex-col">
        <div className="mb-10 px-2">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">H</div>
            Recruiter Hub
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-black mt-2 bg-blue-500/10 px-2 py-1 rounded inline-block">
            {companyDetails.name}
          </p>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem
            icon={<Database size={20} />}
            label="Overview"
            active={activeView === "overview"}
            onClick={() => setActiveView("overview")}
          />
          <NavItem
            icon={<PlusCircle size={20} />}
            label="Post a Job"
            active={activeView === "post-job"}
            onClick={() => setActiveView("post-job")}
          />
          <NavItem
            icon={<Users size={20} />}
            label="Candidates"
            active={activeView === "candidates"}
            onClick={() => setActiveView("candidates")}
          />
        </nav>

        <div className="pt-6 border-t border-slate-800 flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white truncate max-w-[140px]">{user?.firstName || "Recruiter"}</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Admin Access</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        {activeView === "overview" && (
          <div className="max-w-6xl mx-auto space-y-10">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold">Dashboard Overview</h2>
                <p className="text-slate-400">Manage your company profile and track activities.</p>
              </div>
              {!isEditingCompany && (
                <button
                  onClick={() => setIsEditingCompany(true)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-sm font-bold rounded-xl transition-all border border-slate-700 hover:border-slate-600 shadow-lg flex items-center gap-2"
                >
                  <Building2 size={16} />
                  Edit Profile
                </button>
              )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors"></div>

                <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-8 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  Company Identity
                </h3>

                {isEditingCompany ? (
                  <form onSubmit={handleCompanyUpdate} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-500 ml-1">Company Name</label>
                        <input
                          className="w-full bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                          value={companyDetails.name}
                          onChange={(e) => setCompanyDetails({ ...companyDetails, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-500 ml-1">Industry</label>
                        <input
                          className="w-full bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                          value={companyDetails.industry}
                          onChange={(e) => setCompanyDetails({ ...companyDetails, industry: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-500 ml-1">Website URL</label>
                        <input
                          className="w-full bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                          value={companyDetails.website}
                          onChange={(e) => setCompanyDetails({ ...companyDetails, website: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-500 ml-1">Team Size</label>
                        <select
                          className="w-full bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none cursor-pointer"
                          value={companyDetails.size}
                          onChange={(e) => setCompanyDetails({ ...companyDetails, size: e.target.value })}
                        >
                          <option>1-10 employees</option>
                          <option>11-50 employees</option>
                          <option>51-200 employees</option>
                          <option>201-500 employees</option>
                          <option>501-1000 employees</option>
                          <option>1000+ employees</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-slate-500 ml-1">Vision & Mission</label>
                      <textarea
                        className="w-full bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none resize-none transition-all"
                        rows={4}
                        value={companyDetails.description}
                        onChange={(e) => setCompanyDetails({ ...companyDetails, description: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-4 pt-2">
                      <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                        <Save size={18} />
                        Save Changes
                      </button>
                      <button type="button" onClick={() => setIsEditingCompany(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold transition-all">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-y-8">
                      <DetailItem label="Entity Name" value={companyDetails.name} />
                      <DetailItem label="Sector" value={companyDetails.industry} />
                      <DetailItem label="Human Capital" value={companyDetails.size} />
                      <div className="group/link">
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1.5">Corporate Domain</p>
                        <p className="text-lg font-bold text-blue-400 group-hover/link:text-blue-300 transition-colors pointer-events-auto cursor-pointer truncate">
                          {companyDetails.website.replace(/^https?:\/\//, '')}
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-800/50">
                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-3 italic">Professional Description</p>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">
                        {companyDetails.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 px-1">Processing Infrastructure</h3>
                  <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 font-mono text-[11px] h-[300px] overflow-hidden shadow-inner relative group">
                    <div className="space-y-2 opacity-60 group-hover:opacity-100 transition-opacity duration-700">
                      <p className="text-green-500">[{new Date().toLocaleTimeString()}] CLERK-SIGN-IN: Admin session initialized.</p>
                      <p className="text-blue-400">[{new Date().toLocaleTimeString()}] AWS-LAMBDA: Scaling infrastructure for {companyDetails.name}...</p>
                      <p className="text-slate-400">[{new Date().toLocaleTimeString()}] DYNAMO-DB: Indexing candidate matches @0.2ms</p>
                      <p className="text-slate-400">[{new Date().toLocaleTimeString()}] S3-STORE: Verification of company credentials [SUCCESS]</p>
                      <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg my-4">
                        <p className="text-blue-300 text-[10px]">INFRASTRUCTURE STATUS: OPTIMIZED</p>
                      </div>
                      <p className="text-slate-500 animate-pulse">Waiting for telemetry signals...</p>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === "post-job" && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl">
            <header className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Create New Post</h2>
              <p className="text-slate-400">Target the best talent with AI-enhanced requirements.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-500 ml-1">Job Title</label>
                <input
                  required
                  className="w-full p-4 bg-slate-800/50 border border-slate-700 text-white rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                  placeholder="e.g. Lead Product Architect"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-500 ml-1 flex justify-between items-center">
                  Requirements
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    className="text-[10px] flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-black transition-colors"
                  >
                    <Wand2 size={12} />
                    GENERATE WITH AI
                  </button>
                </label>
                <textarea
                  required
                  rows={6}
                  className="w-full p-4 bg-slate-800/50 border border-slate-700 text-white rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  placeholder="List essential skills and qualifications..."
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-500 ml-1">Location</label>
                  <input
                    required
                    className="w-full p-4 bg-slate-800/50 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Remote or Hybrid"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-500 ml-1">Salary Range (Monthly)</label>
                  <input
                    type="text"
                    className="w-full p-4 bg-slate-800/50 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="e.g. $8000 - $12000"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2">
                  <Save size={20} />
                  PUBLISH POSTING
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="px-6 py-4 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold rounded-2xl transition-all flex items-center gap-2"
                >
                  <Download size={20} />
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1.5">{label}</p>
      <p className="text-lg font-bold text-white truncate pr-4">{value}</p>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
    >
      <div className={`${active ? 'text-blue-400' : 'text-slate-500'}`}>{icon}</div>
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </div>
  );
}