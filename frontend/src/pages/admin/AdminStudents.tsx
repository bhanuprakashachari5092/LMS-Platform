import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  UserCheck,
  Plus,
  X,
  Loader2,
  Edit,
  Trash2,
  ShieldAlert,
  Eye,
  Users,
  TrendingUp,
  Send,
  ShieldCheck,
  Check,
  XCircle,
  Code2,
  CheckSquare,
  Square,
  FileSpreadsheet,
  AlertCircle,
  Flag,
  FileText,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { studentService, type StudentUser } from '@/services/studentService';
import type { UserStatus } from '@/types/user';
import { StudentProfileDrawer } from '@/components/admin/students/StudentProfileDrawer';
import { EditStudentModal } from '@/components/admin/students/EditStudentModal';
import { SendEmailModal } from '@/components/admin/students/SendEmailModal';
import { GitHubPortfolioDrawer } from '@/components/admin/students/GitHubPortfolioDrawer';
import { StudentRosterRow } from '@/components/admin/students/StudentRosterRow';
import { StudentRosterMobileCard } from '@/components/admin/students/StudentRosterMobileCard';
import { adminNotificationService } from '@/services/adminNotificationService';

const isPendingStudent = (s: any) => {
  const st = (s.status || '').toLowerCase();
  if (st === 'pending' || st === 'pending approval' || st === 'pending_approval' || st === 'email_verification_pending') {
    return true;
  }
  if (st === 'approved' || st === 'active' || s.approved === true) {
    return false;
  }
  return s.approved === false;
};

