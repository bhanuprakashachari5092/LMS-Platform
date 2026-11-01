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
  Download,
  Edit2,
  Trash2,
  Check,
  Eye,
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
  const [exportingCsv, setExportingCsv] = useState(false);

  // Opening Create / Edit Modal
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [programForm, setProgramForm] = useState<Partial<Internship>>({
    title: '',
    slug: '',
    domain: 'Full Stack Web Development',
    department: 'Engineering',
    employmentType: 'INTERNSHIP',
    experienceLevel: 'ENTRY_LEVEL',
    internshipType: 'REMOTE',
    duration: '12 Weeks',
    location: 'Remote, India',
    openings: 10,
    stipendType: 'PERFORMANCE_BASED',
    stipendAmount: 'Performance Stipend + Certificate',
    eligibility: 'B.Tech / MCA / B.Sc CS',
    requiredSkills: 'React, Node.js, TypeScript',
    preferredSkills: 'Docker, AWS',
    description: '',
    responsibilities: '',
    learningOutcomes: '',
    status: 'OPEN',
    isFeatured: true,
  });

  // Application Detail Modal (with internal notes)
  const [inspectingApp, setInspectingApp] = useState<InternshipApplication | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');

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

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      await internshipService.adminExportApplicationsCsv(undefined, applicantFilterStatus);
      toast.success('Applicant directory exported to CSV');
    } catch (err: any) {
      toast.error(err.message || 'Failed to export CSV');
    } finally {
      setExportingCsv(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProgramId(null);
    setProgramForm({
      title: '',
      slug: '',
      domain: 'Full Stack Web Development',
      department: 'Engineering',
      employmentType: 'INTERNSHIP',
      experienceLevel: 'ENTRY_LEVEL',
      internshipType: 'REMOTE',
      duration: '12 Weeks',
      location: 'Remote, India',
      openings: 10,
      stipendType: 'PERFORMANCE_BASED',
      stipendAmount: 'Performance Stipend + Certificate',
      eligibility: 'B.Tech / MCA / B.Sc CS',
      requiredSkills: 'React, Node.js, TypeScript',
      preferredSkills: '',
      description: '',
      responsibilities: '',
      learningOutcomes: '',
      status: 'OPEN',
      isFeatured: true,
    });
    setIsProgramModalOpen(true);
  };

  const handleOpenEditModal = (prog: Internship) => {
    setEditingProgramId(prog.id);
    setProgramForm({ ...prog });
    setIsProgramModalOpen(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProgramId) {
        await internshipService.adminUpdateInternship(editingProgramId, programForm);
        toast.success('Opening updated successfully!');
      } else {
        await internshipService.adminCreateInternship(programForm);
        toast.success('Opening created successfully!');
      }
      setIsProgramModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save opening');
    }
  };

  const handlePatchOpeningStatus = async (id: string, newStatus: string) => {
    try {
      await internshipService.adminPatchInternshipStatus(id, newStatus);
      toast.success(`Opening status updated to ${newStatus}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleDeleteOpening = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await internshipService.adminDeleteInternship(id);
      toast.success('Opening deleted successfully');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete opening');
    }
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string, notes?: string) => {
    try {
      await internshipService.adminUpdateApplicationStatus(applicationId, newStatus, notes);
      toast.success(`Candidate status updated to ${newStatus}`);
      if (inspectingApp && inspectingApp.id === applicationId) {
        setInspectingApp({ ...inspectingApp, status: newStatus as any, adminNotes: notes });
      }
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update candidate status');
    }
  };

  const handleScheduleInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingApp || !interviewDate) {
      toast.error('Please specify interview date & time.');
      return;
    }
    setSchedulingLoading(true);
    try {
      await internshipService.adminScheduleInterview(schedulingApp.id, {
        scheduledAt: new Date(interviewDate).toISOString(),
        meetingLink: meetingLink.trim(),
        interviewerName: interviewerName.trim(),
        roundName: roundName.trim(),
      });
      toast.success('Interview successfully scheduled with candidate!');
      setSchedulingApp(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule interview');
    } finally {
      setSchedulingLoading(false);
    }
  };

  const handleEnrollStudent = async (appId: string) => {
    try {
      await internshipService.adminEnrollStudent(appId);
      toast.success('Candidate enrolled into active student cohort!');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to enroll student');
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Administrative Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Careers & Internship Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage career openings, applicant review pipelines, interview scheduling, and cohort certificates.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Opening</span>
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
          <span>Openings Catalog</span>
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
          <span>Analytics & Reports</span>
        </button>
      </div>

      {/* ─── 1. APPLICANTS TAB ─── */}
      {activeTab === 'applicants' && (
        <div className="space-y-4">
          {/* Filters Bar & CSV Export */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'WITHDRAWN', 'REJECTED'].map((st) => (
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

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={applicantSearch}
                  onChange={(e) => setApplicantSearch(e.target.value)}
                  placeholder="Search name, ref, email..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-blue-500"
                />
              </form>

              {/* CSV Export Button */}
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={exportingCsv}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                title="Export current applicant list to CSV"
              >
                {exportingCsv ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Applications Cards */}
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
                        {app.referenceNumber && (
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {app.referenceNumber}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Role: <span className="text-blue-600 dark:text-blue-400">{app.internshipTitle}</span> ({app.domain})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInspectingApp(app);
                          setAdminNotesInput(app.adminNotes || '');
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1 cursor-pointer"
                        title="View details & notes"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      <span className="text-xs text-slate-400 shrink-0">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
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
                          className="text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1 hover:underline"
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
                          className="text-slate-500 hover:text-blue-500 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>GitHub</span>
                        </a>
                      )}
                      {app.linkedinUrl && (
                        <a
                          href={app.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 hover:text-blue-500 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                    </div>

                    {/* Quick Status Workflow Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, 'UNDER_REVIEW')}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        Under Review
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                        className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-bold hover:bg-purple-100 cursor-pointer"
                      >
                        Shortlist
                      </button>
                      <button
                        type="button"
                        onClick={() => setSchedulingApp(app)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Video className="w-3 h-3" />
                        <span>Schedule Interview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEnrollStudent(app.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Enroll Cohort</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                        className="px-2 py-1 rounded-lg text-[11px] font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── 2. PROGRAMS CATALOG TAB ─── */}
      {activeTab === 'programs' && (
        <div className="space-y-4">
          {loadingPrograms ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-500">Loading openings...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.map((prog) => (
                <div
                  key={prog.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {prog.department || 'Engineering'} &bull; {prog.domain}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {prog.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {prog.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {prog.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePatchOpeningStatus(prog.id, prog.status === 'OPEN' ? 'CLOSED' : 'OPEN')}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        {prog.status === 'OPEN' ? 'Close' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(prog)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        title="Edit opening"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteOpening(prog.id, prog.title)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Delete opening"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium">
                      {prog.openings} Openings
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── 3. ANALYTICS & REPORTS TAB ─── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Total Openings</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {analytics?.totalInternships || 0}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Total Applications</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {analytics?.totalApplications || 0}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Shortlisted Candidates</span>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {analytics?.shortlisted || 0}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Active Cohort Scholars</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {analytics?.activeEnrollments || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── OPENING CREATE / EDIT MODAL ─── */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingProgramId ? 'Edit Career Opening' : 'Create Career Opening'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProgramModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Role Title *</label>
                  <input
                    type="text"
                    required
                    value={programForm.title}
                    onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                    placeholder="e.g. Frontend Development Intern"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={programForm.slug}
                    onChange={(e) => setProgramForm({ ...programForm, slug: e.target.value })}
                    placeholder="frontend-dev-intern"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={programForm.department}
                    onChange={(e) => setProgramForm({ ...programForm, department: e.target.value })}
                    placeholder="Engineering / Product"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Domain</label>
                  <input
                    type="text"
                    value={programForm.domain}
                    onChange={(e) => setProgramForm({ ...programForm, domain: e.target.value })}
                    placeholder="Frontend Development"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Work Mode</label>
                  <select
                    value={programForm.internshipType}
                    onChange={(e) => setProgramForm({ ...programForm, internshipType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ONSITE">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    value={programForm.duration}
                    onChange={(e) => setProgramForm({ ...programForm, duration: e.target.value })}
                    placeholder="12 Weeks"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Openings</label>
                  <input
                    type="number"
                    value={programForm.openings}
                    onChange={(e) => setProgramForm({ ...programForm, openings: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Eligibility Criteria *</label>
                  <input
                    type="text"
                    required
                    value={programForm.eligibility}
                    onChange={(e) => setProgramForm({ ...programForm, eligibility: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Required Skills *</label>
                  <input
                    type="text"
                    required
                    value={programForm.requiredSkills}
                    onChange={(e) => setProgramForm({ ...programForm, requiredSkills: e.target.value })}
                    placeholder="React, TypeScript, CSS"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Role Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={programForm.description}
                    onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:border-blue-500 focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProgramModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                >
                  Save Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CANDIDATE INSPECT & INTERNAL NOTES MODAL ─── */}
      {inspectingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {inspectingApp.fullName}
                </h3>
                <span className="text-xs text-slate-400">Ref: {inspectingApp.referenceNumber}</span>
              </div>
              <button
                type="button"
                onClick={() => setInspectingApp(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Email:</strong> {inspectingApp.email}</div>
                <div><strong>Phone:</strong> {inspectingApp.phone}</div>
                <div><strong>College:</strong> {inspectingApp.college}</div>
                <div><strong>Degree:</strong> {inspectingApp.degree} ({inspectingApp.currentYear})</div>
              </div>

              {inspectingApp.statementOfPurpose && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <strong className="block text-slate-800 dark:text-slate-200 mb-1">Statement of Purpose:</strong>
                  <p className="leading-relaxed">{inspectingApp.statementOfPurpose}</p>
                </div>
              )}

              {/* Recruiter Internal Notes */}
              <div>
                <label className="block font-semibold mb-1">Recruiter / Admin Internal Notes</label>
                <textarea
                  rows={3}
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder="Add evaluation feedback, screening notes, or interview observations..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:border-blue-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(inspectingApp.id, inspectingApp.status, adminNotesInput)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
                >
                  Save Internal Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── INTERVIEW SCHEDULE MODAL ─── */}
      {schedulingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-500" />
                <span>Schedule Candidate Interview</span>
              </h3>
              <button
                type="button"
                onClick={() => setSchedulingApp(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Candidate</label>
                <input
                  type="text"
                  disabled
                  value={`${schedulingApp.fullName} (${schedulingApp.email})`}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-500"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Meeting Link</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Lead Interviewer</label>
                <input
                  type="text"
                  value={interviewerName}
                  onChange={(e) => setInterviewerName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Round Name</label>
                <input
                  type="text"
                  value={roundName}
                  onChange={(e) => setRoundName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSchedulingApp(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={schedulingLoading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {schedulingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
                  <span>Schedule Interview</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
