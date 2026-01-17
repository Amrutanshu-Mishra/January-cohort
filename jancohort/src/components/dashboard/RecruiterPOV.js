"use client";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { PlusCircle, Database, Users, Briefcase, Wand2, Download, Save } from "lucide-react";
import { jsPDF } from "jspdf";

export default function RecruiterPOV() {
  const [activeView, setActiveView] = useState("overview");
  const [jobForm, setJobForm] = useState({
    title: "",
    requirements: "",
    location: "",
    type: "Full Time",
    experience: "Mid Level",
    salary: "",
    status: "Active"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Job Posted:", jobForm);
    alert("Job Posted Successfully! (Mock)");
    // Reset form or redirect logic here
  };

  const handleGenerateDescription = () => {
    // Mock AI Generation
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
    <div className="flex h-screen bg-slate-100">
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col">
        <h1 className="text-xl font-bold mb-8">Recruiter Hub</h1>
        <nav className="space-y-2 flex-1">
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
        <div className="mt-auto pt-6 border-t border-slate-700">
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        {activeView === "overview" && (
          <>
            <header className="mb-8">
              <h2 className="text-3xl font-bold">Dashboard Overview</h2>
              <p className="text-slate-500">Real-time AWS processing logs for your company.</p>
            </header>

            {/* MOCK AWS LOGS AREA */}
            <div className="bg-black text-green-400 p-6 rounded-xl font-mono text-sm overflow-hidden shadow-2xl">
              <p>[AWS DynamoDB] - Log: New Job ID 8892 registered...</p>
              <p>[AWS Lambda] - Event: Triggering skill match for Job 8892...</p>
              <p className="animate-pulse">_</p>
            </div>
          </>
        )}

        {activeView === "post-job" && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-sm">
            <header className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Create New Job Posting</h2>
              <p className="text-slate-500">Target the best talent with precise requirements.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Job Title</label>
                <input
                  required
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex justify-between items-center">
                  Job Requirements
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 font-bold"
                  >
                    <Wand2 size={12} />
                    Auto-Generate with AI
                  </button>
                </label>
                <textarea
                  required
                  rows={6}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="List key skills, technologies, and qualifications..."
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Location</label>
                  <input
                    required
                    className="w-full p-3 border border-slate-200 rounded-xl"
                    placeholder="e.g. Remote / New York, NY"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Salary (USD)</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-slate-200 rounded-xl"
                    placeholder="e.g. 120000"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Job Type</label>
                  <select
                    className="w-full p-3 border border-slate-200 rounded-xl bg-white"
                    value={jobForm.type}
                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Experience Level</label>
                  <select
                    className="w-full p-3 border border-slate-200 rounded-xl bg-white"
                    value={jobForm.experience}
                    onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Lead Level">Lead Level</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Status</label>
                <div className="flex items-center gap-4">
                  {['Active', 'Closed', 'Draft'].map((status) => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={jobForm.status === status}
                        onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-600">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Save size={20} />
                  Post Job Opportunity
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  <Download size={20} />
                  Download PDF
                </button>
              </div>
            </form>
          </div>
        )
        }
      </main >
    </div >
  );
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}