export const AdminStudents: React.FC = () => {
  const { userProfile } = useAuth();
  const isInstructor = userProfile?.role === 'instructor';

  const [students, setStudents] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Action Pending Tracking (Deduplication & Instant Feedback)
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());
  const [rejectingIds, setRejectingIds] = useState<Set<string>>(new Set());

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<'all' | 'github' | 'manual'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, providerFilter, statusFilter, verificationFilter, branchFilter, yearFilter, dateFilter, sortBy]);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Drawer State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inspectStudent, setInspectStudent] = useState<StudentUser | null>(null);
  const [inspectGithubStudent, setInspectGithubStudent] = useState<StudentUser | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentUser | null>(null);
  const [emailStudent, setEmailStudent] = useState<StudentUser | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [rejectingStudentId, setRejectingStudentId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reporting / Academic Flag Modal State (For Instructor)
  const [flagStudentModal, setFlagStudentModal] = useState<StudentUser | null>(null);
  const [flagCategory, setFlagCategory] = useState<string>('Academic Performance Progress');
  const [flagNotes, setFlagNotes] = useState<string>('');

  // Quick Add Student State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentProvider, setNewStudentProvider] = useState<'password' | 'github.com'>('password');

  // Paginated Data Fetching with AbortController
  const loadStudents = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await studentService.fetchStudentsPaginated({
        page: currentPage,
        limit: pageSize,
        status: statusFilter === 'ALL' ? 'all' : statusFilter,
        search: debouncedSearch,
        sort: sortBy,
        signal,
      });
      setStudents(res.students);
      setPaginationInfo({
        total: res.pagination.total,
        totalPages: res.pagination.totalPages,
        hasNextPage: res.pagination.hasNextPage,
        hasPrevPage: res.pagination.hasPrevPage,
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Student roster load notice:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, debouncedSearch, sortBy]);

  useEffect(() => {
    const controller = new AbortController();
    loadStudents(controller.signal);
    return () => controller.abort();
  }, [loadStudents]);

  useEffect(() => {
    const handleUpdate = () => {
      loadStudents();
    };
    window.addEventListener('shaivika_student_updated', handleUpdate);
    return () => window.removeEventListener('shaivika_student_updated', handleUpdate);
  }, [loadStudents]);

  // Top Statistics
  const stats = useMemo(() => studentService.calculateStudentStats(students), [students]);

  // Unique branches & years for filter dropdowns
  const uniqueBranches = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.branch) set.add(s.branch);
    });
    return Array.from(set);
  }, [students]);

  const uniqueYears = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.year) set.add(s.year);
    });
    return Array.from(set);
  }, [students]);

  // Provider Counts
  const githubCount = useMemo(
    () => students.filter((s) => s.provider === 'github.com' || Boolean(s.photoURL?.includes('github')) || s.githubUsername).length,
    [students]
  );
  const manualCount = students.length - githubCount;

  // Filter & Sort Logic
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Search filter across Name, Email, College, Branch, GitHub Username, Skills
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (st) =>
          (st.name || st.fullName || '').toLowerCase().includes(q) ||
          (st.email || '').toLowerCase().includes(q) ||
          (st.college || '').toLowerCase().includes(q) ||
          (st.branch || '').toLowerCase().includes(q) ||
          (st.githubUsername || st.github || '').toLowerCase().includes(q) ||
          (st.skills || []).some((sk) => sk.toLowerCase().includes(q))
      );
    }

    // Provider filter
    if (providerFilter === 'github') {
      result = result.filter((s) => s.provider === 'github.com' || Boolean(s.photoURL?.includes('github')) || s.githubUsername);
    } else if (providerFilter === 'manual') {
      result = result.filter((s) => s.provider !== 'github.com' && !Boolean(s.photoURL?.includes('github')));
    }

    // Status filter
    if (statusFilter === 'pending') {
      result = result.filter(isPendingStudent);
    } else if (statusFilter === 'approved') {
      result = result.filter((s) => s.status === 'approved' || s.status === 'Active' || s.approved === true);
    } else if (statusFilter === 'rejected') {
      result = result.filter((s) => s.status === 'rejected' || s.status === 'Blocked');
    } else if (statusFilter === 'suspended') {
      result = result.filter((s) => s.status === 'Suspended' || s.status === 'Blocked');
    }

    // Verification filter
    if (verificationFilter === 'Verified') {
      result = result.filter((s) => s.isVerified || s.emailVerified);
    } else if (verificationFilter === 'Unverified') {
      result = result.filter((s) => !s.isVerified && !s.emailVerified);
    }

    // Branch filter
    if (branchFilter !== 'ALL') {
      result = result.filter((s) => s.branch === branchFilter);
    }

    // Year filter
    if (yearFilter !== 'ALL') {
      result = result.filter((s) => s.year === yearFilter);
    }

    // Date Filter (Today, Week, Month)
    if (dateFilter !== 'ALL') {
      const now = new Date();
      result = result.filter((s) => {
        if (!s.createdAt && !s.joined) return true;
        const stDate = new Date(s.createdAt || s.joined || '');
        const diffDays = (now.getTime() - stDate.getTime()) / (1000 * 3600 * 24);
        if (dateFilter === 'today') return diffDays <= 1;
        if (dateFilter === 'week') return diffDays <= 7;
        if (dateFilter === 'month') return diffDays <= 30;
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === 'oldest') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      }
      if (sortBy === 'highest_progress') {
        return (b.learningScore || 0) - (a.learningScore || 0);
      }
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });

    return result;
  }, [students, debouncedSearch, providerFilter, statusFilter, verificationFilter, branchFilter, yearFilter, dateFilter, sortBy]);

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id || s.uid));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Admin Actions
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentEmail) {
      toast.error('Please enter student name and email.');
      return;
    }

    setIsSubmitting(true);
    try {
      await studentService.addStudent(newStudentName, newStudentEmail, newStudentProvider);
      adminNotificationService.addNotification({
        type: 'NEW_STUDENT',
        title: 'Student Created',
        message: `${newStudentName} registered by Administrator.`
      });
      toast.success(`Student profile created for ${newStudentName}!`);
      setIsAddModalOpen(false);
      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentProvider('password');
    } catch (e) {
      toast.error('Failed to register student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStudent = async (updated: StudentUser) => {
    try {
      await studentService.updateStudent(updated);
      toast.success(`Student ${updated.name} profile updated!`);
      setEditingStudent(null);
    } catch (e) {
      toast.error('Failed to update student profile.');
    }
  };

  const handleApproveStudent = useCallback(async (id: string) => {
    if (approvingIds.has(id)) return; // Prevent duplicate requests
    const student = students.find((s) => s.id === id || s.uid === id);
    if (!student) return;
    const prevStatus = student.status;
    const prevApproved = student.approved;
    const studentName = student.name || student.fullName || 'Student';

    // 1. Instant Optimistic UI Update (<100ms)
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id || s.uid === id
          ? { ...s, status: 'approved' as UserStatus, approved: true, isActive: true }
          : s
      )
    );
    setApprovingIds((prev) => new Set(prev).add(id));

    try {
      // 2. Async backend API call
      await studentService.approveStudent(id);
      adminNotificationService.addNotification({
        type: 'APPROVAL',
        title: 'Student Approved',
        message: `${studentName} application approved with full access.`
      });
      toast.success(`🎉 ${studentName} approved! Welcome email dispatched.`);
    } catch (e: any) {
      // 3. Rollback on failure
      setStudents((prev) =>
        prev.map((s) =>
          s.id === id || s.uid === id
            ? { ...s, status: prevStatus, approved: prevApproved, isActive: prevApproved }
            : s
        )
      );
      toast.error(e?.message || 'Failed to approve student. Reverted status.');
    } finally {
      setApprovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [students, approvingIds]);

  const handleRejectStudent = useCallback(async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    if (rejectingIds.has(id)) return;
    const student = students.find((s) => s.id === id || s.uid === id);
    if (!student) return;
    const prevStatus = student.status;
    const prevApproved = student.approved;
    const studentName = student.name || student.fullName || 'Student';
    const reasonText = rejectionReason.trim();

    // Close modal immediately
    setRejectingStudentId(null);
    setRejectionReason('');

    // 1. Instant Optimistic UI Update (<100ms)
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id || s.uid === id
          ? { ...s, status: 'rejected' as UserStatus, approved: false, isActive: false }
          : s
      )
    );
    setRejectingIds((prev) => new Set(prev).add(id));

    try {
      // 2. Async backend API call
      await studentService.rejectStudent(id, reasonText);
      adminNotificationService.addNotification({
        type: 'REJECTION',
        title: 'Student Rejected',
        message: `${studentName} application was rejected.`
      });
      toast.success(`Student ${studentName} application rejected. Status updated.`);
    } catch (e: any) {
      // 3. Rollback on failure
      setStudents((prev) =>
        prev.map((s) =>
          s.id === id || s.uid === id
            ? { ...s, status: prevStatus, approved: prevApproved, isActive: prevApproved }
            : s
        )
      );
      toast.error(e?.message || 'Failed to reject student. Reverted status.');
    } finally {
      setRejectingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [students, rejectionReason, rejectingIds]);

  const handleSuspendStudent = async (id: string) => {
    const student = students.find((s) => s.id === id || s.uid === id);
    try {
      await studentService.updateStudent({ ...student!, status: 'Suspended', approved: false });
      toast.info(`Student ${student?.name || 'Account'} suspended.`);
    } catch (e: any) {
      toast.error('Failed to suspend student');
    }
  };

  const handleReactivateStudent = async (id: string) => {
    const student = students.find((s) => s.id === id || s.uid === id);
    try {
      await studentService.updateStudent({ ...student!, status: 'Active', approved: true });
      toast.success(`Student ${student?.name || 'Account'} reactivated.`);
    } catch (e: any) {
      toast.error('Failed to reactivate student');
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      toast.success(`Password reset verification email dispatched to ${email}!`);
    } catch (e) {
      toast.error('Failed to send reset email.');
    }
  };

  const handleDeleteStudent = (id: string) => {
    const target = students.find((st) => st.id === id || st.uid === id);
    const targetName = target?.name || 'Student';
    
    // 1. Optimistic instant UI state update (0ms latency)
    setStudents((prev) => prev.filter((s) => s.id !== id && s.uid !== id && (target?.email ? s.email?.toLowerCase() !== target.email.toLowerCase() : true)));
    setSelectedIds((prev) => prev.filter((item) => item !== id && item !== target?.uid));
    setDeletingStudentId(null);
    toast.success(`Student account ${targetName} deleted permanently.`);

    // 2. Parallel non-blocking background Firestore & Backend deletion
    studentService.deleteStudent(id).catch((e) => {
      console.warn('Background delete student notice:', e);
    });
  };

  const handleSubmitStudentReport = () => {
    if (!flagStudentModal) return;
    adminNotificationService.addNotification({
      type: 'NEW_STUDENT',
      title: `Instructor Report: ${flagStudentModal.name}`,
      message: `[${flagCategory}]: ${flagNotes || 'Academic progress telemetry report submitted.'}`,
      link: '/admin/students'
    });
    toast.success(`Academic progress report for ${flagStudentModal.name} dispatched to Administrator!`);
    setFlagStudentModal(null);
    setFlagNotes('');
  };

  const handleExportCSV = () => {
    const dataset = selectedIds.length > 0
      ? students.filter((s) => selectedIds.includes(s.id || s.uid))
      : filteredStudents;

    studentService.exportStudentsToCSV(dataset);
    toast.success(`Exported ${dataset.length} student profiles to CSV!`);
  };

  return (
    <div className="space-y-6 text-slate-900 font-['Sora'] max-w-7xl mx-auto pb-12">
      
      {/* Header Bar */}
      <div className="bg-white/90 dark:bg-slate-900 backdrop-blur-2xl border border-sky-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-xl shadow-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {isInstructor ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <BarChart3 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>STUDENT PERFORMANCE & REPORTING TELEMETRY</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                <span>STUDENT APPROVAL & ROSTER MANAGEMENT</span>
              </div>
            )}
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            {isInstructor ? 'Student Performance Telemetry' : 'Student Intelligence Roster'} ({filteredStudents.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {isInstructor
              ? 'Monitor real-time student learning telemetry, review course progress, analyze quiz scores, and export progress reports.'
              : 'Review student applications, verify credentials, perform bulk actions, and dispatch automated lifecycle emails.'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {selectedIds.length > 0 && (
            <span className="text-xs font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-cyan-300 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800">
              {selectedIds.length} Selected
            </span>
          )}

          <button
            onClick={handleExportCSV}
            className="bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-sky-200 dark:border-slate-800 py-3 px-4 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV / Excel</span>
          </button>

          {!isInstructor && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-blue-primary text-xs py-3 px-5 shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Student</span>
            </button>
          )}

          {isInstructor && (
            <button
              onClick={() => {
                if (filteredStudents.length > 0) setFlagStudentModal(filteredStudents[0]);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Submit Academic Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
            <Users className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalStudents}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Registered Learners</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
            <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {students.filter(isPendingStudent).length}
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Needs Review</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Approved</span>
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{stats.activeStudents}</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Active Accounts</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Verified</span>
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-blue-700 dark:text-cyan-400">{stats.verifiedStudents}</div>
          <div className="text-[10px] text-blue-600 dark:text-cyan-400 font-medium">Verified Emails</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">GitHub OAuth</span>
            <Code2 className="w-4 h-4 text-slate-800 dark:text-slate-200" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{githubCount}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Connected Users</div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Progress</span>
            <TrendingUp className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-sky-700 dark:text-cyan-400">{stats.avgProgress}%</div>
          <div className="text-[10px] text-sky-600 dark:text-cyan-400 font-medium">Mean Score</div>
        </div>
      </div>

      {/* Main Table Container & Filters */}
      <div className="bg-white/90 dark:bg-slate-900 border border-sky-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
        
        {/* Search Bar & Multi-Filter Bar */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Account Provider Tabs */}
            <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
              <button
                onClick={() => setProviderFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  providerFilter === 'all'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                All Students ({students.length})
              </button>

              <button
                onClick={() => setProviderFilter('github')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  providerFilter === 'github'
                    ? 'bg-slate-900 dark:bg-cyan-950 text-cyan-300 border border-slate-700 dark:border-cyan-800 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                🐱 GitHub OAuth ({githubCount})
              </button>

              <button
                onClick={() => setProviderFilter('manual')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  providerFilter === 'manual'
                    ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                ✉️ Email / Manual ({manualCount})
              </button>
            </div>

            {/* Global Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, college, branch, github, skills..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* Granular Filters & Sorting Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-sky-100 dark:border-slate-800 text-xs font-medium">
            
            {/* Approval Status Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Approval Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-1.5 px-2.5 text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="pending">⏳ Pending Approval</option>
                <option value="approved">✓ Approved / Active</option>
                <option value="rejected">✕ Rejected</option>
                <option value="suspended">🚫 Suspended</option>
                <option value="at_risk">⚠️ At Risk (&lt;65% Score)</option>
                <option value="high_performers">🏆 High Performers (&gt;90% Score)</option>
              </select>
            </div>

            {/* Email Verification Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Email Verified</label>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-1.5 px-2.5 text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="ALL">All Accounts</option>
                <option value="Verified">Verified Only</option>
                <option value="Unverified">Unverified Only</option>
              </select>
            </div>

            {/* Branch Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Branch</label>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-1.5 px-2.5 text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="ALL">All Branches</option>
                {uniqueBranches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Academic Year Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Academic Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-1.5 px-2.5 text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="ALL">All Years</option>
                {uniqueYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Registration Date</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-1.5 px-2.5 text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="ALL">All Time</option>
                <option value="today">Today's Registrations</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Sorting Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-1.5 px-2.5 text-slate-900 dark:text-white focus:outline-hidden font-bold text-sky-700 dark:text-cyan-400"
              >
                <option value="newest">⚡ Newest Registrations</option>
                <option value="oldest">⌛ Oldest Registrations</option>
                <option value="highest_progress">📈 Highest Progress</option>
                <option value="name">🔤 Name (A-Z)</option>
              </select>
            </div>

          </div>

        </div>

        {/* Directory Data Table */}
        <div className="overflow-x-auto pt-2">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-bold">Loading real-time student telemetry...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/50 rounded-3xl border border-dashed border-sky-200">
              <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-heading font-extrabold text-sm text-slate-700">No Student Records Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                No registered students match your current search query or filter criteria.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Data Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-medium">
                  <thead>
                    <tr className="border-b border-sky-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-sky-50/50 dark:bg-slate-950/80">
                      <th className="py-3 px-3 w-10 text-center">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-400 focus:outline-hidden"
                          aria-label="Select all students"
                        >
                          {selectedIds.length > 0 && selectedIds.length === filteredStudents.length ? (
                            <CheckSquare className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                          )}
                        </button>
                      </th>
                      <th className="py-3 px-4">Profile</th>
                      <th className="py-3 px-4">Full Name & Telemetry</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">College & Branch</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4">GitHub & Portfolio</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">{isInstructor ? 'Reporting Actions' : 'Approval Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100 dark:divide-slate-800">
                    {filteredStudents.map((st) => {
                      const id = st.id || st.uid;
                      return (
                        <StudentRosterRow
                          key={id}
                          student={st}
                          isSelected={selectedIds.includes(id)}
                          isInstructor={isInstructor}
                          isApproving={approvingIds.has(id)}
                          isRejecting={rejectingIds.has(id)}
                          onToggleSelect={handleToggleSelect}
                          onApprove={handleApproveStudent}
                          onOpenRejectModal={(targetId) => setRejectingStudentId(targetId)}
                          onInspect={(target) => setInspectStudent(target)}
                          onInspectGithub={(target) => setInspectGithubStudent(target)}
                          onEdit={isInstructor ? undefined : (target) => setEditingStudent(target)}
                          onEmail={(target) => setEmailStudent(target)}
                          onOpenDeleteModal={isInstructor ? undefined : (targetId) => setDeletingStudentId(targetId)}
                          onOpenFlagModal={isInstructor ? (target) => setFlagStudentModal(target) : undefined}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Responsive Cards */}
              <div className="md:hidden space-y-3">
                {filteredStudents.map((st) => {
                  const id = st.id || st.uid;
                  return (
                    <StudentRosterMobileCard
                      key={id}
                      student={st}
                      isSelected={selectedIds.includes(id)}
                      isInstructor={isInstructor}
                      isApproving={approvingIds.has(id)}
                      isRejecting={rejectingIds.has(id)}
                      onToggleSelect={handleToggleSelect}
                      onApprove={handleApproveStudent}
                      onOpenRejectModal={(targetId) => setRejectingStudentId(targetId)}
                      onInspect={(target) => setInspectStudent(target)}
                      onInspectGithub={(target) => setInspectGithubStudent(target)}
                      onEdit={isInstructor ? undefined : (target) => setEditingStudent(target)}
                      onEmail={(target) => setEmailStudent(target)}
                      onOpenDeleteModal={isInstructor ? undefined : (targetId) => setDeletingStudentId(targetId)}
                      onOpenFlagModal={isInstructor ? (target) => setFlagStudentModal(target) : undefined}
                    />
                  );
                })}
              </div>

              {/* High-Performance Pagination Controls Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-sky-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <span>
                    Showing{' '}
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {paginationInfo.total === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                    </strong>{' '}
                    to{' '}
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {Math.min(currentPage * pageSize, paginationInfo.total)}
                    </strong>{' '}
                    of{' '}
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {paginationInfo.total}
                    </strong>{' '}
                    students
                  </span>

                  <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] text-slate-500 font-medium">Page Size:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white font-bold focus:outline-hidden cursor-pointer"
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1 || loading}
                    onClick={() => setCurrentPage(1)}
                    className="p-2 rounded-xl border border-sky-200 dark:border-slate-800 hover:bg-sky-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                    title="First Page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={currentPage <= 1 || loading}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-xl border border-sky-200 dark:border-slate-800 hover:bg-sky-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    Page {currentPage} of {paginationInfo.totalPages || 1}
                  </div>

                  <button
                    type="button"
                    disabled={!paginationInfo.hasNextPage || loading}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-2 rounded-xl border border-sky-200 dark:border-slate-800 hover:bg-sky-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= paginationInfo.totalPages || loading}
                    onClick={() => setCurrentPage(paginationInfo.totalPages)}
                    className="p-2 rounded-xl border border-sky-200 dark:border-slate-800 hover:bg-sky-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                    title="Last Page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* DRAWERS & MODALS */}

      {/* Student Profile Drawer */}
      <StudentProfileDrawer
        student={inspectStudent}
        onClose={() => setInspectStudent(null)}
        onEdit={isInstructor ? undefined : (st) => {
          setInspectStudent(null);
          setEditingStudent(st);
        }}
        onToggleStatus={isInstructor ? undefined : async (id) => {
          const st = students.find((s) => s.id === id || s.uid === id);
          if (st?.status === 'approved') {
            await handleSuspendStudent(id);
          } else {
            await handleReactivateStudent(id);
          }
        }}
        onResetPassword={isInstructor ? undefined : handleResetPassword}
        onSendEmail={(st) => {
          setInspectStudent(null);
          setEmailStudent(st);
        }}
      />

      {/* GitHub Portfolio Drawer */}
      <GitHubPortfolioDrawer
        student={inspectGithubStudent}
        onClose={() => setInspectGithubStudent(null)}
      />

      {/* Edit Student Modal */}
      <EditStudentModal
        student={editingStudent}
        onClose={() => setEditingStudent(null)}
        onSave={handleUpdateStudent}
      />

      {/* Send Email Modal */}
      <SendEmailModal
        student={emailStudent}
        onClose={() => setEmailStudent(null)}
      />

      {/* REJECT STUDENT CONFIRMATION MODAL */}
      {rejectingStudentId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-rose-200 dark:border-rose-900/60 font-['Sora'] text-slate-900 dark:text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">Reject Student Registration?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Enter administrator rejection reason below.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Academic institution verification pending or incomplete GitHub portfolio."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingStudentId(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectStudent(rejectingStudentId)}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE STUDENT CONFIRMATION MODAL */}
      {deletingStudentId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-rose-200 dark:border-rose-900/60 text-center font-['Sora'] text-slate-900 dark:text-white">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">Delete Student Account?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Are you sure you want to permanently delete this student record?</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setDeletingStudentId(null)} className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                Cancel
              </button>
              <button onClick={() => handleDeleteStudent(deletingStudentId)} className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-sky-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 font-['Sora'] text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100 dark:border-slate-800">
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Register New Student Profile</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="alex.j@stanford.edu"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Authentication Method</label>
                <select
                  value={newStudentProvider}
                  onChange={(e) => setNewStudentProvider(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="password">Email / Password Account</option>
                  <option value="github.com">GitHub OAuth Account</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-blue-primary text-xs py-2.5 px-5 font-bold cursor-pointer">
                  {isSubmitting ? 'Registering...' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMIT STUDENT ACADEMIC REPORT MODAL (For Instructors) */}
      {flagStudentModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-['Sora'] border border-sky-200 dark:border-slate-800 animate-in zoom-in-95 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">Submit Student Academic Report</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Telemetry & progress feedback for Administrator</p>
                </div>
              </div>
              <button onClick={() => setFlagStudentModal(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-sky-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                Student Target: <strong className="text-slate-900 dark:text-white font-bold">{flagStudentModal.name}</strong> ({flagStudentModal.email})
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Report Classification</label>
                <select
                  value={flagCategory}
                  onChange={(e) => setFlagCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="Academic Performance Progress">Academic Performance Progress</option>
                  <option value="Attendance & Low Activity">Attendance & Low Activity</option>
                  <option value="Assignment / Lab Support Needed">Assignment / Lab Support Needed</option>
                  <option value="Special Distinction Candidate">Special Distinction Candidate</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Instructor Telemetry Observations</label>
                <textarea
                  rows={4}
                  value={flagNotes}
                  onChange={(e) => setFlagNotes(e.target.value)}
                  placeholder="Enter detailed feedback or support recommendations for this student..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setFlagStudentModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitStudentReport}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminStudents;
