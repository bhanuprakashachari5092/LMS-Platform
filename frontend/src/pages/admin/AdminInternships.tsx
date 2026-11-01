import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Video,
  FileText,
  ExternalLink,
  Plus,
  Loader2,
  X,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  internshipService,
  type Internship,
  type InternshipApplication,
  type InternshipAnalytics,
} from '@/services/internshipService';

export const AdminInternships: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'programs' | 'applicants'>('applicants');

  // Analytics
  const [analytics, setAnalytics] = useState<InternshipAnalytics | null>(null);

  // Programs state
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  // Applicants state
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [applicantFilterStatus, setApplicantFilterStatus] = useState<string>('ALL');
  const [applicantSearch, setApplicantSearch] = useState('');

  // Modals
  const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false);
  const [newProgram, setNewProgram] = useState<Partial<Internship>>({
    title: '',
    slug: '',
    domain: 'Full Stack Web Development',
    internshipType: 'REMOTE',
    duration: '12 Weeks',
    location: 'Remote, India',
    openings: 10,
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Certificate',
    eligibility: 'B.Tech / MCA / B.Sc CS',
    requiredSkills: 'React, Node.js, TypeScript',
    description: '',
    status: 'OPEN',
    isFeatured: true,
  });

  // Interview Schedule Modal
  const [schedulingApp, setSchedulingApp] = useState<InternshipApplication | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/kq-interview');
  const [interviewerName, setInterviewerName] = useState('Lead Technical Evaluator');
  const [roundName, setRoundName] = useState('Technical & System Design');
  const [schedulingLoading, setSchedulingLoading] = useState(false);

  const loadData = async () => {
    setLoadingPrograms(true);
    setLoadingApplicants(true);
    try {
      const [analyticsData, programsData, appsData] = await Promise.all([
        internshipService.adminGetAnalytics().catch(() => null),
        internshipService.adminGetInternships({ size: 50 }).catch(() => ({ content: [] })),
        internshipService.adminGetApplications({
          status: applicantFilterStatus !== 'ALL' ? applicantFilterStatus : undefined,
          search: applicantSearch || undefined,
          size: 50,
        }).catch(() => ({ content: [] })),
      ]);
      setAnalytics(analyticsData);
      setInternships(programsData.content || []);
      setApplications(appsData.content || []);
    } catch (err) {
      console.error('Failed to load admin internship portal data:', err);
    } finally {
      setLoadingPrograms(false);
      setLoadingApplicants(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [applicantFilterStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Status updates
  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      await internshipService.adminUpdateApplicationStatus(appId, newStatus);
      toast.success(`Application marked as ${newStatus}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  // Convert applicant to active enrollment
  const handleEnrollStudent = async (appId: string) => {
    try {
      await internshipService.adminEnrollStudent(appId);
      toast.success('Candidate successfully enrolled into internship cohort!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to enroll candidate');
    }
  };

  // Create Program
  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgram.title || !newProgram.domain || !newProgram.description) {
      toast.error('Please enter title, domain, and description.');
      return;
    }
    try {
      const slug =
        newProgram.slug?.trim() ||
        newProgram.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      await internshipService.adminCreateInternship({
        ...newProgram,
        slug,
      });
      toast.success('Internship program published successfully!');
      setIsCreateProgramOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create internship program');
    }
  };

  // Schedule Interview
  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingApp || !interviewDate) {
      toast.error('Please select interview date and time.');
      return;
    }
    setSchedulingLoading(true);
    try {
      await internshipService.adminScheduleInterview(schedulingApp.id, {
        scheduledAt: new Date(interviewDate).toISOString(),
        meetingLink,
        interviewerName,
        roundName,
      });
      toast.success(`Interview scheduled for ${schedulingApp.fullName}`);
      setSchedulingApp(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule interview');
    } finally {
      setSchedulingLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-['Sora']">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
            Administration & Industry Cohorts
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Internship Management Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage internship listings, review student applications, schedule interviews, and issue verified credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateProgramOpen(true)}
          className="px-4.5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Internship Program</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('applicants')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'applicants'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Applicant Directory</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{applications.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('programs')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'programs'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Programs Catalog</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{internships.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Cohort Reports</span>
        </button>
      </div>

      {/* 1. Applicants Tab */}
      {activeTab === 'applicants' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setApplicantFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer text-[11px] ${
                    applicantFilterStatus === st
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={applicantSearch}
                onChange={(e) => setApplicantSearch(e.target.value)}
                placeholder="Search candidate name, college, email..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-blue-500"
              />
            </form>
          </div>

          {/* Applications Table / Cards */}
          {loadingApplicants ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-500">Loading applicants...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No applicants found</h4>
              <p className="text-xs text-slate-500">Try changing the status filter or clearing your search term.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-black text-slate-900 dark:text-white text-base">
                          {app.fullName}
                        </span>
                        <span className="text-xs text-slate-400">({app.email} | {app.phone})</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Applied for: <span className="text-blue-600 dark:text-blue-400">{app.internshipTitle}</span> ({app.domain})
                      </p>
                    </div>

                    <span className="text-xs text-slate-400 shrink-0">
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Academic & Skills Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Institution</span>
                      <strong className="text-slate-800 dark:text-slate-200 truncate block">{app.college}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Degree & Branch</span>
                      <span>{app.degree} - {app.branch}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Year of Study</span>
                      <span>{app.currentYear} (Grad {app.graduationYear})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Skills</span>
                      <span className="truncate block" title={app.skills}>{app.skills}</span>
                    </div>
                  </div>

                  {/* Links & Statement */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                    <div className="flex items-center gap-3">
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Resume</span>
                        </a>
                      )}
                      {app.githubUrl && (
                        <a
                          href={app.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>GitHub</span>
                        </a>
                      )}
                      {app.linkedinUrl && (
                        <a
                          href={app.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {app.status === 'SUBMITTED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(app.id, 'UNDER_REVIEW')}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-100 cursor-pointer text-xs"
                        >
                          Mark Under Review
                        </button>
                      )}

                      {app.status === 'UNDER_REVIEW' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-100 cursor-pointer text-xs"
                        >
                          Shortlist Candidate
                        </button>
                      )}

                      {(app.status === 'UNDER_REVIEW' || app.status === 'SHORTLISTED') && (
                        <button
                          type="button"
                          onClick={() => setSchedulingApp(app)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-bold hover:bg-cyan-100 cursor-pointer text-xs flex items-center gap-1"
                        >
                          <Video className="w-3 h-3" />
                          <span>Schedule Interview</span>
                        </button>
                      )}

                      {(app.status === 'SHORTLISTED' || app.status === 'INTERVIEW_SCHEDULED') && (
                        <button
                          type="button"
                          onClick={() => handleEnrollStudent(app.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer text-xs flex items-center gap-1 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Select & Enroll</span>
                        </button>
                      )}

                      {app.status !== 'REJECTED' && app.status !== 'SELECTED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                          className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Programs Tab */}
      {activeTab === 'programs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {internships.map((intern) => (
              <div
                key={intern.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {intern.domain}
                    </span>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">{intern.title}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    {intern.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">{intern.description}</p>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                  <div>Duration: <strong className="text-slate-800 dark:text-slate-200">{intern.duration}</strong></div>
                  <div>Mode: <strong className="text-slate-800 dark:text-slate-200">{intern.internshipType}</strong></div>
                  <div>Openings: <strong className="text-slate-800 dark:text-slate-200">{intern.openings}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {analytics ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Applications</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{analytics.totalApplications}</span>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Under Review</span>
                <span className="text-2xl font-black text-amber-600 mt-1 block">{analytics.underReviewApplications}</span>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shortlisted</span>
                <span className="text-2xl font-black text-purple-600 mt-1 block">{analytics.shortlistedApplications}</span>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Selected & Active</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">{analytics.selectedApplications}</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">Loading analytics...</div>
          )}
        </div>
      )}

      {/* Schedule Interview Modal */}
      {schedulingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Schedule Interview for {schedulingApp.fullName}
              </h3>
              <button
                onClick={() => setSchedulingApp(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Interview Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Virtual Meeting Link *</label>
                <input
                  type="url"
                  required
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Interviewer Name</label>
                <input
                  type="text"
                  value={interviewerName}
                  onChange={(e) => setInterviewerName(e.target.value)}
                  placeholder="e.g. Lead Technical Evaluator"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Round / Evaluation Stage</label>
                <input
                  type="text"
                  value={roundName}
                  onChange={(e) => setRoundName(e.target.value)}
                  placeholder="e.g. Technical & System Architecture"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSchedulingApp(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={schedulingLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {schedulingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5" />}
                  <span>Confirm Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Program Modal */}
      {isCreateProgramOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Create New Internship Program</h3>
              <button
                onClick={() => setIsCreateProgramOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Internship Title *</label>
                <input
                  type="text"
                  required
                  value={newProgram.title}
                  onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
                  placeholder="e.g. AI & Machine Learning Research Internship"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Domain *</label>
                  <select
                    value={newProgram.domain}
                    onChange={(e) => setNewProgram({ ...newProgram, domain: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Full Stack Web Development">Full Stack Web Development</option>
                    <option value="Frontend Development">Frontend Development</option>
                    <option value="Backend Development">Backend Development</option>
                    <option value="Artificial Intelligence & Machine Learning">AI & Machine Learning</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Cloud Computing & DevOps">Cloud & DevOps</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Internship Mode</label>
                  <select
                    value={newProgram.internshipType}
                    onChange={(e) => setNewProgram({ ...newProgram, internshipType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ONSITE">On-site</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    value={newProgram.duration}
                    onChange={(e) => setNewProgram({ ...newProgram, duration: e.target.value })}
                    placeholder="e.g. 12 Weeks"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Openings</label>
                  <input
                    type="number"
                    value={newProgram.openings}
                    onChange={(e) => setNewProgram({ ...newProgram, openings: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Stipend / Incentive Details</label>
                <input
                  type="text"
                  value={newProgram.stipendAmount}
                  onChange={(e) => setNewProgram({ ...newProgram, stipendAmount: e.target.value })}
                  placeholder="e.g. Performance Stipend + Industry Verified Certificate"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Required Skills</label>
                <input
                  type="text"
                  value={newProgram.requiredSkills}
                  onChange={(e) => setNewProgram({ ...newProgram, requiredSkills: e.target.value })}
                  placeholder="e.g. React, Node.js, TypeScript, PostgreSQL"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newProgram.description}
                  onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                  placeholder="Detailed overview of what the candidate will build and learn..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateProgramOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Publish Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

