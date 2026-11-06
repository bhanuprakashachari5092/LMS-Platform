import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  internshipService,
  type Internship,
  type InternshipApplication,
  type InternshipAnalytics,
} from '@/services/internshipService';
import { CareersPreviewModal } from '@/components/careers/CareersPreviewModal';
import { DEFAULT_CAREER_OPENINGS } from '@/services/careersService';

export const AdminInternships: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'analytics' | 'programs' | 'applicants'>('programs');

  // Analytics
  const [analytics, setAnalytics] = useState<InternshipAnalytics | null>(null);

  // Programs state
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogStatusFilter, setCatalogStatusFilter] = useState<string>('ALL');
  const [catalogDomainFilter, setCatalogDomainFilter] = useState<string>('ALL');
  const [catalogDepartmentFilter, setCatalogDepartmentFilter] = useState<string>('ALL');
  const [catalogEmploymentTypeFilter, setCatalogEmploymentTypeFilter] = useState<string>('ALL');
  const [catalogViewMode, setCatalogViewMode] = useState<'grid' | 'table'>('grid');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [deletingOpening, setDeletingOpening] = useState<Internship | null>(null);
  const [isDeletingOpening, setIsDeletingOpening] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [statusPatchingId, setStatusPatchingId] = useState<string | null>(null);

  // Multi-Select & Bulk Actions
  const [selectedOppIds, setSelectedOppIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);
  const [bulkActionLoading, setBulkActionLoading] = useState<boolean>(false);

  // Catalog Sorting, Filtering & Pagination
  const [catalogSortBy, setCatalogSortBy] = useState<'title' | 'createdAt' | 'applications' | 'openings'>('createdAt');
  const [catalogSortOrder, setCatalogSortOrder] = useState<'asc' | 'desc'>('desc');
  const [catalogWorkModeFilter, setCatalogWorkModeFilter] = useState<string>('ALL');
  const [catalogPage, setCatalogPage] = useState<number>(1);
  const [catalogRowsPerPage, setCatalogRowsPerPage] = useState<number>(10);

  // Applicants state
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [applicantFilterStatus, setApplicantFilterStatus] = useState<string>('ALL');
  const [applicantSearch, setApplicantSearch] = useState('');
  const [exportingCsv, setExportingCsv] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

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
    curriculum: '',
    responsibilities: '',
    learningOutcomes: '',
    status: 'OPEN',
    isFeatured: true,
  });

  // Application Detail Modal (with internal notes)
  const [inspectingApp, setInspectingApp] = useState<InternshipApplication | null>(null);
  const [inspectingStatus, setInspectingStatus] = useState<string>('New');
  const [notifyCandidateEmail, setNotifyCandidateEmail] = useState<boolean>(true);
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
      setInternships(programsData && Array.isArray(programsData.content) ? programsData.content : []);
      setApplications(appsData.content || []);
    } catch (err) {
      console.error('Failed to load admin internship portal data:', err);
    } finally {
      setLoadingPrograms(false);
      setLoadingApplicants(false);
    }
  };

  const handleSyncGoogleSheets = async () => {
    setIsSyncingSheets(true);
    try {
      const res = await internshipService.adminSyncApplicationsWithGoogleSheets();
      toast.success(res.message || 'Applications synchronized with Google Sheets successfully!');
      setLastSyncedTime(new Date().toLocaleTimeString());
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to sync with Google Sheets');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Poll applications every 60 seconds while viewing the Applicants tab
  useEffect(() => {
    if (activeTab === 'applicants') {
      const interval = setInterval(() => {
        loadData();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

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
    navigate('/admin/internships/new');
  };

  const handleOpenEditModal = (prog: Internship) => {
    navigate(`/admin/internships/edit/${prog.id}`);
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
    const targetId = deletingOpening.id;
    const targetTitle = deletingOpening.title;
    setIsDeletingOpening(true);

    // Optimistically remove from state immediately
    setInternships((prev) => prev.filter((id) => id.id !== targetId));
    setSelectedOppIds((prev) => prev.filter((id) => id !== targetId));
    setDeletingOpening(null);

    try {
      await internshipService.adminDeleteInternship(targetId);
      toast.success(`Opening "${targetTitle}" deleted.`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete opening');
      await loadData();
    } finally {
      setIsDeletingOpening(false);
    }
  };

  const getApplicationCountForInternship = (prog: Internship): number => {
    return applications.filter(
      (app) =>
        app.internshipId === prog.id ||
        (app.internshipTitle && prog.title && app.internshipTitle.trim().toLowerCase() === prog.title.trim().toLowerCase())
    ).length;
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'archive' | 'feature' | 'unfeature' | 'delete') => {
    if (selectedOppIds.length === 0) {
      toast.error('No opportunities selected');
      return;
    }
    if (action === 'delete') {
      setShowBulkDeleteModal(true);
      return;
    }

    setBulkActionLoading(true);
    try {
      const res = await internshipService.adminBulkActionInternships(action, selectedOppIds);
      toast.success(res?.message || `Successfully applied ${action} to ${selectedOppIds.length} openings`);
      setSelectedOppIds([]);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || `Failed to execute bulk ${action}`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedOppIds.length === 0) return;
    const idsToDelete = [...selectedOppIds];
    setBulkActionLoading(true);

    // Optimistically remove from state immediately
    setInternships((prev) => prev.filter((o) => !idsToDelete.includes(o.id)));
    setSelectedOppIds([]);
    setShowBulkDeleteModal(false);

    try {
      const res = await internshipService.adminBulkActionInternships('delete', idsToDelete);
      toast.success(res?.message || `Successfully deleted ${idsToDelete.length} opportunities`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete selected opportunities');
      await loadData();
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string, notes?: string, sendStatusEmail?: boolean) => {
    try {
      await internshipService.adminUpdateApplicationStatus(applicationId, newStatus, notes, sendStatusEmail);
      toast.success(`Candidate status updated to ${newStatus} & synced to Google Sheets`);
      if (inspectingApp && (inspectingApp.id === applicationId || inspectingApp.applicationId === applicationId)) {
        setInspectingApp({ ...inspectingApp, status: newStatus as any, adminNotes: notes });
        setInspectingStatus(newStatus);
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
  const uniqueDepartments = Array.from(new Set(internships.map((i) => i.department).filter(Boolean)));

  const publishedCount = internships.filter(
    (i) => i.status?.toUpperCase() === 'PUBLISHED' || i.status?.toUpperCase() === 'OPEN'
  ).length;
  const draftsCount = internships.filter(
    (i) => i.status?.toUpperCase() === 'DRAFT'
  ).length;

  const filteredInternships = useMemo(() => {
    let list = internships.filter((prog) => {
      const q = catalogSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        prog.title?.toLowerCase().includes(q) ||
        prog.domain?.toLowerCase().includes(q) ||
        prog.slug?.toLowerCase().includes(q) ||
        prog.requiredSkills?.toLowerCase().includes(q) ||
        (prog.department && prog.department.toLowerCase().includes(q));

      const matchesStatus =
        catalogStatusFilter === 'ALL' ||
        prog.status?.toUpperCase() === catalogStatusFilter.toUpperCase();

      const matchesDomain =
        catalogDomainFilter === 'ALL' ||
        prog.domain === catalogDomainFilter;

      const matchesDepartment =
        catalogDepartmentFilter === 'ALL' ||
        prog.department === catalogDepartmentFilter;

      const matchesEmploymentType =
        catalogEmploymentTypeFilter === 'ALL' ||
        (prog.employmentType || 'INTERNSHIP') === catalogEmploymentTypeFilter;

      const matchesWorkMode =
        catalogWorkModeFilter === 'ALL' ||
        (prog.internshipType || 'REMOTE').toUpperCase() === catalogWorkModeFilter.toUpperCase();

      return matchesSearch && matchesStatus && matchesDomain && matchesDepartment && matchesEmploymentType && matchesWorkMode;
    });

    list = [...list].sort((a, b) => {
      let comparison = 0;
      if (catalogSortBy === 'title') {
        comparison = (a.title || '').localeCompare(b.title || '');
      } else if (catalogSortBy === 'openings') {
        comparison = (Number(a.openings) || 0) - (Number(b.openings) || 0);
      } else if (catalogSortBy === 'applications') {
        comparison = getApplicationCountForInternship(a) - getApplicationCountForInternship(b);
      } else {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        comparison = dateA - dateB;
      }
      return catalogSortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [
    internships,
    catalogSearch,
    catalogStatusFilter,
    catalogDomainFilter,
    catalogDepartmentFilter,
    catalogEmploymentTypeFilter,
    catalogWorkModeFilter,
    catalogSortBy,
    catalogSortOrder,
    applications,
  ]);

  const totalCatalogPages = Math.max(1, Math.ceil(filteredInternships.length / catalogRowsPerPage));
  const paginatedInternships = useMemo(() => {
    const start = (catalogPage - 1) * catalogRowsPerPage;
    return filteredInternships.slice(start, start + catalogRowsPerPage);
  }, [filteredInternships, catalogPage, catalogRowsPerPage]);

  const isAllCurrentPageSelected =
    paginatedInternships.length > 0 &&
    paginatedInternships.every((p) => selectedOppIds.includes(p.id));

  const isSomeCurrentPageSelected =
    paginatedInternships.some((p) => selectedOppIds.includes(p.id)) && !isAllCurrentPageSelected;

  const handleToggleSelectAllCurrentPage = () => {
    if (isAllCurrentPageSelected) {
      const pageIds = paginatedInternships.map((p) => p.id);
      setSelectedOppIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedInternships.map((p) => p.id);
      setSelectedOppIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedOppIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedOpportunitiesList = useMemo(() => {
    return internships.filter((i) => selectedOppIds.includes(i.id));
  }, [internships, selectedOppIds]);

  const handleSortClick = (field: 'title' | 'createdAt' | 'applications' | 'openings') => {
    if (catalogSortBy === field) {
      setCatalogSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setCatalogSortBy(field);
      setCatalogSortOrder('desc');
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
            Careers & Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage career opportunities, virtual internships, publication statuses, public previews, and applicant pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Preview how candidates see the public Careers page"
          >
            <Eye className="w-4 h-4 text-blue-500" />
            <span>Preview Public Page</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Opportunity</span>
          </button>
        </div>
      </div>

      {/* ─── TOP KPI SUMMARY METRIC CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Openings</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {internships.length}
            </div>
            <span className="text-[10px] text-slate-400">All registered listings</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Published Openings</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {publishedCount}
            </div>
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">Active on public portal</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Draft Opportunities</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {draftsCount}
            </div>
            <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80">Unpublished / in progress</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Applications</span>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
              {applications.length || analytics?.totalApplications || 0}
            </div>
            <span className="text-[10px] text-slate-400">Applicant directory records</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>
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
          {/* Status Breakdown KPI Cards (7 required statuses) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            <button
              type="button"
              onClick={() => setApplicantFilterStatus('ALL')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                applicantFilterStatus === 'ALL'
                  ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-500 ring-1 ring-blue-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase">Total Apps</div>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{applications.length}</div>
            </button>

            <button
              type="button"
              onClick={() => setApplicantFilterStatus('SUBMITTED')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                applicantFilterStatus === 'SUBMITTED' || applicantFilterStatus === 'New'
                  ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-500 ring-1 ring-blue-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-bold text-blue-500 uppercase">New</div>
              <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">
                {applications.filter((a) => a.status === 'New' || a.status === 'SUBMITTED').length}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setApplicantFilterStatus('UNDER_REVIEW')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                applicantFilterStatus === 'UNDER_REVIEW' || applicantFilterStatus === 'Under Review'
                  ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-500 ring-1 ring-amber-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-bold text-amber-500 uppercase">Under Review</div>
              <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {applications.filter((a) => a.status === 'Under Review' || a.status === 'UNDER_REVIEW').length}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setApplicantFilterStatus('SHORTLISTED')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                applicantFilterStatus === 'SHORTLISTED' || applicantFilterStatus === 'Shortlisted'
                  ? 'bg-purple-50 dark:bg-purple-950/70 border-purple-500 ring-1 ring-purple-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-bold text-purple-500 uppercase">Shortlisted</div>
              <div className="text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5">
                {applications.filter((a) => a.status === 'Shortlisted' || a.status === 'SHORTLISTED').length}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setApplicantFilterStatus('INTERVIEW')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                applicantFilterStatus === 'INTERVIEW' || applicantFilterStatus === 'Interview Scheduled'
                  ? 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-500 ring-1 ring-cyan-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-bold text-cyan-500 uppercase">Interview</div>
              <div className="text-lg font-black text-cyan-600 dark:text-cyan-400 mt-0.5">
                {applications.filter((a) => a.status === 'Interview Scheduled' || a.status === 'INTERVIEW_SCHEDULED' || a.status === 'INTERVIEW').length}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setApplicantFilterStatus('SELECTED')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                applicantFilterStatus === 'SELECTED' || applicantFilterStatus === 'Selected'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 ring-1 ring-emerald-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-bold text-emerald-500 uppercase">Selected</div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {applications.filter((a) => a.status === 'Selected' || a.status === 'SELECTED').length}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setApplicantFilterStatus('REJECTED')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                applicantFilterStatus === 'REJECTED' || applicantFilterStatus === 'Rejected'
                  ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-500 ring-1 ring-rose-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-bold text-rose-500 uppercase">Rejected</div>
              <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">
                {applications.filter((a) => a.status === 'Rejected' || a.status === 'REJECTED').length}
              </div>
            </button>
          </div>

          {/* Filters Bar & Google Sheets Sync */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            {/* Google Sheets Connection Pill */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span><strong>Google Sheets Source:</strong> 1og9L7aU0R4... &bull; <strong>Tab:</strong> Applications</span>
              {lastSyncedTime && <span className="text-[10px] text-slate-400 hidden sm:inline">(Last synced: {lastSyncedTime})</span>}
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={applicantSearch}
                  onChange={(e) => setApplicantSearch(e.target.value)}
                  placeholder="Search candidate, ID, role..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-blue-500"
                />
              </form>

              {/* Sync with Google Sheets Button */}
              <button
                type="button"
                onClick={handleSyncGoogleSheets}
                disabled={isSyncingSheets}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50 shadow-xs"
                title="Synchronize applicant records directly with Google Sheets (1og9L7aU0R4_30uavzj17PZGAlGFt70VxVEwJ1WKKy_w)"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
                <span>{isSyncingSheets ? 'Syncing...' : 'Sync with Google Sheets'}</span>
              </button>

              {/* CSV Export Button */}
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={exportingCsv}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                title="Export applicant directory to CSV"
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
          {/* Controls Bar: Search, Filters, Sort, View Mode */}
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
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Domain & Department & Work Mode & Type Filters */}
              <div className="flex flex-wrap items-center gap-2">
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

                <select
                  value={catalogDepartmentFilter}
                  onChange={(e) => setCatalogDepartmentFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden"
                >
                  <option value="ALL">All Depts ({uniqueDepartments.length})</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                <select
                  value={catalogWorkModeFilter}
                  onChange={(e) => setCatalogWorkModeFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden"
                >
                  <option value="ALL">All Modes</option>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ONSITE">On-site</option>
                </select>

                <select
                  value={catalogEmploymentTypeFilter}
                  onChange={(e) => setCatalogEmploymentTypeFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden"
                >
                  <option value="ALL">All Types</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                </select>

                {/* Sort By Dropdown */}
                <select
                  value={`${catalogSortBy}-${catalogSortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-') as [any, any];
                    setCatalogSortBy(field);
                    setCatalogSortOrder(order);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="title-asc">Title: A-Z</option>
                  <option value="title-desc">Title: Z-A</option>
                  <option value="applications-desc">Most Applications</option>
                  <option value="openings-desc">Most Openings</option>
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
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                  title="Preview how candidates see the public Careers page"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span>Preview</span>
                </button>

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

            {/* Status Filter Pills & Selection Counter */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Status:
                </span>
                {(['ALL', 'OPEN', 'CLOSED', 'DRAFT', 'ARCHIVED'] as const).map((st) => {
                  const count =
                    st === 'ALL'
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
                      <span className="ml-1 text-[10px] opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
                {selectedOppIds.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
                    {selectedOppIds.length} of {internships.length} selected
                  </span>
                )}
                <span>
                  Showing {filteredInternships.length === 0 ? 0 : (catalogPage - 1) * catalogRowsPerPage + 1}–
                  {Math.min(catalogPage * catalogRowsPerPage, filteredInternships.length)} of {filteredInternships.length} openings
                </span>
              </div>
            </div>
          </div>

          {/* Catalog Body */}
          {loadingPrograms ? (
            /* Loading Skeletons */
            catalogViewMode === 'table' ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs p-4 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            )
          ) : filteredInternships.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 space-y-3 bg-white dark:bg-slate-900">
              <Briefcase className="w-10 h-10 mx-auto text-slate-400 stroke-1" />
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No career openings match your filters</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing your search query or changing your status, domain, and work mode filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCatalogSearch('');
                  setCatalogStatusFilter('ALL');
                  setCatalogDomainFilter('ALL');
                  setCatalogDepartmentFilter('ALL');
                  setCatalogEmploymentTypeFilter('ALL');
                  setCatalogWorkModeFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : catalogViewMode === 'grid' ? (
            /* ── GRID CARDS VIEW ── */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedInternships.map((prog) => {
                const isOpen = prog.status === 'OPEN' || prog.status === 'PUBLISHED';
                const isDraft = prog.status === 'DRAFT';
                const isSelected = selectedOppIds.includes(prog.id);
                const appCount = getApplicationCountForInternship(prog);

                return (
                  <div
                    key={prog.id}
                    className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between space-y-4 group ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md bg-blue-50/10'
                        : 'border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md'
                    }`}
                  >
                    {/* Top Row: Checkbox, Domain, Status Dropdown, Featured Toggle */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectOne(prog.id)}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-700 cursor-pointer"
                          />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            {prog.department || 'Engineering'} &bull; {prog.domain}
                          </span>
                        </div>

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
                            <option value="PUBLISHED">PUBLISHED</option>
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
                        <span className="text-[10px] text-slate-400 font-mono">/{prog.slug}</span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {prog.description || 'Structured professional curriculum with real-world production deliverables.'}
                      </p>

                      {/* Badges: Mode, Duration, Openings, Applications, Stipend */}
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
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                          {appCount} {appCount === 1 ? 'Applicant' : 'Applicants'}
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
                          {prog.requiredSkills.split(',').slice(0, 3).map((sk, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-50 dark:bg-slate-800/80 text-slate-500 border border-slate-200/60 dark:border-slate-800"
                            >
                              {sk.trim()}
                            </span>
                          ))}
                          {prog.requiredSkills.split(',').length > 3 && (
                            <span className="text-[9px] text-slate-400 self-center">
                              +{prog.requiredSkills.split(',').length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`/careers#${prog.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View on Public Careers Portal"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(prog)}
                          title="Edit opening details"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

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
                        onClick={() => handlePatchOpeningStatus(prog.id, isOpen ? 'CLOSED' : 'PUBLISHED')}
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
            /* ── RECRUITER TABLE VIEW (12 Columns) ── */
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {/* 1. Checkbox */}
                    <th className="py-3 px-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllCurrentPageSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isSomeCurrentPageSelected;
                        }}
                        onChange={handleToggleSelectAllCurrentPage}
                        title="Select/Deselect all on this page"
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-700 cursor-pointer"
                      />
                    </th>

                    {/* 2. Title */}
                    <th
                      onClick={() => handleSortClick('title')}
                      className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Internship Title</span>
                        {catalogSortBy === 'title' ? (
                          catalogSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-500" /> : <ArrowDown className="w-3 h-3 text-blue-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                        )}
                      </div>
                    </th>

                    {/* 3. Domain */}
                    <th className="py-3 px-3.5 whitespace-nowrap">Domain</th>

                    {/* 4. Department */}
                    <th className="py-3 px-3.5 whitespace-nowrap">Department</th>

                    {/* 5. Employment Type */}
                    <th className="py-3 px-3.5 whitespace-nowrap">Type</th>

                    {/* 6. Work Mode */}
                    <th className="py-3 px-3.5 whitespace-nowrap">Mode</th>

                    {/* 7. Openings */}
                    <th
                      onClick={() => handleSortClick('openings')}
                      className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1">
                        <span>Openings</span>
                        {catalogSortBy === 'openings' ? (
                          catalogSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-500" /> : <ArrowDown className="w-3 h-3 text-blue-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                        )}
                      </div>
                    </th>

                    {/* 8. Applications (Live count) */}
                    <th
                      onClick={() => handleSortClick('applications')}
                      className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1">
                        <span>Applications</span>
                        {catalogSortBy === 'applications' ? (
                          catalogSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-500" /> : <ArrowDown className="w-3 h-3 text-blue-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                        )}
                      </div>
                    </th>

                    {/* 9. Status */}
                    <th className="py-3 px-3.5 whitespace-nowrap">Status</th>

                    {/* 10. Featured */}
                    <th className="py-3 px-3.5 text-center whitespace-nowrap">Featured</th>

                    {/* 11. Last Updated */}
                    <th
                      onClick={() => handleSortClick('createdAt')}
                      className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1">
                        <span>Last Updated</span>
                        {catalogSortBy === 'createdAt' ? (
                          catalogSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-500" /> : <ArrowDown className="w-3 h-3 text-blue-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                        )}
                      </div>
                    </th>

                    {/* 12. Actions */}
                    <th className="py-3 px-3.5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedInternships.map((prog) => {
                    const isOpen = prog.status === 'OPEN' || prog.status === 'PUBLISHED';
                    const isDraft = prog.status === 'DRAFT';
                    const isSelected = selectedOppIds.includes(prog.id);
                    const appCount = getApplicationCountForInternship(prog);
                    const dateFormatted = prog.updatedAt
                      ? new Date(prog.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                      : prog.createdAt
                      ? new Date(prog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Recent';

                    return (
                      <tr
                        key={prog.id}
                        className={`transition-colors ${
                          isSelected
                            ? 'bg-blue-50/60 dark:bg-blue-950/30'
                            : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* 1. Checkbox */}
                        <td className="py-3.5 px-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectOne(prog.id)}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-700 cursor-pointer"
                          />
                        </td>

                        {/* 2. Title & Slug */}
                        <td className="py-3.5 px-3.5 font-semibold text-slate-900 dark:text-white min-w-[200px]">
                          <div
                            onClick={() => handleOpenEditModal(prog)}
                            className="font-bold hover:text-blue-600 cursor-pointer transition-colors"
                          >
                            {prog.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">/{prog.slug}</div>
                        </td>

                        {/* 3. Domain */}
                        <td className="py-3.5 px-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap font-medium">
                          {prog.domain}
                        </td>

                        {/* 4. Department */}
                        <td className="py-3.5 px-3.5 text-slate-500 whitespace-nowrap">
                          {prog.department || 'Engineering'}
                        </td>

                        {/* 5. Employment Type */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {prog.employmentType || 'INTERNSHIP'}
                          </span>
                        </td>

                        {/* 6. Work Mode */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              prog.internshipType?.toUpperCase() === 'REMOTE'
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                                : prog.internshipType?.toUpperCase() === 'HYBRID'
                                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                                : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300'
                            }`}
                          >
                            {prog.internshipType || 'REMOTE'}
                          </span>
                        </td>

                        {/* 7. Openings */}
                        <td className="py-3.5 px-3.5 text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">
                          {prog.openings}
                        </td>

                        {/* 8. Live Applications */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('applicants');
                              setApplicantSearch(prog.title);
                            }}
                            title="View applicants for this role"
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-[11px] cursor-pointer transition-colors"
                          >
                            <Users className="w-3 h-3" />
                            <span>{appCount}</span>
                          </button>
                        </td>

                        {/* 9. Status */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
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
                            <option value="PUBLISHED">PUBLISHED</option>
                            <option value="CLOSED">CLOSED</option>
                            <option value="DRAFT">DRAFT</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                          </select>
                        </td>

                        {/* 10. Featured */}
                        <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
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

                        {/* 11. Last Updated */}
                        <td className="py-3.5 px-3.5 text-slate-500 text-[11px] whitespace-nowrap">
                          {dateFormatted}
                        </td>

                        {/* 12. Actions */}
                        <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
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

          {/* ── PAGINATION CONTROLS ── */}
          {filteredInternships.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span className="font-medium">
                  Showing {(catalogPage - 1) * catalogRowsPerPage + 1} to{' '}
                  {Math.min(catalogPage * catalogRowsPerPage, filteredInternships.length)} of{' '}
                  {filteredInternships.length} listings
                </span>

                <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-3">
                  <span className="text-[11px] text-slate-400">Rows:</span>
                  {[10, 25, 50].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setCatalogRowsPerPage(size);
                        setCatalogPage(1);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                        catalogRowsPerPage === size
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page numbers and Prev/Next */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={catalogPage <= 1}
                  onClick={() => setCatalogPage(1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  title="First page"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={catalogPage <= 1}
                  onClick={() => setCatalogPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 font-medium"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="px-3 py-1 text-slate-800 dark:text-slate-200 font-bold">
                  Page {catalogPage} of {totalCatalogPages}
                </div>

                <button
                  type="button"
                  disabled={catalogPage >= totalCatalogPages}
                  onClick={() => setCatalogPage((p) => Math.min(totalCatalogPages, p + 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 font-medium"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={catalogPage >= totalCatalogPages}
                  onClick={() => setCatalogPage(totalCatalogPages)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  title="Last page"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ── FLOATING BULK ACTION TOOLBAR (When 1+ selected) ── */}
          {selectedOppIds.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3.5 flex-wrap max-w-4xl animate-in slide-in-from-bottom-5 duration-200">
              <div className="flex items-center gap-2 pr-2 border-r border-slate-700 text-xs font-bold whitespace-nowrap">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                  {selectedOppIds.length}
                </span>
                <span>Selected</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  disabled={bulkActionLoading}
                  onClick={() => handleBulkAction('publish')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Publish</span>
                </button>
                <button
                  type="button"
                  disabled={bulkActionLoading}
                  onClick={() => handleBulkAction('unpublish')}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Draft</span>
                </button>
                <button
                  type="button"
                  disabled={bulkActionLoading}
                  onClick={() => handleBulkAction('archive')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 border border-slate-700"
                >
                  <span>Archive</span>
                </button>
                <button
                  type="button"
                  disabled={bulkActionLoading}
                  onClick={() => handleBulkAction('feature')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 border border-amber-500/30"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span>Feature</span>
                </button>
                <button
                  type="button"
                  disabled={bulkActionLoading}
                  onClick={() => handleBulkAction('unfeature')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 border border-slate-700"
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>Unfeature</span>
                </button>
                <button
                  type="button"
                  disabled={bulkActionLoading}
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOppIds([])}
                className="ml-auto text-xs text-slate-400 hover:text-white transition-colors cursor-pointer underline underline-offset-2"
              >
                Deselect All
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── 3. ANALYTICS & REPORTS TAB ─── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Opportunities</span>
                <Briefcase className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {analytics?.totalOpportunities ?? analytics?.totalInternships ?? programs.length}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {analytics?.publishedOpportunities ?? programs.filter((p) => p.status === 'PUBLISHED').length} Published
                </span>
                <span>•</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {analytics?.draftInternships ?? programs.filter((p) => p.status === 'DRAFT').length} Drafts
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Applications</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {analytics?.totalApplications ?? applications.length}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Google Sheets Sync Active</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">In Pipeline</span>
                <Clock className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
                {(analytics?.shortlisted ?? applications.filter((a) => a.status === 'Shortlisted' || a.status === 'SHORTLISTED').length) +
                  (analytics?.interviewScheduled ?? applications.filter((a) => a.status === 'Interview Scheduled' || a.status === 'INTERVIEW_SCHEDULED').length)}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="font-medium text-purple-500">
                  {analytics?.shortlisted ?? applications.filter((a) => a.status === 'Shortlisted' || a.status === 'SHORTLISTED').length} Shortlisted
                </span>
                <span>•</span>
                <span className="font-medium text-amber-500">
                  {analytics?.interviewScheduled ?? applications.filter((a) => a.status === 'Interview Scheduled' || a.status === 'INTERVIEW_SCHEDULED').length} Interview
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Selected / Offers</span>
                <Award className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {analytics?.selected ?? applications.filter((a) => a.status === 'Selected' || a.status === 'ACCEPTED').length}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  {analytics?.totalApplications
                    ? Math.round(((analytics?.selected || 0) / analytics.totalApplications) * 100)
                    : 0}
                  % Selection Conversion
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Recruitment Funnel Pipeline */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <span>Application Status Funnel</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Real-time candidate progression through the recruitment pipeline</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                {analytics?.totalApplications ?? applications.length} Candidates Recorded
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              {[
                {
                  label: 'New Submissions',
                  count: analytics?.newApplications ?? applications.filter((a) => a.status === 'New' || a.status === 'SUBMITTED').length,
                  color: 'text-blue-600 dark:text-blue-400',
                  bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50',
                },
                {
                  label: 'Under Review',
                  count: analytics?.underReview ?? applications.filter((a) => a.status === 'Under Review' || a.status === 'UNDER_REVIEW').length,
                  color: 'text-amber-600 dark:text-amber-400',
                  bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50',
                },
                {
                  label: 'Shortlisted',
                  count: analytics?.shortlisted ?? applications.filter((a) => a.status === 'Shortlisted' || a.status === 'SHORTLISTED').length,
                  color: 'text-purple-600 dark:text-purple-400',
                  bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/50',
                },
                {
                  label: 'Interview Scheduled',
                  count: analytics?.interviewScheduled ?? applications.filter((a) => a.status === 'Interview Scheduled' || a.status === 'INTERVIEW_SCHEDULED').length,
                  color: 'text-cyan-600 dark:text-cyan-400',
                  bg: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900/50',
                },
                {
                  label: 'Selected',
                  count: analytics?.selected ?? applications.filter((a) => a.status === 'Selected' || a.status === 'ACCEPTED').length,
                  color: 'text-emerald-600 dark:text-emerald-400',
                  bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50',
                },
                {
                  label: 'Rejected',
                  count: analytics?.rejected ?? applications.filter((a) => a.status === 'Rejected' || a.status === 'REJECTED').length,
                  color: 'text-rose-600 dark:text-rose-400',
                  bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50',
                },
              ].map((stage, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${stage.bg} flex flex-col justify-between`}>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stage.label}</span>
                  <div className={`text-2xl font-black ${stage.color} mt-2`}>{stage.count}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {applications.length > 0 ? Math.round((stage.count / applications.length) * 100) : 0}% of pool
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown Distributions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications by Opportunity */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                <span>Applications by Opportunity</span>
              </h4>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {Object.entries(
                  analytics?.applicationsByOpportunity ||
                    applications.reduce((acc, a) => {
                      const key = a.internshipTitle || a.position || 'General';
                      acc[key] = (acc[key] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                ).length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No applications recorded yet.</p>
                ) : (
                  Object.entries(
                    analytics?.applicationsByOpportunity ||
                      applications.reduce((acc, a) => {
                        const key = a.internshipTitle || a.position || 'General';
                        acc[key] = (acc[key] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                  ).map(([title, count]) => {
                    const total = applications.length || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={title} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[260px]">{title}</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Applications by Department / Domain */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" />
                <span>Applications by Department & Domain</span>
              </h4>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {Object.entries(
                  analytics?.applicationsByDepartment ||
                    analytics?.applicationsByDomain ||
                    applications.reduce((acc, a) => {
                      const key = a.department || 'Engineering';
                      acc[key] = (acc[key] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                ).length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No departmental data available yet.</p>
                ) : (
                  Object.entries(
                    analytics?.applicationsByDepartment ||
                      analytics?.applicationsByDomain ||
                      applications.reduce((acc, a) => {
                        const key = a.department || 'Engineering';
                        acc[key] = (acc[key] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                  ).map(([dept, count]) => {
                    const total = applications.length || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={dept} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{dept}</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
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

                {/* Employment Type & Work Mode */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Employment Type *</label>
                  <select
                    value={programForm.employmentType || 'INTERNSHIP'}
                    onChange={(e) => setProgramForm({ ...programForm, employmentType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="INTERNSHIP">Internship</option>
                    <option value="FULL_TIME">Full-time</option>
                    <option value="PART_TIME">Part-time</option>
                  </select>
                </div>

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

                {/* Duration & Application Deadline */}
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

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Application Deadline</label>
                  <input
                    type="text"
                    value={programForm.deadline || ''}
                    onChange={(e) => setProgramForm({ ...programForm, deadline: e.target.value })}
                    placeholder="e.g. 2027-01-01 / Rolling Basis"
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
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Role Overview / Short Description *</label>
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
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Key Responsibilities / Detailed Description</label>
                  <textarea
                    rows={3}
                    value={programForm.responsibilities}
                    onChange={(e) => setProgramForm({ ...programForm, responsibilities: e.target.value })}
                    placeholder="• Implement reusable responsive components&#10;• Integrate REST APIs and state management&#10;• Write unit tests with Vitest and participate in code reviews"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:border-blue-500 focus:outline-hidden resize-none font-mono text-[11px]"
                  />
                </div>

                {/* Curriculum / Structured Milestones */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Internship Curriculum & Weekly Milestones
                  </label>
                  <textarea
                    rows={3}
                    value={programForm.curriculum || ''}
                    onChange={(e) => setProgramForm({ ...programForm, curriculum: e.target.value })}
                    placeholder="Week 1-3: Core Environment & Abstractions&#10;Week 4-6: REST APIs, PostgreSQL Schemas & Authentication&#10;Week 7-9: Testing, CI/CD & Security Audits&#10;Week 10-12: Capstone Deliverables & Production Deployment"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:border-blue-500 focus:outline-hidden resize-none font-mono text-[11px]"
                  />
                </div>

                {/* Curriculum / Learning Outcomes */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Learning Outcomes & Deliverables</label>
                  <textarea
                    rows={2}
                    value={programForm.learningOutcomes || ''}
                    onChange={(e) => setProgramForm({ ...programForm, learningOutcomes: e.target.value })}
                    placeholder="Core competencies gained, real-world portfolio deliverables, and architectural standards..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:border-blue-500 focus:outline-hidden resize-none font-mono text-[11px]"
                  />
                </div>

                {/* Application Form Configuration Note */}
                <div className="sm:col-span-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-700 dark:text-blue-300">
                  <strong className="block font-bold mb-0.5">Application Form Pipeline:</strong>
                  Applications for this opening connect to the Google Sheets database with automated branded candidate confirmation and HR email notifications.
                </div>

                {/* Status & Featured Controls */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Publication Status</label>
                  <select
                    value={programForm.status}
                    onChange={(e) => setProgramForm({ ...programForm, status: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="OPEN">OPEN / PUBLISHED (Accepting Applications)</option>
                    <option value="PUBLISHED">PUBLISHED</option>
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

                {/* Timestamps in edit mode */}
                {editingProgramId && programForm.createdAt && (
                  <div className="sm:col-span-2 text-[10px] text-slate-400 pt-1">
                    Created: {new Date(programForm.createdAt).toLocaleString()}
                  </div>
                )}
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

      {/* ─── DEDICATED BULK DELETE CONFIRMATION MODAL ─── */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Delete {selectedOppIds.length} Opportunities?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  You are about to remove {selectedOppIds.length} listings from the active directory.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 max-h-48 overflow-y-auto space-y-1.5 text-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Selected Opportunities:
              </div>
              {selectedOpportunitiesList.map((opp) => (
                <div key={opp.id} className="flex items-center justify-between text-slate-700 dark:text-slate-300 py-1 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                  <span className="font-medium truncate max-w-[280px]">{opp.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">/{opp.slug}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <p className="leading-relaxed text-[11px]">
                <strong>Candidate Data Safe:</strong> All candidate applications, evaluation logs, and Google Sheet records remain completely intact and will NOT be deleted.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={bulkActionLoading}
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={bulkActionLoading}
                onClick={handleConfirmBulkDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {bulkActionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Confirm Delete ({selectedOppIds.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CANDIDATE INSPECT & INTERNAL NOTES MODAL ─── */}
      {inspectingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{inspectingApp.fullName}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    {inspectingApp.status}
                  </span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Application ID: {inspectingApp.applicationId || inspectingApp.referenceNumber || inspectingApp.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectingApp(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              {/* Contact & Position Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
                <div><strong>Applied Position:</strong> <span className="text-blue-600 dark:text-blue-400 font-bold">{inspectingApp.internshipTitle || inspectingApp.position}</span></div>
                <div><strong>Department:</strong> {inspectingApp.department || 'Engineering'}</div>
                <div><strong>Email:</strong> <a href={`mailto:${inspectingApp.email}`} className="text-blue-500 hover:underline">{inspectingApp.email}</a></div>
                <div><strong>Phone:</strong> <a href={`tel:${inspectingApp.phone}`} className="text-slate-700 dark:text-slate-300">{inspectingApp.phone}</a></div>
                <div><strong>Institution / College:</strong> {inspectingApp.college || 'Not specified'}</div>
                <div><strong>Degree & Year:</strong> {inspectingApp.degree ? `${inspectingApp.degree} (${inspectingApp.currentYear || ''})` : 'Not specified'}</div>
              </div>

              {/* Skills */}
              {inspectingApp.skills && (
                <div>
                  <strong className="block text-slate-700 dark:text-slate-200 mb-1">Key Skills & Technologies:</strong>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectingApp.skills.split(',').map((sk, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                        {sk.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links: Resume, LinkedIn, GitHub, Portfolio */}
              <div>
                <strong className="block text-slate-700 dark:text-slate-200 mb-1.5">Candidate Profiles & Attachments:</strong>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {inspectingApp.resumeUrl && inspectingApp.resumeUrl !== 'Not Provided' ? (
                    <a
                      href={inspectingApp.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-blue-500 transition-colors shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open / Download Resume</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Resume: Not Provided</span>
                  )}

                  {inspectingApp.linkedinUrl && (
                    <a
                      href={inspectingApp.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>LinkedIn</span>
                    </a>
                  )}

                  {inspectingApp.githubUrl && (
                    <a
                      href={inspectingApp.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>GitHub</span>
                    </a>
                  )}

                  {inspectingApp.portfolioUrl && (
                    <a
                      href={inspectingApp.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Portfolio</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              {(inspectingApp.statementOfPurpose || inspectingApp.coverLetter) && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <strong className="block text-slate-800 dark:text-slate-200 mb-1">Cover Letter / Statement of Purpose:</strong>
                  <p className="leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                    {inspectingApp.statementOfPurpose || inspectingApp.coverLetter}
                  </p>
                </div>
              )}

              {/* Status Update & Recruiter Notes Section */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Update Application Status (Synchronizes to Google Sheets)
                    </label>
                    <select
                      value={inspectingStatus}
                      onChange={(e) => setInspectingStatus(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="New">New</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="pt-2 sm:pt-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                      <input
                        type="checkbox"
                        checked={notifyCandidateEmail}
                        onChange={(e) => setNotifyCandidateEmail(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Email candidate on status change</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Recruiter Internal Notes (Private to Admin Panel)
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotesInput}
                    onChange={(e) => setAdminNotesInput(e.target.value)}
                    placeholder="Candidate technical rubric score, interview notes, or evaluation feedback..."
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:border-blue-500 focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setSchedulingApp(inspectingApp);
                    setInspectingApp(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Schedule Interview</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInspectingApp(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(inspectingApp.id, inspectingStatus, adminNotesInput, notifyCandidateEmail)}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save & Sync Status</span>
                  </button>
                </div>
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

      {/* ─── PUBLIC CAREERS PREVIEW MODAL ─── */}
      <CareersPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        opportunities={internships}
      />
    </div>
  );
};
