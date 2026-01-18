"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useUser } from "@clerk/nextjs";
import {
     ArrowLeft,
     CheckCircle,
     AlertTriangle,
     Clock,
     Target,
     TrendingUp,
     BookOpen,
     ExternalLink,
     Briefcase,
     Sparkles,
     ChevronRight,
     Award,
     Zap,
     Upload,
     Loader2
} from "lucide-react";
import { getUserProfile, applyToJob, uploadResumeToS3, evaluateSkillGap } from "@/lib/api";
import Loader from "@/components/ui/loader";

export default function RoadmapPage() {
     const params = useParams();
     const router = useRouter();
     const searchParams = useSearchParams();
     const { getToken } = useAuth();
     const { isLoaded, user } = useUser();

     const [loading, setLoading] = useState(true);
     const [applying, setApplying] = useState(false);
     const [applied, setApplied] = useState(false);
     const [roadmapData, setRoadmapData] = useState(null);
     const [error, setError] = useState(null);
     const [uploading, setUploading] = useState(false);
     const [reEvaluating, setReEvaluating] = useState(false);
     const [matchImproved, setMatchImproved] = useState(false);
     const roadmapRef = useRef(null);
     const fileInputRef = useRef(null);

     const jobId = params.jobId;

     useEffect(() => {
          const loadRoadmapData = async () => {
               try {
                    // Get data from URL params (passed during redirect)
                    const dataParam = searchParams.get("data");

                    if (dataParam) {
                         const data = JSON.parse(decodeURIComponent(dataParam));
                         setRoadmapData(data);
                    } else {
                         // Fallback: fetch from user profile
                         const profileRes = await getUserProfile(getToken);
                         const targetJob = profileRes.user?.targetJobs?.find(
                              (tj) => tj.jobId === jobId
                         );

                         if (targetJob && targetJob.analysisStatus === "Completed") {
                              setRoadmapData({
                                   jobTitle: targetJob.title,
                                   companyName: targetJob.company,
                                   matchPercentage: targetJob.matchPercentage,
                                   matchSummary: targetJob.matchSummary,
                                   strengths: targetJob.strengths,
                                   criticalGaps: targetJob.criticalGaps,
                                   proficiencyGaps: targetJob.proficiencyGaps,
                                   recommendedActions: targetJob.recommendedActions,
                                   timelineAssessment: targetJob.timelineAssessment,
                                   jobId: jobId
                              });
                         } else {
                              setError("Roadmap data not found. Please try applying again.");
                         }
                    }
               } catch (err) {
                    console.error("Error loading roadmap:", err);
                    setError("Failed to load roadmap data.");
               } finally {
                    setLoading(false);
               }
          };

          if (isLoaded) {
               loadRoadmapData();
          }
     }, [isLoaded, jobId, searchParams, getToken]);

     const handleApplyAnyway = async () => {
          setApplying(true);
          try {
               await applyToJob(jobId, getToken, true);
               setApplied(true);
               setTimeout(() => {
                    router.push("/dashboard");
               }, 2000);
          } catch (err) {
               console.error("Error applying:", err);
               setError(err.message);
          } finally {
               setApplying(false);
          }
     };

     // Handle resume upload after upskilling
     const handleResumeUpload = async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          // Validate file
          if (file.type !== 'application/pdf') {
               setError('Please upload a PDF file');
               return;
          }

          if (file.size > 5 * 1024 * 1024) {
               setError('File size must be less than 5MB');
               return;
          }

          setError(null);
          setUploading(true);

          try {
               // Step 1: Upload the new resume
               await uploadResumeToS3(file, getToken);

               // Step 2: Re-evaluate skill gap with new resume
               setUploading(false);
               setReEvaluating(true);

               const gapResult = await evaluateSkillGap(jobId, getToken);

               // Step 3: Update roadmap data with new results
               setRoadmapData({
                    ...roadmapData,
                    matchPercentage: gapResult.matchPercentage,
                    matchSummary: gapResult.matchSummary,
                    strengths: gapResult.strengths,
                    criticalGaps: gapResult.criticalGaps,
                    proficiencyGaps: gapResult.proficiencyGaps,
                    recommendedActions: gapResult.recommendedActions,
                    timelineAssessment: gapResult.timelineAssessment
               });

               // If no longer has significant gap, show improvement success
               if (!gapResult.hasSignificantGap) {
                    setMatchImproved(true);
                    setTimeout(() => {
                         setMatchImproved(false);
                    }, 5000);
               }

          } catch (err) {
               console.error("Error uploading resume:", err);
               setError(err.message || 'Failed to upload resume');
          } finally {
               setUploading(false);
               setReEvaluating(false);
               // Reset file input
               if (fileInputRef.current) {
                    fileInputRef.current.value = '';
               }
          }
     };

     const triggerFileUpload = () => {
          fileInputRef.current?.click();
     };

     if (!isLoaded || loading) {
          return <Loader />;
     }

     if (error) {
          return (
               <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-6">
                    <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md text-center border border-red-500/30"
                    >
                         <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                         <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
                         <p className="text-gray-300 mb-6">{error}</p>
                         <button
                              onClick={() => router.push("/dashboard")}
                              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                         >
                              Back to Dashboard
                         </button>
                    </motion.div>
               </div>
          );
     }

     if (applied) {
          return (
               <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-6">
                    <motion.div
                         initial={{ scale: 0.8, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md text-center border border-green-500/30"
                    >
                         <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring" }}
                         >
                              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
                         </motion.div>
                         <h2 className="text-2xl font-bold text-white mb-2">
                              Application Submitted!
                         </h2>
                         <p className="text-gray-300">
                              Your application for {roadmapData?.jobTitle} has been sent.
                         </p>
                         <p className="text-gray-400 text-sm mt-4">Redirecting to dashboard...</p>
                    </motion.div>
               </div>
          );
     }

     return (
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
               {/* Header */}
               <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/10">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                         <button
                              onClick={() => router.push("/dashboard")}
                              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                         >
                              <ArrowLeft className="w-5 h-5" />
                              <span>Back to Dashboard</span>
                         </button>
                         <div className="flex items-center gap-3">
                              <span className="text-sm text-green-400 flex items-center gap-2">
                                   <CheckCircle className="w-4 h-4" />
                                   Roadmap saved
                              </span>
                         </div>
                    </div>
               </div>

               <div className="max-w-6xl mx-auto px-6 py-8" ref={roadmapRef}>
                    {/* Hero Section */}
                    <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="text-center mb-12"
                    >
                         <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-full text-yellow-300 text-sm mb-6">
                              <AlertTriangle className="w-4 h-4" />
                              Skill Gap Detected
                         </div>
                         <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                              Your Personalized Roadmap
                         </h1>
                         <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                              We've analyzed your profile against the requirements for{" "}
                              <span className="text-purple-400 font-semibold">
                                   {roadmapData?.jobTitle}
                              </span>{" "}
                              at{" "}
                              <span className="text-purple-400 font-semibold">
                                   {roadmapData?.companyName}
                              </span>
                         </p>
                    </motion.div>

                    {/* Match Score */}
                    <motion.div
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: 0.1 }}
                         className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/10"
                    >
                         <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                              <div className="text-center md:text-left">
                                   <h2 className="text-xl font-semibold text-white mb-2">
                                        Current Match Score
                                   </h2>
                                   <p className="text-gray-400">{roadmapData?.matchSummary}</p>
                              </div>
                              <div className="relative">
                                   <svg className="w-32 h-32 transform -rotate-90">
                                        <circle
                                             cx="64"
                                             cy="64"
                                             r="56"
                                             stroke="rgba(255,255,255,0.1)"
                                             strokeWidth="12"
                                             fill="none"
                                        />
                                        <motion.circle
                                             cx="64"
                                             cy="64"
                                             r="56"
                                             stroke="url(#gradient)"
                                             strokeWidth="12"
                                             fill="none"
                                             strokeLinecap="round"
                                             strokeDasharray={`${(roadmapData?.matchPercentage || 0) * 3.52} 352`}
                                             initial={{ strokeDasharray: "0 352" }}
                                             animate={{ strokeDasharray: `${(roadmapData?.matchPercentage || 0) * 3.52} 352` }}
                                             transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                        <defs>
                                             <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                  <stop offset="0%" stopColor="#a855f7" />
                                                  <stop offset="100%" stopColor="#ec4899" />
                                             </linearGradient>
                                        </defs>
                                   </svg>
                                   <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-white">
                                             {roadmapData?.matchPercentage || 0}%
                                        </span>
                                   </div>
                              </div>
                         </div>
                    </motion.div>

                    {/* Match Improved Success Banner */}
                    <AnimatePresence>
                         {matchImproved && (
                              <motion.div
                                   initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                   animate={{ opacity: 1, y: 0, scale: 1 }}
                                   exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                   className="mb-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-3xl p-6 border border-green-500/30"
                              >
                                   <div className="flex items-center gap-4">
                                        <div className="p-3 bg-green-500/30 rounded-full">
                                             <CheckCircle className="w-8 h-8 text-green-400" />
                                        </div>
                                        <div className="flex-1">
                                             <h3 className="text-xl font-bold text-green-300 mb-1">
                                                  🎉 Great Progress! Your Match Has Improved!
                                             </h3>
                                             <p className="text-gray-300">
                                                  Your new resume shows a {roadmapData?.matchPercentage}% match.
                                                  You're now above the threshold - feel confident to apply!
                                             </p>
                                        </div>
                                        <button
                                             onClick={handleApplyAnyway}
                                             disabled={applying}
                                             className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                                        >
                                             <Sparkles className="w-5 h-5" />
                                             Apply Now
                                        </button>
                                   </div>
                              </motion.div>
                         )}
                    </AnimatePresence>

                    {/* Strengths */}
                    {roadmapData?.strengths?.length > 0 && (
                         <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="mb-8"
                         >
                              <div className="flex items-center gap-3 mb-4">
                                   <div className="p-2 bg-green-500/20 rounded-xl">
                                        <Award className="w-6 h-6 text-green-400" />
                                   </div>
                                   <h2 className="text-2xl font-bold text-white">Your Strengths</h2>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4">
                                   {roadmapData.strengths.map((strength, index) => (
                                        <motion.div
                                             key={index}
                                             initial={{ opacity: 0, x: -20 }}
                                             animate={{ opacity: 1, x: 0 }}
                                             transition={{ delay: 0.3 + index * 0.1 }}
                                             className="bg-green-500/10 backdrop-blur-xl rounded-2xl p-5 border border-green-500/20"
                                        >
                                             <h3 className="text-lg font-semibold text-green-300 mb-2">
                                                  {strength.skill}
                                             </h3>
                                             <p className="text-gray-300 text-sm mb-2">{strength.evidence}</p>
                                             <p className="text-green-400/70 text-xs italic">
                                                  {strength.relevance}
                                             </p>
                                        </motion.div>
                                   ))}
                              </div>
                         </motion.div>
                    )}

                    {/* Critical Gaps */}
                    {roadmapData?.criticalGaps?.length > 0 && (
                         <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="mb-8"
                         >
                              <div className="flex items-center gap-3 mb-4">
                                   <div className="p-2 bg-red-500/20 rounded-xl">
                                        <AlertTriangle className="w-6 h-6 text-red-400" />
                                   </div>
                                   <h2 className="text-2xl font-bold text-white">Critical Skill Gaps</h2>
                              </div>
                              <div className="space-y-4">
                                   {roadmapData.criticalGaps.map((gap, index) => (
                                        <motion.div
                                             key={index}
                                             initial={{ opacity: 0, x: -20 }}
                                             animate={{ opacity: 1, x: 0 }}
                                             transition={{ delay: 0.4 + index * 0.1 }}
                                             className="bg-red-500/10 backdrop-blur-xl rounded-2xl p-5 border border-red-500/20"
                                        >
                                             <div className="flex items-start justify-between mb-3">
                                                  <h3 className="text-lg font-semibold text-red-300">
                                                       {gap.requirement}
                                                  </h3>
                                                  <span
                                                       className={`px-3 py-1 rounded-full text-xs font-medium ${gap.priority === "Critical"
                                                            ? "bg-red-500/30 text-red-300"
                                                            : gap.priority === "High"
                                                                 ? "bg-orange-500/30 text-orange-300"
                                                                 : "bg-yellow-500/30 text-yellow-300"
                                                            }`}
                                                  >
                                                       {gap.priority}
                                                  </span>
                                             </div>
                                             <p className="text-gray-300 text-sm mb-2">{gap.impact}</p>
                                             <div className="flex items-center gap-2 text-xs text-gray-400">
                                                  <Clock className="w-3 h-3" />
                                                  <span>Difficulty: {gap.difficulty}</span>
                                             </div>
                                        </motion.div>
                                   ))}
                              </div>
                         </motion.div>
                    )}

                    {/* Recommended Actions */}
                    {roadmapData?.recommendedActions?.length > 0 && (
                         <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              className="mb-8"
                         >
                              <div className="flex items-center gap-3 mb-4">
                                   <div className="p-2 bg-purple-500/20 rounded-xl">
                                        <Target className="w-6 h-6 text-purple-400" />
                                   </div>
                                   <h2 className="text-2xl font-bold text-white">
                                        Recommended Learning Path
                                   </h2>
                              </div>
                              <div className="space-y-4">
                                   {roadmapData.recommendedActions
                                        .sort((a, b) => a.priority - b.priority)
                                        .map((action, index) => (
                                             <motion.div
                                                  key={index}
                                                  initial={{ opacity: 0, y: 20 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  transition={{ delay: 0.5 + index * 0.1 }}
                                                  className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20"
                                             >
                                                  <div className="flex items-start gap-4">
                                                       <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold">
                                                            {action.priority}
                                                       </div>
                                                       <div className="flex-1">
                                                            <h3 className="text-lg font-semibold text-white mb-2">
                                                                 {action.action}
                                                            </h3>
                                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-3">
                                                                 <span className="flex items-center gap-1">
                                                                      <Zap className="w-4 h-4 text-purple-400" />
                                                                      {action.skill}
                                                                 </span>
                                                                 <span className="flex items-center gap-1">
                                                                      <Clock className="w-4 h-4 text-purple-400" />
                                                                      {action.estimatedTime}
                                                                 </span>
                                                            </div>
                                                            {action.resources?.length > 0 && (
                                                                 <div className="mt-3 pt-3 border-t border-white/10">
                                                                      <p className="text-xs text-gray-500 mb-2">
                                                                           Recommended Resources:
                                                                      </p>
                                                                      <div className="flex flex-wrap gap-2">
                                                                           {action.resources.map((resource, rIndex) => (
                                                                                <span
                                                                                     key={rIndex}
                                                                                     className="inline-flex items-center gap-1 px-3 py-1 bg-white/5 rounded-lg text-xs text-gray-300"
                                                                                >
                                                                                     <BookOpen className="w-3 h-3" />
                                                                                     {resource}
                                                                                </span>
                                                                           ))}
                                                                      </div>
                                                                 </div>
                                                            )}
                                                       </div>
                                                  </div>
                                             </motion.div>
                                        ))}
                              </div>
                         </motion.div>
                    )}

                    {/* Timeline Assessment */}
                    {roadmapData?.timelineAssessment && (
                         <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 }}
                              className="mb-8"
                         >
                              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-3xl p-8 border border-blue-500/20">
                                   <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-blue-500/20 rounded-xl">
                                             <TrendingUp className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white">
                                             Timeline Assessment
                                        </h2>
                                   </div>
                                   <div className="grid md:grid-cols-3 gap-6">
                                        <div className="text-center">
                                             <p className="text-gray-400 text-sm mb-2">
                                                  Estimated Time to Ready
                                             </p>
                                             <p className="text-2xl font-bold text-blue-300">
                                                  {roadmapData.timelineAssessment.estimatedTimeToReady}
                                             </p>
                                        </div>
                                        <div className="text-center">
                                             <p className="text-gray-400 text-sm mb-2">Confidence Level</p>
                                             <p
                                                  className={`text-2xl font-bold ${roadmapData.timelineAssessment.confidence === "High"
                                                       ? "text-green-300"
                                                       : roadmapData.timelineAssessment.confidence === "Medium"
                                                            ? "text-yellow-300"
                                                            : "text-red-300"
                                                       }`}
                                             >
                                                  {roadmapData.timelineAssessment.confidence}
                                             </p>
                                        </div>
                                        <div className="text-center md:text-left md:col-span-1">
                                             <p className="text-gray-400 text-sm mb-2">Assumptions</p>
                                             <p className="text-gray-300 text-sm">
                                                  {roadmapData.timelineAssessment.assumptions}
                                             </p>
                                        </div>
                                   </div>
                              </div>
                         </motion.div>
                    )}

                    {/* Action Buttons */}
                    <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 0.6 }}
                         className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
                    >
                         <h2 className="text-xl font-semibold text-white mb-4 text-center">
                              What would you like to do?
                         </h2>
                         <p className="text-gray-400 text-center mb-6">
                              Upload your updated resume after upskilling to see your new match score,
                              or apply now and show your potential.
                         </p>

                         {/* Hidden file input */}
                         <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleResumeUpload}
                              accept=".pdf"
                              className="hidden"
                         />

                         <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                              <button
                                   onClick={triggerFileUpload}
                                   disabled={uploading || reEvaluating}
                                   className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 rounded-xl text-white font-medium transition-opacity disabled:opacity-50"
                              >
                                   {uploading ? (
                                        <>
                                             <Loader2 className="w-5 h-5 animate-spin" />
                                             Uploading Resume...
                                        </>
                                   ) : reEvaluating ? (
                                        <>
                                             <Loader2 className="w-5 h-5 animate-spin" />
                                             Re-analyzing Skills...
                                        </>
                                   ) : (
                                        <>
                                             <Upload className="w-5 h-5" />
                                             Upload Resume After Upskilling
                                        </>
                                   )}
                              </button>
                              <button
                                   onClick={handleApplyAnyway}
                                   disabled={applying || uploading || reEvaluating}
                                   className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 rounded-xl text-white font-medium transition-opacity disabled:opacity-50"
                              >
                                   {applying ? (
                                        <>
                                             <Loader2 className="w-5 h-5 animate-spin" />
                                             Applying...
                                        </>
                                   ) : (
                                        <>
                                             <Sparkles className="w-5 h-5" />
                                             Apply Anyway
                                             <ChevronRight className="w-5 h-5" />
                                        </>
                                   )}
                              </button>
                         </div>

                         {/* Error message */}
                         {error && (
                              <p className="text-red-400 text-center mt-4 text-sm">{error}</p>
                         )}
                    </motion.div>
               </div>
          </div>
     );
}
