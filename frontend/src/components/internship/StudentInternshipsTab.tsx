import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  ExternalLink,
  Code2,
  Globe,
  Send,
  Loader2,
  Award,
  Video,
  FileCheck,
  ChevronRight,
  Sparkles,
  Copy,
  Check,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  internshipService,
  type InternshipApplication,
  type InternshipEnrollment,
  type InternshipCertificate,
} from '@/services/internshipService';

export const StudentInternshipsTab: React.FC = () => {
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [enrollments, setEnrollments] = useState<InternshipEnrollment[]>([]);
  const [certificates, setCertificates] = useState<InternshipCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'applications' | 'enrollments' | 'certificates'>('applications');

  // Task submission form state
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Withdrawal state
  const [withdrawingApp, setWithdrawingApp] = useState<InternshipApplication | null>(null);
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apps, enrs, certs] = await Promise.all([
        internshipService.getMyApplications().catch(() => []),
        internshipService.getMyEnrollments().catch(() => []),
        internshipService.getMyCertificates().catch(() => []),
      ]);
      setApplications(apps || []);
      setEnrollments(enrs || []);
      setCertificates(certs || []);

      if (enrs && enrs.length > 0) {
        setActiveSubTab('enrollments');
      } else if (apps && apps.length > 0) {
        setActiveSubTab('applications');
      }
    } catch (err) {
      console.error('Failed to load student internship data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyRef = (refNo: string) => {
    navigator.clipboard.writeText(refNo);
    setCopiedRef(refNo);
    setTimeout(() => setCopiedRef(null), 2000);
    toast.success('Reference number copied to clipboard');
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawingApp) return;

    setWithdrawing(true);
    try {
      await internshipService.withdrawApplication(withdrawingApp.id, withdrawalReason.trim() || undefined);
      toast.success('Application withdrawn successfully');
      setWithdrawingApp(null);
      setWithdrawalReason('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to withdraw application');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleTaskSubmit = async (enrollmentId: string, taskId: string) => {
    if (!repoUrl && !liveDemoUrl) {
      toast.error('Please provide at least a GitHub repository or live demo link.');
      return;
    }
    setSubmitting(true);
    try {
      await internshipService.submitTask(taskId, {
        enrollmentId,
        repoUrl: repoUrl.trim() || undefined,
        liveDemoUrl: liveDemoUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      toast.success('Task milestone submitted for mentor review!');
      setSubmittingTaskId(null);
      setRepoUrl('');
      setLiveDemoUrl('');
      setNotes('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit task deliverable');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUBMITTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            Submitted
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            Under Review
          </span>
        );
      case 'SHORTLISTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            Shortlisted
          </span>
        );
      case 'INTERVIEW':
      case 'INTERVIEW_SCHEDULED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 animate-pulse">
            Interview Scheduled
          </span>
        );
      case 'SELECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Selected &bull; Offer Released
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700">
            Withdrawn
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            Not Selected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-xs text-slate-500">Loading your internship workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-white">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Career & Internship Workspace</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            My Internship Applications & Milestones
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Track your applied roles, interview schedules, weekly deliverable submissions, and verified credentials.
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveSubTab('applications')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'applications'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Submitted Applications</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{applications.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('enrollments')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'enrollments'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Active Learning & Tasks</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{enrollments.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('certificates')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'certificates'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Issued Certificates</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{certificates.length}</span>
        </button>
      </div>

      {/* 1. Applications Sub-Tab */}
      {activeSubTab === 'applications' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No applications yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore our active career and internship openings across Full Stack, AI, Java, Cloud, and QA to gain hands-on production experience.
              </p>
              <Link
                to="/careers"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                Explore Opportunities
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => {
                const canWithdraw = !['SELECTED', 'REJECTED', 'WITHDRAWN'].includes(app.status?.toUpperCase());

                return (
                  <div
                    key={app.id}
                    className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            {app.domain}
                          </span>
                          {getStatusBadge(app.status)}
                          {app.referenceNumber && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              <span>Ref: {app.referenceNumber}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyRef(app.referenceNumber!)}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                title="Copy reference"
                              >
                                {copiedRef === app.referenceNumber ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white">
                          {app.internshipTitle}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Applied: {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                        {canWithdraw && (
                          <button
                            type="button"
                            onClick={() => setWithdrawingApp(app)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Interview Callout if scheduled */}
                    {app.interview && (
                      <div className="p-4 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-900 dark:text-cyan-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Video className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                            <span>Interview Scheduled: {app.interview.roundName || 'Technical Assessment Round'}</span>
                          </div>
                          <p className="text-[11px] text-cyan-700 dark:text-cyan-300">
                            Scheduled for <strong>{new Date(app.interview.scheduledAt).toLocaleString()}</strong> with {app.interview.interviewerName || 'Lead Mentor'}.
                          </p>
                        </div>
                        {app.interview.meetingLink && (
                          <a
                            href={app.interview.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shrink-0"
                          >
                            <span>Join Meeting</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Withdrawn Notice */}
                    {app.status === 'WITHDRAWN' && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>
                          Application withdrawn {app.withdrawnAt ? `on ${new Date(app.withdrawnAt).toLocaleDateString()}` : ''}
                          {app.withdrawalReason ? `: "${app.withdrawalReason}"` : ''}
                        </span>
                      </div>
                    )}

                    {/* Candidate Submitted Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Candidate</span>
                        <strong className="text-slate-800 dark:text-slate-200">{app.fullName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">College</span>
                        <span className="truncate block" title={app.college}>{app.college}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Degree & Year</span>
                        <span>{app.degree} ({app.currentYear})</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Portfolio Links</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {app.githubUrl && (
                            <a href={app.githubUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-blue-500">
                              <Code2 className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {app.linkedinUrl && (
                            <a href={app.linkedinUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-blue-500">
                              <Globe className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {app.resumeUrl && (
                            <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 font-bold text-[11px] underline">
                              Resume
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Active Enrollments & Tasks Sub-Tab */}
      {activeSubTab === 'enrollments' && (
        <div className="space-y-6">
          {enrollments.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No active enrollment</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once your submitted application is reviewed and shortlisted by our mentors, your weekly project tasks will be unlocked here.
              </p>
            </div>
          ) : (
            enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
              >
                {/* Cohort Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Active Student Cohort &bull; {enrollment.domain}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {enrollment.internshipTitle}
                    </h3>
                  </div>

                  {/* Overall Milestone Progress Ring / Bar */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {enrollment.progressPercentage}% Completed
                      </div>
                      <div className="text-[10px] text-slate-400">Cohort Milestone Progress</div>
                    </div>
                    <div className="w-28 bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                        style={{ width: `${enrollment.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Weekly Tasks List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-blue-500" />
                    <span>Weekly Project Milestones & Deliverables</span>
                  </h4>

                  <div className="space-y-3">
                    {enrollment.taskSubmissions?.map((task) => {
                      const isSubmitting = submittingTaskId === task.taskId;
                      const isSubmitted = task.submissionStatus === 'SUBMITTED' || task.submissionStatus === 'GRADED';

                      return (
                        <div
                          key={task.taskId}
                          className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                                  Week {task.weekNumber}
                                </span>
                                {isSubmitted ? (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Submitted
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                                    Pending Submission
                                  </span>
                                )}
                              </div>
                              <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                                {task.title}
                              </h5>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                {task.description}
                              </p>
                              {task.deliverables && (
                                <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1.5 font-medium">
                                  Required Deliverable: {task.deliverables}
                                </p>
                              )}
                            </div>

                            {!isSubmitted && !isSubmitting && (
                              <button
                                type="button"
                                onClick={() => setSubmittingTaskId(task.taskId)}
                                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 cursor-pointer"
                              >
                                Submit Milestone
                              </button>
                            )}
                          </div>

                          {/* Existing Submission details */}
                          {isSubmitted && (
                            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                              <div className="flex items-center gap-3">
                                {task.repoUrl && (
                                  <a
                                    href={task.repoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                  >
                                    <Code2 className="w-3.5 h-3.5" />
                                    <span>GitHub Repo</span>
                                  </a>
                                )}
                                {task.liveDemoUrl && (
                                  <a
                                    href={task.liveDemoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                                  >
                                    <Globe className="w-3.5 h-3.5" />
                                    <span>Live Demo</span>
                                  </a>
                                )}
                              </div>
                              {task.score !== undefined && task.score !== null && (
                                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                  Score: {task.score} / {task.maxScore}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Submission Inline Form */}
                          {isSubmitting && (
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <label className="block font-semibold mb-1">GitHub Repository URL</label>
                                  <input
                                    type="url"
                                    value={repoUrl}
                                    onChange={(e) => setRepoUrl(e.target.value)}
                                    placeholder="https://github.com/user/milestone-repo"
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">Live Demo / Deployment URL</label>
                                  <input
                                    type="url"
                                    value={liveDemoUrl}
                                    onChange={(e) => setLiveDemoUrl(e.target.value)}
                                    placeholder="https://demo.vercel.app"
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block font-semibold mb-1 text-xs">Submission Notes / Summary</label>
                                <textarea
                                  rows={2}
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  placeholder="Provide summary of architecture, test coverage, and decisions..."
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:border-blue-500 focus:outline-hidden resize-none"
                                />
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSubmittingTaskId(null)}
                                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={submitting}
                                  onClick={() => handleTaskSubmit(enrollment.id, task.taskId)}
                                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                  <span>Submit Deliverable</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. Certificates Sub-Tab */}
      {activeSubTab === 'certificates' && (
        <div className="space-y-4">
          {certificates.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Award className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No certificates issued yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Complete all weekly deliverables and pass your final evaluation to unlock your verified credential.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Verified Credential
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {cert.certificateNumber}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      {cert.internshipTitle}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Awarded to <strong className="text-slate-800 dark:text-slate-200">{cert.studentName}</strong> for successful completion of the {cert.duration} program.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Issued: {new Date(cert.issueDate).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/verify-certificate/${cert.certificateNumber}`}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <span>Verify Credential</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── WITHDRAW CONFIRMATION MODAL ─── */}
      {withdrawingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" />
                <span>Withdraw Application</span>
              </h3>
              <button
                type="button"
                onClick={() => setWithdrawingApp(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to withdraw your application for{' '}
              <strong className="text-slate-800 dark:text-slate-200">{withdrawingApp.internshipTitle}</strong>? This action will mark your application as withdrawn.
            </p>

            <form onSubmit={handleWithdrawSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Reason for withdrawal (Optional)
                </label>
                <textarea
                  rows={2}
                  value={withdrawalReason}
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                  placeholder="e.g. Accepted another opportunity, schedule conflict..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:border-rose-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawingApp(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawing}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {withdrawing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Withdrawing...</span>
                    </>
                  ) : (
                    <span>Confirm Withdrawal</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
