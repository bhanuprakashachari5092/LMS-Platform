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
  Copy,
  LayoutGrid,
  List,
  Star,
  AlertTriangle,
  SlidersHorizontal,
  RefreshCw,
  MapPin,
  DollarSign,
  ChevronRight,
  ShieldAlert,
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
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogStatusFilter, setCatalogStatusFilter] = useState<string>('ALL');
  const [catalogDomainFilter, setCatalogDomainFilter] = useState<string>('ALL');
  const [catalogViewMode, setCatalogViewMode] = useState<'grid' | 'table'>('grid');
  const [deletingOpening, setDeletingOpening] = useState<Internship | null>(null);
  const [isDeletingOpening, setIsDeletingOpening] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [statusPatchingId, setStatusPatchingId] = useState<string | null>(null);

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

  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handlePatchOpeningStatus = async (id: string, newStatus: string) => {
    setStatusPatchingId(id);
    try {
      await internshipService.adminPatchInternshipStatus(id, newStatus);
      toast.success(`Opening status updated to ${newStatus}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusPatchingId(null);
    }
  };

  const handleToggleFeatured = async (prog: Internship) => {
    try {
      const nextFeatured = !prog.isFeatured;
      await internshipService.adminUpdateInternship(prog.id, { isFeatured: nextFeatured });
      toast.success(`"${prog.title}" is now ${nextFeatured ? 'featured' : 'standard'}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle featured status');
    }
  };

  const handleDuplicateOpening = async (prog: Internship) => {
    setDuplicatingId(prog.id);
    try {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const clonedPayload: Partial<Internship> = {
        title: `${prog.title} (Copy)`,
        slug: `${prog.slug}-copy-${randomSuffix}`,
        domain: prog.domain,
        department: prog.department,
        employmentType: prog.employmentType || 'INTERNSHIP',
        experienceLevel: prog.experienceLevel || 'ENTRY_LEVEL',
        internshipType: prog.internshipType || 'REMOTE',
        duration: prog.duration,
        location: prog.location,
        openings: prog.openings,
        stipendType: prog.stipendType || 'PERFORMANCE_BASED',
        stipendAmount: prog.stipendAmount,
        eligibility: prog.eligibility,
        requiredSkills: prog.requiredSkills,
        preferredSkills: prog.preferredSkills || '',
        description: prog.description,
        responsibilities: prog.responsibilities || '',
        learningOutcomes: prog.learningOutcomes || '',
        status: 'DRAFT',
        isFeatured: false,
      };
      await internshipService.adminCreateInternship(clonedPayload);
      toast.success(`Opening duplicated as Draft: "${clonedPayload.title}"`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to duplicate opening');
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleConfirmDeleteOpening = async () => {
    if (!deletingOpening) return;
    setIsDeletingOpening(true);
    try {
      await internshipService.adminDeleteInternship(deletingOpening.id);
      toast.success(`Opening "${deletingOpening.title}" permanently deleted.`);
      setDeletingOpening(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete opening');
    } finally {
      setIsDeletingOpening(false);
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

  const uniqueDomains = Array.from(new Set(internships.map((i) => i.domain).filter(Boolean)));

  const filteredInternships = internships.filter((prog) => {
    const q = catalogSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      prog.title?.toLowerCase().includes(q) ||
      prog.domain?.toLowerCase().includes(q) ||
      prog.slug?.toLowerCase().includes(q) ||
      prog.requiredSkills?.toLowerCase().includes(q) ||
      prog.department?.toLowerCase().includes(q);

    const matchesStatus =
      catalogStatusFilter === 'ALL' ||
      prog.status?.toUpperCase() === catalogStatusFilter.toUpperCase();

    const matchesDomain =
      catalogDomainFilter === 'ALL' ||
      prog.domain === catalogDomainFilter;

    return matchesSearch && matchesStatus && matchesDomain;
  });

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
        <div className="space-y-6">
          {/* Controls Bar: Search, Filters, View Mode */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Search openings by role, domain, department, or required skills..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                />
                {catalogSearch && (
                  <button
                    type="button"
                    onClick={() => setCatalogSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Domain Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={catalogDomainFilter}
                  onChange={(e) => setCatalogDomainFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden"
                >
                  <option value="ALL">All Domains ({uniqueDomains.length})</option>
                  {uniqueDomains.map((dom) => (
                    <option key={dom} value={dom}>
                      {dom}
                    </option>
                  ))}
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setCatalogViewMode('grid')}
                    title="Grid Card View"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      catalogViewMode === 'grid'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatalogViewMode('table')}
                    title="Recruiter Table View"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      catalogViewMode === 'table'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Opening</span>
                </button>
              </div>
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Status:
                </span>
                {(['ALL', 'OPEN', 'CLOSED', 'DRAFT', 'ARCHIVED'] as const).map((st) => {
                  const count = st === 'ALL'
                    ? internships.length
                    : internships.filter((i) => i.status?.toUpperCase() === st).length;
                  const isActive = catalogStatusFilter === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setCatalogStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{st}</span>
                      <span className={`ml-1 text-[10px] opacity-80`}>({count})</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                Showing {filteredInternships.length} of {internships.length} openings
              </span>
            </div>
          </div>

          {/* Catalog Body */}
          {loadingPrograms ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-500">Loading career openings...</p>
            </div>
          ) : filteredInternships.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 space-y-3 bg-white dark:bg-slate-900">
              <Briefcase className="w-10 h-10 mx-auto text-slate-400 stroke-1" />
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No career openings match your filters</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing your search query or changing your status and domain filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCatalogSearch('');
                  setCatalogStatusFilter('ALL');
                  setCatalogDomainFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : catalogViewMode === 'grid' ? (
            /* ── GRID CARDS VIEW ── */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInternships.map((prog) => {
                const isOpen = prog.status === 'OPEN';
                const isDraft = prog.status === 'DRAFT';
                return (
                  <div
                    key={prog.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    {/* Top Row: Domain, Status Dropdown, Featured Toggle */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          {prog.department || 'Engineering'} &bull; {prog.domain}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Featured Star Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(prog)}
                            title={prog.isFeatured ? 'Featured on Portal (Click to unfeature)' : 'Mark as Featured'}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${
                              prog.isFeatured
                                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${prog.isFeatured ? 'fill-amber-500' : ''}`} />
                          </button>

                          {/* Quick Status Dropdown Selector */}
                          <select
                            value={prog.status}
                            disabled={statusPatchingId === prog.id}
                            onChange={(e) => handlePatchOpeningStatus(prog.id, e.target.value)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border transition-all cursor-pointer ${
                              isOpen
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                                : isDraft
                                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            <option value="OPEN">OPEN</option>
                            <option value="CLOSED">CLOSED</option>
                            <option value="DRAFT">DRAFT</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                          </select>
                        </div>
                      </div>

                      {/* Title & Slug */}
                      <div>
                        <h3
                          onClick={() => handleOpenEditModal(prog)}
                          className="font-bold text-base text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer transition-colors"
                        >
                          {prog.title}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono">
                          /{prog.slug}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {prog.description || 'Structured professional curriculum with real-world production deliverables.'}
                      </p>

                      {/* Badges: Mode, Duration, Openings, Stipend */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium">
                          {prog.internshipType || 'REMOTE'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium">
                          {prog.duration || '12 Weeks'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                          {prog.openings} Openings
                        </span>
                        {prog.stipendAmount && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            {prog.stipendAmount}
                          </span>
                        )}
                      </div>

                      {/* Required Skills Chips */}
                      {prog.requiredSkills && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {prog.requiredSkills.split(',').slice(0, 4).map((sk, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-50 dark:bg-slate-800/80 text-slate-500 border border-slate-200/60 dark:border-slate-800"
                            >
                              {sk.trim()}
                            </span>
                          ))}
                          {prog.requiredSkills.split(',').length > 4 && (
                            <span className="text-[9px] text-slate-400 self-center">
                              +{prog.requiredSkills.split(',').length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {/* Live Link */}
                        <a
                          href={`/careers#${prog.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View on Public Careers Portal"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(prog)}
                          title="Edit opening details"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate Button */}
                        <button
                          type="button"
                          disabled={duplicatingId === prog.id}
                          onClick={() => handleDuplicateOpening(prog)}
                          title="Duplicate this opening to Draft"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer disabled:opacity-50"
                        >
                          {duplicatingId === prog.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeletingOpening(prog)}
                          title="Delete opening permanently"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePatchOpeningStatus(prog.id, isOpen ? 'CLOSED' : 'OPEN')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                          isOpen
                            ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            : 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100'
                        }`}
                      >
                        {isOpen ? 'Close' : 'Publish'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── RECRUITER TABLE VIEW ── */
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Role Title & Slug</th>
                    <th className="py-3 px-4">Domain & Dept</th>
                    <th className="py-3 px-4">Mode / Duration</th>
                    <th className="py-3 px-4">Openings</th>
                    <th className="py-3 px-4">Stipend</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Featured</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInternships.map((prog) => {
                    const isOpen = prog.status === 'OPEN';
                    const isDraft = prog.status === 'DRAFT';
                    return (
                      <tr key={prog.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          <div className="font-bold">{prog.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">/{prog.slug}</div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          <div>{prog.domain}</div>
                          <div className="text-[10px] text-slate-400">{prog.department || 'Engineering'}</div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                            {prog.internshipType || 'REMOTE'}
                          </span>
                          <span className="ml-1 text-[11px] text-slate-400">({prog.duration})</span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-bold">
                          {prog.openings}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                          {prog.stipendAmount || 'Performance Stipend'}
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={prog.status}
                            disabled={statusPatchingId === prog.id}
                            onChange={(e) => handlePatchOpeningStatus(prog.id, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                              isOpen
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                                : isDraft
                                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            <option value="OPEN">OPEN</option>
                            <option value="CLOSED">CLOSED</option>
                            <option value="DRAFT">DRAFT</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(prog)}
                            title={prog.isFeatured ? 'Featured (Click to unfeature)' : 'Click to feature'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              prog.isFeatured
                                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${prog.isFeatured ? 'fill-amber-500' : ''}`} />
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`/careers#${prog.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              title="View on Public Careers Portal"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(prog)}
                              title="Edit opening"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              disabled={duplicatingId === prog.id}
                              onClick={() => handleDuplicateOpening(prog)}
                              title="Duplicate opening"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer disabled:opacity-50"
                            >
                              {duplicatingId === prog.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingOpening(prog)}
                              title="Delete opening"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  <span>{editingProgramId ? 'Edit Career Opening' : 'Create Career Opening'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {editingProgramId ? 'Update role requirements, stipend, logistics, or publication status' : 'Publish a new structured engineering internship track'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProgramModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Role Title *</label>
                  <input
                    type="text"
                    required
                    value={programForm.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setProgramForm((prev) => ({
                        ...prev,
                        title: newTitle,
                        slug: prev.slug || editingProgramId ? prev.slug : generateSlugFromTitle(newTitle),
                      }));
                    }}
                    placeholder="e.g. Frontend Development Intern"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Slug with Auto Generator */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">URL Slug *</label>
                    {programForm.title && (
                      <button
                        type="button"
                        onClick={() => setProgramForm((prev) => ({ ...prev, slug: generateSlugFromTitle(prev.title || '') }))}
                        className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                      >
                        Auto-generate from Title
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[11px]">/careers/</span>
                    <input
                      type="text"
                      required
                      value={programForm.slug}
                      onChange={(e) => setProgramForm({ ...programForm, slug: e.target.value })}
                      placeholder="frontend-dev-intern"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-20 pr-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Department & Domain */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Department</label>
                  <input
                    type="text"
                    value={programForm.department}
                    onChange={(e) => setProgramForm({ ...programForm, department: e.target.value })}
                    placeholder="Engineering / AI Labs"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Domain / Specialization *</label>
                  <input
                    type="text"
                    required
                    value={programForm.domain}
                    onChange={(e) => setProgramForm({ ...programForm, domain: e.target.value })}
                    placeholder="Frontend Development"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Work Mode & Duration */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Work Mode</label>
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
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Duration</label>
                  <input
                    type="text"
                    value={programForm.duration}
                    onChange={(e) => setProgramForm({ ...programForm, duration: e.target.value })}
                    placeholder="12 Weeks"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Openings & Location */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Available Openings</label>
                  <input
                    type="number"
                    min="1"
                    value={programForm.openings}
                    onChange={(e) => setProgramForm({ ...programForm, openings: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Location</label>
                  <input
                    type="text"
                    value={programForm.location}
                    onChange={(e) => setProgramForm({ ...programForm, location: e.target.value })}
                    placeholder="Remote, India / Hyderabad"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Stipend Type & Amount */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Stipend Type</label>
                  <select
                    value={programForm.stipendType}
                    onChange={(e) => setProgramForm({ ...programForm, stipendType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="PERFORMANCE_BASED">Performance Based</option>
                    <option value="PAID">Paid Fixed</option>
                    <option value="UNPAID">Unpaid / Educational</option>
                    <option value="NOT_DISCLOSED">Not Disclosed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Stipend Amount / Perks</label>
                  <input
                    type="text"
                    value={programForm.stipendAmount}
                    onChange={(e) => setProgramForm({ ...programForm, stipendAmount: e.target.value })}
                    placeholder="e.g. ₹12,000 / month + Certificate"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Eligibility */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Eligibility Criteria *</label>
                  <input
                    type="text"
                    required
                    value={programForm.eligibility}
                    onChange={(e) => setProgramForm({ ...programForm, eligibility: e.target.value })}
                    placeholder="e.g. B.Tech / BE / MCA in CS/IT or self-taught with GitHub projects"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Required Skills & Preferred Skills */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Required Skills * (comma separated)</label>
                  <input
                    type="text"
                    required
                    value={programForm.requiredSkills}
                    onChange={(e) => setProgramForm({ ...programForm, requiredSkills: e.target.value })}
                    placeholder="React, TypeScript, CSS, Git"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Preferred Skills (comma separated)</label>
                  <input
                    type="text"
                    value={programForm.preferredSkills}
                    onChange={(e) => setProgramForm({ ...programForm, preferredSkills: e.target.value })}
                    placeholder="Docker, Next.js, GraphQL, AWS"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Role Overview / Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={programForm.description}
                    onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                    placeholder="Brief summary of the internship opportunity, technology stack, and cohort objectives..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:border-blue-500 focus:outline-hidden resize-none"
                  />
                </div>

                {/* Key Responsibilities */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Key Responsibilities (one per line or bullet points)</label>
                  <textarea
                    rows={3}
                    value={programForm.responsibilities}
                    onChange={(e) => setProgramForm({ ...programForm, responsibilities: e.target.value })}
                    placeholder="• Implement reusable responsive components&#10;• Integrate REST APIs and state management&#10;• Write unit tests with Vitest and participate in code reviews"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:border-blue-500 focus:outline-hidden resize-none font-mono text-[11px]"
                  />
                </div>

                {/* Status & Featured Controls */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Publication Status</label>
                  <select
                    value={programForm.status}
                    onChange={(e) => setProgramForm({ ...programForm, status: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="OPEN">OPEN (Accepting Applications)</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="DRAFT">DRAFT (Hidden from Portal)</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!programForm.isFeatured}
                      onChange={(e) => setProgramForm({ ...programForm, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Feature on Landing & Portal</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProgramModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {editingProgramId ? 'Update Opening' : 'Publish Opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DEDICATED DELETE CONFIRMATION MODAL ─── */}
      {deletingOpening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/50 p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Delete Career Opening?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This action is permanent and cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeletingOpening(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">{deletingOpening.title}</div>
              <div className="text-[11px] text-slate-500 font-mono">Slug: /{deletingOpening.slug}</div>
              <div className="text-[11px] text-slate-500">
                Domain: {deletingOpening.domain} &bull; Openings: {deletingOpening.openings}
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Deleting this opening will remove it from the public Careers portal. Any historical applications submitted for this role may lose their program reference.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isDeletingOpening}
                onClick={() => setDeletingOpening(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
              >
                Keep Opening
              </button>
              <button
                type="button"
                disabled={isDeletingOpening}
                onClick={handleConfirmDeleteOpening}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isDeletingOpening ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Yes, Delete Opening</span>
              </button>
            </div>
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
