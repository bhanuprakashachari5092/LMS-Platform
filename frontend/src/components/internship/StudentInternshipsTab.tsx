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
    switch (status) {
      case 'SUBMITTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">Submitted</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">Under Review</span>;
      case 'SHORTLISTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800">Shortlisted</span>;
      case 'INTERVIEW_SCHEDULED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 animate-pulse">Interview Scheduled</span>;
      case 'SELECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Selected / Enrolled</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">Archived</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading your internship records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-linear-to-r from-blue-600/10 via-indigo-600/10 to-transparent border border-blue-500/20">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
            Career & Industry Experience
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            My Internships & Applications
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Track your candidate application status, complete structured weekly tasks, interact with mentors, and earn verified credentials.
          </p>
        </div>

        <Link
          to="/careers"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Browse Open Internships</span>
        </Link>
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
                Explore our active internship programs across Full Stack, AI, Java, and DevOps to gain hands-on production experience.
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
              {applications.map((app) => (
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
                      </div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        {app.internshipTitle}
                      </h4>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Interview Callout if scheduled */}
                  {app.interview && (
                    <div className="p-4 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-900 dark:text-cyan-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Video className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          <span>Interview Scheduled: {app.interview.roundName || 'Technical Round'}</span>
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
              ))}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {enrollment.domain}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {enrollment.internshipTitle}
                    </h3>
                  </div>

                  {/* Progress Indicator */}
                  <div className="sm:text-right min-w-40">
                    <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-bold mb-1">
                      <span className="text-slate-500">Progress:</span>
                      <span className="text-blue-600 dark:text-blue-400">{enrollment.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${enrollment.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Weekly Project Milestones & Deliverables
                  </h4>

                  <div className="space-y-3">
                    {enrollment.taskSubmissions.map((task) => (
                      <div
                        key={task.taskId}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center shrink-0">
                              W{task.weekNumber}
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-slate-900 dark:text-white">{task.title}</h5>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{task.description}</p>
                              {task.deliverables && (
                                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-mono mt-1">
                                  Deliverable: {task.deliverables}
                                </p>
                              )}
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              task.submissionStatus === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : task.submissionStatus === 'SUBMITTED'
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {task.submissionStatus}
                          </span>
                        </div>

                        {/* Submission Link Info if already submitted */}
                        {task.repoUrl && (
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                            {task.repoUrl && (
                              <a
                                href={task.repoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                <Code2 className="w-3 h-3" />
                                <span>Repository</span>
                              </a>
                            )}
                            {task.liveDemoUrl && (
                              <a
                                href={task.liveDemoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Live App</span>
                              </a>
                            )}
                            {task.score != null && (
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                Score: {task.score} / {task.maxScore}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Submit Deliverable Toggle */}
                        {submittingTaskId === task.taskId ? (
                          <div className="pt-2 space-y-2 border-t border-slate-200/80 dark:border-slate-800">
                            <input
                              type="url"
                              value={repoUrl}
                              onChange={(e) => setRepoUrl(e.target.value)}
                              placeholder="GitHub repository link (e.g. https://github.com/...)"
                              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-blue-500"
                            />
                            <input
                              type="url"
                              value={liveDemoUrl}
                              onChange={(e) => setLiveDemoUrl(e.target.value)}
                              placeholder="Live preview / demo URL (optional)"
                              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-blue-500"
                            />
                            <textarea
                              rows={2}
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Notes for mentor regarding what you built..."
                              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-blue-500 resize-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setSubmittingTaskId(null)}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={submitting}
                                onClick={() => handleTaskSubmit(enrollment.id, task.taskId)}
                                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-xs"
                              >
                                {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                <span>Submit Work</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSubmittingTaskId(task.taskId);
                                setRepoUrl(task.repoUrl || '');
                                setLiveDemoUrl(task.liveDemoUrl || '');
                                setNotes(task.notes || '');
                              }}
                              className="px-3.5 py-1.5 rounded-xl text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 transition-colors cursor-pointer"
                            >
                              {task.submissionStatus === 'PENDING' ? 'Submit Deliverable' : 'Update Submission'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
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
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No completion certificates yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Complete your weekly deliverables and capstone milestones to receive an official cryptographic completion certificate recognized by industry recruiters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-6 rounded-3xl bg-linear-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Verified Credential
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{cert.certificateNumber}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">{cert.internshipTitle}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Awarded to: <strong className="text-slate-800 dark:text-slate-200">{cert.studentName}</strong></p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                    <Link
                      to={`/verify-certificate/${cert.certificateNumber}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
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
    </div>
  );
};
