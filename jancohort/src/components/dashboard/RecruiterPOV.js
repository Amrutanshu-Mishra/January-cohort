"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import {
  Briefcase,
  Plus,
  Users,
  Building2,
  BarChart2,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Mail,
  ExternalLink,
  FileText,
  Clock,
  UserCheck,
  UserX,
  Star,
  TrendingUp,
  Filter,
  ChevronDown,
  Github,
  Linkedin,
  Globe,
  Sparkles
} from "lucide-react";
import {
  getCompanyProfile,
  getJobs,
  createJob,
  deleteJob,
  getCompanyStats,
  getAllCompanyApplicants,
  updateApplicantStatus,
  generateJobDescription
} from "@/lib/api";

export default function RecruiterPOV() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [showJobModal, setShowJobModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  // New job form state
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary: '',
    type: 'Full-time'
  });

  // Fetch all data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [companyRes, jobsRes, statsRes, applicantsRes] = await Promise.all([
          getCompanyProfile(getToken),
          getJobs(getToken).catch(() => ({ jobs: [] })),
          getCompanyStats(getToken).catch(() => null),
          getAllCompanyApplicants(getToken).catch(() => ({ applicants: [] }))
        ]);

        setCompany(companyRes.company);

        // Filter jobs to only show company's jobs
        const companyJobs = jobsRes.jobs?.filter(
          job => job.companyId?._id === companyRes.company._id ||
            job.companyId === companyRes.company._id
        ) || [];
        setJobs(companyJobs);

        if (statsRes) setStats(statsRes);
        if (applicantsRes) setApplicants(applicantsRes.applicants || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [getToken]);

  // Handle AI Job Description Generation
  const handleGenerateDescription = async () => {
    if (!aiPrompt.trim()) {
      setError('Please enter a prompt for AI generation');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateJobDescription(aiPrompt, getToken);
      const data = result.data;

      setNewJob(prev => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        requirements: data.requirements ? data.requirements.join(', ') : prev.requirements,
        location: data.location || prev.location,
        salary: data.salary || prev.salary,
        type: data.type || prev.type,
      }));

      setSuccess('Job description generated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error generating description:", err);
      setError(err.message || 'Failed to generate description');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle job creation with AWS email notification
  const handleCreateJob = async () => {
    if (!newJob.title.trim() || !newJob.description.trim()) {
      setError('Title and description are required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const jobData = {
        ...newJob,
        requirements: newJob.requirements.split(',').map(r => r.trim()).filter(Boolean),
        companyId: company._id,
        companyName: company.companyName
      };

      // --- PARALLEL EXECUTION START ---
      // We fire both at once. 
      // We await createJob for the UI, but we let the AWS fetch run independently.
      const [result] = await Promise.all([
        createJob(jobData, getToken), // 1. Save to MongoDB
        fetch('https://klfcmxndj6.execute-api.ap-south-1.amazonaws.com/job-posted', { // 2. Trigger AWS Pipeline
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors', // Explicitly handle CORS
          body: JSON.stringify({
            title: jobData.title,
            skills: jobData.requirements, // This goes to your Lambda matching logic
            companyName: jobData.companyName
          })
        }).catch(awsErr => console.error("AWS Sync failed independently:", awsErr))
      ]);
      // --- PARALLEL EXECUTION END ---

      setJobs([result.job, ...jobs]);
      setSuccess('Job posted and matching emails are being sent!');
      setShowJobModal(false);
      setNewJob({ title: '', description: '', requirements: '', location: '', salary: '', type: 'Full-time' });

      // Refresh stats
      const statsRes = await getCompanyStats(getToken);
      if (statsRes) setStats(statsRes);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error creating job:", err);
      setError(err.message || 'Failed to create job');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (jobId, applicationId, newStatus) => {
    try {
      await updateApplicantStatus(jobId, applicationId, newStatus, getToken);

      // Update local state
      setApplicants(prev => prev.map(app =>
        app.applicationId === applicationId
          ? { ...app, status: newStatus }
          : app
      ));

      setSuccess(`Status updated to ${newStatus}`);
      setTimeout(() => setSuccess(null), 2000);
    } catch (error) {
      console.error("Error updating status:", error);
      setError(error.message);
    }
  };

  // Handle job deletion
  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      await deleteJob(jobId, getToken);
      setJobs(jobs.filter(j => j._id !== jobId));
      setSuccess('Job deleted successfully');
      setTimeout(() => setSuccess(null), 2000);
    } catch (error) {
      console.error("Error deleting job:", error);
      setError(error.message);
    }
  };

  // Filter applicants
  const filteredApplicants = statusFilter === 'all'
    ? applicants
    : applicants.filter(app => app.status === statusFilter);

  // Status colors
  const statusColors = {
    Applied: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Reviewed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Shortlisted: 'bg-green-500/20 text-green-400 border-green-500/30',
    Rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    Hired: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Loader2 className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Success/Error Toasts */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 bg-green-500/20 border border-green-500/30 rounded-xl p-4 flex items-center gap-3 backdrop-blur-xl z-50"
          >
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400">{success}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 backdrop-blur-xl z-50"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-72 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Recruiter Hub</h1>
            <p className="text-xs text-slate-400">{company?.companyName}</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem icon={<BarChart2 size={20} />} label="Dashboard" active={activeNav === 'dashboard'} onClick={() => setActiveNav('dashboard')} />
          <NavItem icon={<Briefcase size={20} />} label="Job Postings" active={activeNav === 'jobs'} onClick={() => setActiveNav('jobs')} badge={jobs.length} />
          <NavItem icon={<Users size={20} />} label="Candidates" active={activeNav === 'candidates'} onClick={() => setActiveNav('candidates')} badge={applicants.length} />
        </nav>

        {/* Company Info */}
        <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Company</span>
          </div>
          <p className="text-xs text-slate-400">{company?.industry || 'Technology'}</p>
          <p className="text-xs text-slate-400 mt-1">{company?.size || 'Startup'} company</p>
        </div>

        {/* User Profile */}
        <div className="pt-6 border-t border-white/10 flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">{user?.firstName || 'Recruiter'}</span>
            <span className="text-xs text-blue-400 uppercase tracking-wider font-medium">Recruiter</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">

        {/* Dashboard Tab */}
        {activeNav === 'dashboard' && (
          <>
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
              <p className="text-slate-400">Welcome back! Here's what's happening with your jobs.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={<Briefcase className="w-5 h-5" />}
                label="Active Jobs"
                value={stats?.activeJobs || jobs.length}
                color="blue"
              />
              <StatCard
                icon={<Users className="w-5 h-5" />}
                label="Total Applicants"
                value={stats?.totalApplicants || applicants.length}
                color="green"
              />
              <StatCard
                icon={<Clock className="w-5 h-5" />}
                label="New This Week"
                value={stats?.recentApplicants || 0}
                color="orange"
              />
              <StatCard
                icon={<Eye className="w-5 h-5" />}
                label="Total Views"
                value={stats?.totalViews || 0}
                color="purple"
              />
            </div>

            {/* Status Breakdown */}
            {stats?.statusBreakdown && (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
                <h3 className="text-lg font-bold text-white mb-4">Application Status Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                    <div key={status} className={`p-4 rounded-xl border ${statusColors[status]}`}>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs opacity-80">{status}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Jobs */}
            {stats?.jobsWithMostApplicants?.length > 0 && (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Top Performing Jobs
                </h3>
                <div className="space-y-3">
                  {stats.jobsWithMostApplicants.map((job, i) => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="text-white font-medium">{job.title}</span>
                      </div>
                      <span className="text-slate-400">{job.applicants} applicants</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8 flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowJobModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-500/30"
              >
                <Plus className="w-5 h-5" />
                Post New Job
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveNav('candidates')}
                className="px-6 py-3 border border-white/10 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-white/5"
              >
                <Users className="w-5 h-5" />
                View All Candidates
              </motion.button>
            </div>
          </>
        )}

        {/* Jobs Tab */}
        {activeNav === 'jobs' && (
          <>
            <header className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Job Postings</h2>
                <p className="text-slate-400">Manage your open positions</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowJobModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-500/30"
              >
                <Plus className="w-5 h-5" />
                Post New Job
              </motion.button>
            </header>

            {jobs.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No jobs posted yet</h3>
                <p className="text-slate-400 mb-6">Post your first job to start receiving applications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job, index) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                          <Briefcase className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{job.title}</h3>
                          <p className="text-slate-400 text-sm mt-1">{job.location || 'Remote'} • {job.type || 'Full-time'}</p>
                          {job.requirements?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {job.requirements.slice(0, 4).map((req, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs rounded">
                                  {req}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${job.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                          }`}>
                          {job.status || 'Active'}
                        </span>
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">{job.applicants?.length || 0} applicants</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">{job.views || 0} views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Candidates Tab */}
        {activeNav === 'candidates' && (
          <>
            <header className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Candidates</h2>
                  <p className="text-slate-400">{filteredApplicants.length} applicants across all jobs</p>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="all" className="bg-slate-800">All Status</option>
                    <option value="Applied" className="bg-slate-800">Applied</option>
                    <option value="Reviewed" className="bg-slate-800">Reviewed</option>
                    <option value="Shortlisted" className="bg-slate-800">Shortlisted</option>
                    <option value="Rejected" className="bg-slate-800">Rejected</option>
                    <option value="Hired" className="bg-slate-800">Hired</option>
                  </select>
                </div>
              </div>
            </header>

            {filteredApplicants.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No candidates yet</h3>
                <p className="text-slate-400">Candidates will appear here when they apply to your jobs</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplicants.map((applicant, index) => (
                  <motion.div
                    key={applicant.applicationId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                          {applicant.user?.fullName?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-white">{applicant.user?.fullName || 'Unknown'}</h3>
                            {applicant.user?.experienceLevel && (
                              <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                                {applicant.user.experienceLevel}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-sm">{applicant.user?.email}</p>

                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-blue-400 flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              Applied for: {applicant.job?.title}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(applicant.appliedAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Skills */}
                          {applicant.user?.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {applicant.user.skills.slice(0, 5).map((skill, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20">
                                  {skill}
                                </span>
                              ))}
                              {applicant.user.skills.length > 5 && (
                                <span className="text-xs text-slate-500">+{applicant.user.skills.length - 5} more</span>
                              )}
                            </div>
                          )}

                          {/* Strengths from AI Analysis */}
                          {applicant.user?.strengths?.length > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              <Star className="w-3 h-3 text-yellow-400" />
                              <span className="text-xs text-slate-400">
                                {applicant.user.strengths.slice(0, 2).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        {/* Status Badge & Dropdown */}
                        <select
                          value={applicant.status}
                          onChange={(e) => handleStatusUpdate(applicant.job?.id, applicant.applicationId, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border cursor-pointer ${statusColors[applicant.status]} bg-transparent focus:outline-none`}
                        >
                          <option value="Applied" className="bg-slate-800 text-white">Applied</option>
                          <option value="Reviewed" className="bg-slate-800 text-white">Reviewed</option>
                          <option value="Shortlisted" className="bg-slate-800 text-white">Shortlisted</option>
                          <option value="Rejected" className="bg-slate-800 text-white">Rejected</option>
                          <option value="Hired" className="bg-slate-800 text-white">Hired</option>
                        </select>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {applicant.user?.resume && (
                            <a
                              href={applicant.user.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-blue-400"
                              title="View Resume"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          )}
                          {applicant.user?.linkedinProfile && (
                            <a
                              href={applicant.user.linkedinProfile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-blue-400"
                              title="LinkedIn"
                            >
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                          {applicant.user?.githubProfile && (
                            <a
                              href={applicant.user.githubProfile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                              title="GitHub"
                            >
                              <Github className="w-4 h-4" />
                            </a>
                          )}
                          {applicant.user?.portfolio && (
                            <a
                              href={applicant.user.portfolio}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-green-400"
                              title="Portfolio"
                            >
                              <Globe className="w-4 h-4" />
                            </a>
                          )}
                          <a
                            href={`mailto:${applicant.user?.email}`}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-orange-400"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Job Modal */}
      <AnimatePresence>
        {showJobModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowJobModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Post a New Job</h2>
                <button onClick={() => setShowJobModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-bold text-blue-400">AI Assistant</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Senior React Developer for a fintech startup in NYC..."
                    className="flex-1 px-4 py-2 bg-slate-900/50 border border-blue-500/20 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                  <button
                    onClick={handleGenerateDescription}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Job Title <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    placeholder="e.g. Senior Frontend Developer"
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Description <span className="text-red-400">*</span></label>
                  <textarea
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    placeholder="Describe the role and responsibilities..."
                    rows={4}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Requirements</label>
                  <input
                    type="text"
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                    placeholder="React, Node.js, TypeScript (comma separated)"
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Location</label>
                    <input
                      type="text"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      placeholder="e.g. Remote, NYC"
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Job Type</label>
                    <select
                      value={newJob.type}
                      onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="Full-time" className="bg-slate-800">Full-time</option>
                      <option value="Part-time" className="bg-slate-800">Part-time</option>
                      <option value="Contract" className="bg-slate-800">Contract</option>
                      <option value="Internship" className="bg-slate-800">Internship</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Salary Range</label>
                  <input
                    type="text"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    placeholder="e.g. $80,000 - $120,000"
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowJobModal(false)}
                  className="flex-1 py-3 px-6 border border-white/10 text-white rounded-xl font-medium hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleCreateJob}
                  disabled={submitting}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 className="w-5 h-5 animate-spin" />Posting...</> : <><CheckCircle className="w-5 h-5" />Post Job</>}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick, badge }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${active
        ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/10 text-blue-400 border border-blue-500/20'
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
          {badge}
        </span>
      )}
    </motion.div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/20 text-green-400',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/20 text-orange-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400',
  };

  return (
    <div className={`p-5 rounded-xl bg-gradient-to-r ${colors[color]} border backdrop-blur-sm`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}