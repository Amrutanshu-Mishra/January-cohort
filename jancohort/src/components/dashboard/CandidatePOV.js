"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import {
  Briefcase,
  Target,
  BookOpen,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  Sparkles,
  Zap,
  Clock,
  ChevronRight,
  X,
  Play,
  Award,
  AlertTriangle
} from "lucide-react";
import {
  getUserProfile,
  getJobs,
  uploadResumeToS3,
  applyToJob,
  analyzeResume,
  getResumeAnalysis
} from "@/lib/api";

export default function CandidatePOV() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('jobs');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Application state
  const [applyingTo, setApplyingTo] = useState(null);
  const [applySuccess, setApplySuccess] = useState(null);
  const [applyError, setApplyError] = useState(null);

  // Analysis state
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);

  // Fetch user profile and jobs on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, jobsRes] = await Promise.all([
          getUserProfile(getToken),
          getJobs(getToken).catch(() => ({ jobs: [] }))
        ]);
        setProfile(profileRes.user);
        setJobs(jobsRes.jobs || []);

        // If user has resume analysis, load it
        if (profileRes.user?.resumeAnalysis?.analyzedAt) {
          setResumeAnalysis(profileRes.user.resumeAnalysis);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [getToken]);

  // Handle resume upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF file');
      setUploadStatus('error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    setUploadError(null);

    try {
      await uploadResumeToS3(file, getToken);
      const profileRes = await getUserProfile(getToken);
      setProfile(profileRes.user);
      setUploadStatus('success');
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (error) {
      console.error("Error uploading resume:", error);
      setUploadError(error.message || 'Failed to upload resume');
      setUploadStatus('error');
    }
  };

  // Handle job application
  const handleApply = async (jobId, jobTitle) => {
    setApplyingTo(jobId);
    setApplyError(null);

    try {
      await applyToJob(jobId, getToken);
      setApplySuccess({ jobId, jobTitle });

      // Refresh profile to get updated target jobs
      const profileRes = await getUserProfile(getToken);
      setProfile(profileRes.user);

      setTimeout(() => setApplySuccess(null), 3000);
    } catch (error) {
      console.error("Error applying to job:", error);
      setApplyError({ jobId, message: error.message });
    } finally {
      setApplyingTo(null);
    }
  };

  // Handle resume analysis
  const handleAnalyzeResume = async () => {
    if (!profile?.resume) {
      setApplyError({ message: 'Please upload your resume first' });
      return;
    }

    setAnalysisLoading(true);

    try {
      const result = await analyzeResume(getToken);
      setResumeAnalysis(result.analysis);

      // Refresh profile
      const profileRes = await getUserProfile(getToken);
      setProfile(profileRes.user);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setApplyError({ message: error.message || 'Failed to analyze resume' });
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Check if user has applied to a job
  const hasApplied = (jobId) => {
    return profile?.targetJobs?.some(tj => tj.jobId === jobId);
  };

  // Job matches with real data
  const jobMatches = jobs.map((job) => ({
    id: job._id,
    role: job.title,
    company: job.companyName || job.companyId?.companyName || 'Unknown Company',
    match: Math.floor(Math.random() * 30) + 70, // Placeholder
    location: job.location || 'Remote',
    type: job.type || 'Full-time',
    requirements: job.requirements || [],
    applied: hasApplied(job._id)
  }));

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Loader2 className="w-8 h-8 text-orange-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Success Toast */}
      <AnimatePresence>
        {applySuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 bg-green-500/20 border border-green-500/30 rounded-xl p-4 flex items-center gap-3 backdrop-blur-xl z-50"
          >
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400">Applied to {applySuccess.jobTitle}!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-72 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-white">Pro-Guide</h1>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem icon={<Briefcase size={20} />} label="Job Feed" active={activeNav === 'jobs'} onClick={() => setActiveNav('jobs')} />
          <NavItem icon={<Target size={20} />} label="Skill Analysis" active={activeNav === 'skills'} onClick={() => setActiveNav('skills')} />
          <NavItem icon={<BookOpen size={20} />} label="My Applications" active={activeNav === 'applications'} onClick={() => setActiveNav('applications')} />
        </nav>

        {/* Resume Upload Section */}
        <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-white">Resume</span>
          </div>

          {profile?.resume ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Resume uploaded</span>
              </div>
              <label className="cursor-pointer text-xs text-slate-400 hover:text-orange-400 transition-colors">
                <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                Change resume
              </label>
            </div>
          ) : (
            <label className="cursor-pointer group">
              <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
              <div className="flex items-center gap-2 text-slate-400 group-hover:text-orange-400 transition-colors">
                {uploadStatus === 'uploading' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs">Uploading...</span></>
                ) : (
                  <><Upload className="w-4 h-4" /><span className="text-xs">Upload resume</span></>
                )}
              </div>
            </label>
          )}

          {uploadStatus === 'success' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex items-center gap-1 text-green-400 text-xs">
              <CheckCircle className="w-3 h-3" />Uploaded!
            </motion.div>
          )}

          {uploadStatus === 'error' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex items-center gap-1 text-red-400 text-xs">
              <AlertCircle className="w-3 h-3" />{uploadError}
            </motion.div>
          )}
        </div>

        {/* User Profile */}
        <div className="pt-6 border-t border-white/10 flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">{user?.firstName || profile?.fullName}</span>
            <span className="text-xs text-orange-400 uppercase tracking-wider font-medium">Candidate</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* Jobs Tab */}
        {activeNav === 'jobs' && (
          <>
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Recommended for You</h2>
              <p className="text-slate-400">
                {profile?.resume ? "Based on your resume and skill profile." : "Upload your resume to get personalized matches."}
              </p>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <StatCard icon={<Briefcase className="w-5 h-5" />} label="Total Jobs" value={jobMatches.length} color="orange" />
              <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Avg Match" value={jobMatches.length > 0 ? `${Math.round(jobMatches.reduce((a, b) => a + b.match, 0) / jobMatches.length)}%` : '0%'} color="green" />
              <StatCard icon={<Target className="w-5 h-5" />} label="Applications" value={profile?.targetJobs?.length || 0} color="blue" />
            </div>

            {/* Job Cards */}
            <div className="grid grid-cols-1 gap-4">
              {jobMatches.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                  <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No jobs available</h3>
                  <p className="text-slate-400">Check back later for new opportunities</p>
                </div>
              ) : (
                jobMatches.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 flex items-center justify-between hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center">
                        <Briefcase size={24} className="text-slate-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{job.role}</h3>
                        <p className="text-slate-400">{job.company}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-slate-500">{job.location}</span>
                          <span className="text-xs text-slate-600">•</span>
                          <span className="text-xs text-slate-500">{job.type}</span>
                        </div>
                        {job.requirements.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {job.requirements.slice(0, 3).map((req, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs rounded">
                                {req}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-2xl font-black ${job.match >= 80 ? 'text-green-400' : 'text-orange-400'}`}>
                        {job.match}%
                      </div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Match Score</p>

                      {job.applied ? (
                        <div className="mt-3 px-4 py-2 bg-green-500/20 text-green-400 text-sm rounded-lg font-medium flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Applied
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleApply(job.id, job.role)}
                          disabled={applyingTo === job.id}
                          className="mt-3 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2"
                        >
                          {applyingTo === job.id ? (
                            <><Loader2 className="w-4 h-4 animate-spin" />Applying...</>
                          ) : (
                            <>Apply Now<ChevronRight className="w-4 h-4" /></>
                          )}
                        </motion.button>
                      )}

                      {applyError?.jobId === job.id && (
                        <p className="text-xs text-red-400 mt-2">{applyError.message}</p>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}

        {/* Skills Tab */}
        {activeNav === 'skills' && (
          <>
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Skill Analysis</h2>
              <p className="text-slate-400">AI-powered analysis of your resume and skills</p>
            </header>

            {!profile?.resume ? (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                <Upload className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Upload Your Resume</h3>
                <p className="text-slate-400 mb-6">Upload your resume to get AI-powered skill analysis</p>
                <label className="cursor-pointer">
                  <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                  <span className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium inline-flex items-center gap-2 hover:from-orange-600 hover:to-orange-700 transition-all">
                    <Upload className="w-5 h-5" />Upload Resume
                  </span>
                </label>
              </div>
            ) : !resumeAnalysis ? (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Analyze Your Skills</h3>
                <p className="text-slate-400 mb-6">Get AI-powered insights on your strengths and areas for improvement</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAnalyzeResume}
                  disabled={analysisLoading}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium inline-flex items-center gap-2 hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50"
                >
                  {analysisLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</>
                  ) : (
                    <><Play className="w-5 h-5" />Start Analysis</>
                  )}
                </motion.button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overall Assessment */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-orange-400" />
                    Overall Assessment
                  </h3>
                  {resumeAnalysis.overallAssessment && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">Career Level:</span>
                        <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg font-medium">
                          {resumeAnalysis.overallAssessment.careerLevel || 'Not specified'}
                        </span>
                      </div>

                      {resumeAnalysis.overallAssessment.strengths?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-2">Strengths</h4>
                          <div className="flex flex-wrap gap-2">
                            {resumeAnalysis.overallAssessment.strengths.map((s, i) => (
                              <span key={i} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {resumeAnalysis.overallAssessment.weaknesses?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-2">Areas for Improvement</h4>
                          <div className="flex flex-wrap gap-2">
                            {resumeAnalysis.overallAssessment.weaknesses.map((w, i) => (
                              <span key={i} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                                {w}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Skills Review */}
                {resumeAnalysis.skillsReview && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strong Skills */}
                    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        Strong Skills
                      </h3>
                      <div className="space-y-3">
                        {resumeAnalysis.skillsReview.strong?.length > 0 ? (
                          resumeAnalysis.skillsReview.strong.map((skill, i) => (
                            <div key={i} className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                              <p className="font-medium text-green-400">{skill.skill}</p>
                              {skill.evidence && <p className="text-xs text-slate-400 mt-1">{skill.evidence}</p>}
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 text-sm">No data available</p>
                        )}
                      </div>
                    </div>

                    {/* Skills to Improve */}
                    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        Skills to Improve
                      </h3>
                      <div className="space-y-3">
                        {resumeAnalysis.skillsReview.toImprove?.length > 0 ? (
                          resumeAnalysis.skillsReview.toImprove.map((skill, i) => (
                            <div key={i} className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                              <p className="font-medium text-yellow-400">{skill.skill}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs">
                                <span className="text-slate-500">Current: {skill.current}</span>
                                <ChevronRight className="w-3 h-3 text-slate-600" />
                                <span className="text-orange-400">Target: {skill.target}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 text-sm">No data available</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {resumeAnalysis.overallAssessment?.recommendations?.length > 0 && (
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-400" />
                      Recommendations
                    </h3>
                    <div className="space-y-2">
                      {resumeAnalysis.overallAssessment.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                          <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-blue-400">{i + 1}</span>
                          </div>
                          <p className="text-slate-300 text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Re-analyze Button */}
                <div className="text-center pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAnalyzeResume}
                    disabled={analysisLoading}
                    className="px-6 py-3 border border-white/10 text-white rounded-xl font-medium inline-flex items-center gap-2 hover:bg-white/5 transition-all disabled:opacity-50"
                  >
                    {analysisLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" />Re-analyzing...</>
                    ) : (
                      <><Play className="w-5 h-5" />Re-analyze Resume</>
                    )}
                  </motion.button>
                  {resumeAnalysis.analyzedAt && (
                    <p className="text-xs text-slate-500 mt-2">
                      Last analyzed: {new Date(resumeAnalysis.analyzedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Applications Tab */}
        {activeNav === 'applications' && (
          <>
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">My Applications</h2>
              <p className="text-slate-400">Track your job applications</p>
            </header>

            {(!profile?.targetJobs || profile.targetJobs.length === 0) ? (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No applications yet</h3>
                <p className="text-slate-400 mb-6">Start applying to jobs to track them here</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveNav('jobs')}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium inline-flex items-center gap-2"
                >
                  Browse Jobs
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.targetJobs.map((job, index) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">{job.title}</h3>
                        <p className="text-slate-400">{job.company || 'Company'}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${job.analysisStatus === 'Completed'
                            ? 'bg-green-500/20 text-green-400'
                            : job.analysisStatus === 'Failed'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                          {job.analysisStatus}
                        </span>
                        {job.matchPercentage && (
                          <p className="mt-2 text-2xl font-bold text-orange-400">{job.matchPercentage}%</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active
          ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 text-orange-400 border border-orange-500/20'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </motion.div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/20 text-orange-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/20 text-green-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-r ${colors[color]} border backdrop-blur-sm`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}